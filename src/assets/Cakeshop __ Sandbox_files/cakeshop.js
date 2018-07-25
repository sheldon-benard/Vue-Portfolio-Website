(function() {
    var Client = window.Client = {};
    _.extend(Client, Backbone.Events);

    Client.post = function(url, data) {
        if (!_.isString(data)) {
            data = JSON.stringify(data);
        }

        return $.ajax({
            url: url,
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: data,
        });
    };

    Client._stomp_subscriptions = {};
    Client.subscribe = function(topic, handler) {
        Client._stomp_subscriptions[topic] = {topic: topic, handler: handler};
        if (Client.stomp && Client.stomp.connected === true) {
            console.log('STOMP subscribing to ' + topic);

            var sub = Client.stomp.subscribe(topic, function(res) {
                handler(JSON.parse(res.body));
            });
            Client._stomp_subscriptions[topic].fh = sub;
            return sub;
        }
        return false;
    };

	$(window).on("beforeunload", function() {
		if (!(Client.stomp && Client.stomp.connected === true)) {
			return;
		}
		_.values(Client._stomp_subscriptions).forEach(function(sub) {
			if (sub && sub.fh) {
				sub.fh.unsubscribe();
			}
		});
		Client.stomp.disconnect();
	});

    Client.connected = false;
    Client.connect = function() {

        // try to derive the websocket location from the current location
        var pathname = window.location.pathname;
        var wsUrl;
        if (/^\/[\w-.]*\/$/.test(pathname)) {
          // e.g. '/cakeshop/' -> '/cakeshop/ws'
          wsUrl = pathname + 'ws';
        } else if (/^\/[\w-.]*$/.test(pathname)) {
          // e.g. '/cakeshop' -> '/cakeshop/ws'
          wsUrl = pathname + '/ws';
        } else {
          // otherwise just fall back to a safe value
          wsUrl = '/cakeshop/ws';
        }

        var stomp = Client.stomp = Stomp.over(new SockJS(wsUrl));

        stomp.debug = null;
        stomp.connect({},
            function(frame) {
                Client.connected = true;
                console.log("Connected via STOMP!");
                Client.trigger("stomp:connect");
                // reconnect all topic subscriptions
                _.each(Client._stomp_subscriptions, function(sub, topic) {
                    Client.subscribe(topic, sub.handler);
                });
            },
            function(err) {
                if (Client.connected) {
                    console.log("Lost STOMP connection", err);
                    Client.trigger("stomp:disconnect");
                }
                setTimeout(Client.connect, 1000); // always reconnect
            }
        );
	};

    Client.connect();
})();


(function() {

    var Account = window.Account = Backbone.Model.extend({

        urlRoot: "api/wallet",
        url: function(path) {
            return this.urlRoot + (path ? "/" + path : "");
        },

        initialize: function() {
            this.id = this.get("address");
        },

        humanBalance: function() {
            var b = parseInt(this.get("balance"), 10) / 1000000000000000000;
            return (b > 1000000000) ? '∞' : b.toFixed(2);
        },

    });

    Account.list = function() {
        return new Promise(function(resolve, reject) {
            Client.post(Account.prototype.url('list')).
                done(function(res, status, xhr) {
                    if (res.data && _.isArray(res.data)) {
                        var accounts = [];
                        res.data.forEach(function(d) {
                            var c = new Account(d.attributes);
                            accounts.push(c);
                        });
                        resolve(accounts);
                    }
                });
        });
    };

})();


(function() {

    var Contract = window.Contract = Backbone.Model.extend({

        urlRoot: 'api/contract',
        url: function(path) {
            return this.urlRoot + (path ? '/' + path : '');
        },

        initialize: function() {
            this.id = this.get('address');
            if (this.get("abi") && this.get("abi").length > 0) {
                this.abi = JSON.parse(this.get("abi"));
                this.proxy = new Contract.Proxy(this);
            }
        },

        getMethod: function(methodName) {
            if (!this.abi) {
                return null;
            }
            return _.find(this.abi, function(m) { return m.type === "function" && m.name === methodName; });
        },

        readState: function() {
            var contract = this;
            return new Promise(function(resolve, reject) {
                if (!contract.abi) {
                    return reject();
                }

                var promises = [];
                contract.abi.forEach(function(method) {
                    // read all constant methods with no inputs
                    if (method.constant === true && method.inputs.length === 0) {
                        promises.push(new Promise(function(resolve, reject) {
                            contract.proxy[method.name]().then(function(res) {
                                resolve({method: method, result: res});
                            });
                        }));
                    }
                });
                Promise.all(promises).then(
                    function(results) {
                        contract.readMappingState(results, resolve);
                    },
                    reject);
            });
        },

        readMappingState: function(results, resolve) {
            var contract = this;
            var contract_mappings = _.find(
                Contract.parseSource(contract.get("code")),
                function(c) { return c.name === contract.get("name"); }
            );

            var state = results;
            if (!contract_mappings || contract_mappings.mappings.length <= 0) {
                contract._current_state = results;
                return resolve(results);
            }

            state = _.reject(results, function(r) {
                var matches = _.find(contract_mappings.mappings, function(m) {
                    return (r.method.name === m.counter || r.method.name === m.keyset || r.method.name === m.getter); });
                if (matches) {
                    return true;
                } else {
                    return false;
                }
            });

            // now that we filtered our special vars out, add back in a mapping var/table
            contract_mappings.mappings.forEach(function(mapping) {
                var data = { method: { name: mapping.var } };
                state.push(data);

                var res = {};
                var getter_results = _.find(results, function(r) { return r.method.name === mapping.getter; });
                var promises = [];
                getter_results.result.forEach(function(gr) {
                    promises.push(new Promise(function(resolve, reject) {
                        contract.proxy[mapping.var]({args: [gr]}).then(function(mapping_val) {
                            var d = {};
                            d[gr] = mapping_val;
                            resolve(d);
                        });
                    }));
                });
                Promise.all(promises).then(function(mapping_results) {
                    // convert mapping_results array back into single object
                    data.result = _.reduce(mapping_results, function(memo, r) { return _.extend(memo, r); }, {});
                    contract._current_state = state;
                    resolve(state);
                });

            });
        },

        /**
         * Returns result of read call via Promise.
         *
         * NOTE: this is a low-level method and not generally meant to be
         *       called directly. Instead, use the proxy method.
         */
        read: function(options) {
            var contract = this;
            return new Promise(function(resolve, reject) {
                Client.post(contract.url('read'),
                    {
                        from: options.from,
                        address: contract.id,
                        method: options.method,
                        args: options.args
                    }
                ).done(function(res, status, xhr) {
                    resolve(res.data); // return read result

                }).fail(function(xhr, status, errThrown) {
                    if (xhr.responseJSON && xhr.responseJSON.errors) {
                        console.log('READ FAILED!!', xhr.responseJSON.errors);
                        reject(xhr.responseJSON.errors);
                    } else {
                        console.log('READ FAILED!!', errThrown);
                        reject(errThrown); // generic error
                    }
                });

            });
        },

        /**
         * Returns a Transaction ID via Promise
         *
         * NOTE: this is a low-level method and not generally meant to be
         *       called directly. Instead, use the proxy method.
         */
        transact: function(options) {
            var contract = this;
            return new Promise(function(resolve, reject) {
                Client.post(contract.url('transact'),
                    {
                        from: options.from,
                        address: contract.id,
                        method: options.method,
                        args: options.args,
                        privateFrom: options.privateFrom,
                        privateFor: options.privateFor,
                    }
                ).done(function(res, status, xhr) {
                    resolve(res.data.id); // return tx id

                }).fail(function(xhr, status, errThrown) {
                    console.log('TXN FAILED!!', status, errThrown);
                    reject(errThrown);
                });

            });
        },
    });

    Contract.deploy = function(code, optimize, args, binary, privateFrom, privateFor) {
        return new Promise(function(resolve, reject) {
            Client.post(Contract.prototype.url('create'),
                {
                    code: code,
                    code_type: 'solidity',
                    optimize: optimize,
                    args: args,
                    binary: binary,
                    privateFrom: privateFrom,
                    privateFor: privateFor,
                }
            ).done(function(res, status, xhr) {
                var txid = res.data.id;
                Transaction.waitForTx(txid).then(function(tx) {
                    resolve(tx.get('contractAddress'));
                });
            }).fail(function(xhr, status, errThrown) {
                if (xhr.responseJSON && xhr.responseJSON.errors) {
                    console.log('Contract creation failed', xhr.responseJSON.errors);
                    reject(xhr.responseJSON.errors);
                } else {
                    console.log('Contract creation failed', errThrown);
                    reject(errThrown); // generic error
                }
            });
        });
    };

    Contract.get = function(id) {
        return new Promise(function(resolve, reject) {
            Client.post(Contract.prototype.url('get'), { address: id }).
                done(function(res, status, xhr) {
                    resolve(new Contract(res.data.attributes));
                }).
				fail(function(xhr, status, errThrown) {
                    console.log('Contract load FAILED!!', status, errThrown);
                    reject(errThrown);
                });
        });
    };

    Contract.list = function(cb) {
        Client.post(Contract.prototype.url('list')).
            done(function(res, status, xhr) {
                if (res.data && _.isArray(res.data)) {
                    var contracts = [];
                    res.data.forEach(function(d) {
                        var c = new Contract(d.attributes);
                        contracts.push(c);
                    });
                    if (cb) {
                        cb(contracts);
                    }
                }
            });
    };

    Contract.compile = function(code, optimize, cb) {
        return new Promise(function(resolve, reject) {
            Client.post(Contract.prototype.url('compile'),
                {
                    code: code,
                    code_type: 'solidity',
                    optimize: optimize
                }
            ).done(function(res, status, xhr) {
                if (res.data && _.isArray(res.data)) {
                    var contracts = [];
                    res.data.forEach(function(d) {
                        var c = new Contract(d.attributes);
                        contracts.push(c);
                    });
                    resolve(contracts);
                }
            }).fail(function(xhr, status, errThrown) {
                try {
                    var errors = xhr.responseText ? JSON.parse(xhr.responseText).errors : null;
                    reject(errors);
                } catch (e) {
                    reject(null);
                }
            });
        });
    };



    //--------------------------------------------------------------------------
    // Methods for implementing the '##mapping' macro

    Contract.preprocess = function(src) {
        var contracts = Contract.parseSource(src);
        return _.map(contracts, function(c) { return (c.modified_src ? c.modified_src : c.src); }).join("\n");
    };

    Contract.parseSource = function(src) {
        var contracts = [];

        // Find each contract definition
        var c = [], contract_name;
        src.split(/\n/).forEach(function(line) {
            var matches = line.match(/contract +(.*?)( +is.*?)? *\{/);
            if (matches) {
                if (c && c.length > 0) { // found a new contract, add prev one to array
                    contracts.push({name: contract_name, src: c.join("\n")});
                    c = [];
                    contract_name = null;
                }

                contract_name = matches[1];
                c = [line];
                if (line.match(/\{[^\{]*?\}/)) { // single-line contract def
                    contracts.push({name: contract_name, src: c.join("\n")});
                    c = [];
                    contract_name = null;
                }
            } else {
                c.push(line);
            }
        });
        if (c && c.length > 0) { // push after EOF
            contracts.push({name: contract_name, src: c.join("\n")});
        }

        // search each contract definition for our ##mapping macro
        contracts.forEach(function(c) {
            c.mappings = [];
            var matches = c.src.match(/^ *\/\/ *##mapping +(.+?)$/m);
            if (matches) {
                var mapping_var = matches[1];


                matches = c.src.match(new RegExp("mapping *\\((.+?) => (.+?)\\) *.*? " + mapping_var + " *;"));
                if (matches) {
                    var key_type = matches[1],
                        val_type = matches[2];

                    var mapping = {
                        var:      mapping_var,
                        key_type: key_type,
                        val_type: val_type
                    };
                    c.mappings.push(mapping);

                    // now that we have all the mapping info, modify the original source
                    c.modified_src = Contract.expose_mapping(c.src, mapping);
                    // console.log(c);
                }
            }
        });

        return contracts;
    };

    Contract.expose_mapping = function(src, mapping) {

        var counter = mapping.counter = "__" + mapping.var + "_num_ids";
        var keyset  = mapping.keyset  = "__" + mapping.var + "_ids";
        var getter  = mapping.getter  = "__get_" + mapping.var + "_ids";

        // skip if the src has already been modified
        if (src.match(new RegExp(counter))) {
            return src;
        }

        var msrc = "";

        src.split(/\n/).forEach(function(line) {
            var map_set = line.match(new RegExp(mapping.var + "\\[(.*?)\\] *="));
            if (line.match(new RegExp("^ *\\/\\/ *##mapping +" + mapping.var + "$", "m"))) {
                msrc += line + "\n";
                // attach helper vars
                msrc += "uint public " + counter + ";\n";
                msrc += mapping.key_type + "[] public " + keyset + ";\n";
                msrc += "function " + getter + "() public constant returns(" + mapping.key_type + "[] _ids) {\n";
                msrc += "  return " + keyset + ";\n";
                msrc += "}\n";

            } else if (map_set) {
                msrc += line + "\n";
                msrc += keyset + ".length = ++" + counter + ";\n"; // grow array
                msrc += keyset + "[" + counter + "-1] = " + map_set[1] + ";"; // store key

            } else {
                msrc += line + "\n";
            }

        });

        return msrc;
    };


})();


(function() {

    Contract.Proxy = (function() {
        function Proxy(contract) {
            this._contract = contract;
            if (!contract.abi) {
                return;
            }
            var proxy = this;
            contract.abi.forEach(function(method) {
                if (method.type !== "function") {
                    return;
                }

                /**
                 * Process args based on ABI definitions
                 */
                function processInputArgs(args) {
                    var inputs = method.inputs;
                    var ret = [];

                    for (var i = 0; i < inputs.length; i++) {
                        var input = inputs[i],
                            arg   = args[i];
                        if (input.type.match(/^bytes\d+$/)) {
                            // base64 encode bytes
                            ret.push(Sandbox.encodeBytes(arg));
                        } else {
                            // all other input types, just accumulate
                            ret.push(arg);
                        }
                    }

                    return ret;
                }

                /**
                 * Process results based on ABI definitions
                 */
                function processOutputArgs(results) {
                    var outputs = method.outputs;

                    // console.log("outputs", outputs);
                    // console.log("results", results);

                    var ret = [];
                    for (var i = 0; i < outputs.length; i++) {
                        var output = outputs[i],
                            result = results[i];
                        if (output.type.match(/^bytes\d+$/)) {
                            // base64 decode bytes
                            ret.push(Sandbox.decodeBytes(result));
                        } else if (output.type.match(/^bytes\d+\[\d*\]$/) && _.isArray(result)) {
                            // console.log("decoding result bytes32[]", result);
                            // base64 decode arrays of bytes
                            result = _.map(result, function(v) { return Sandbox.decodeBytes(v); });
                            // console.log("decoded ", result);
                            ret.push(result);
                        } else {
                            // all other input types, just accumulate
                            ret.push(result);
                        }
                    }

                    if (outputs.length === 1) {
                        return ret[0]; // hmmm?
                    }
                    return ret;
                }

                // attach method to proxy
                proxy[method.name] = function(options) {
                    if (_.isNull(options) || _.isUndefined(options)) {
                        options = {from: null, args: []};
                    }

                    // process arguments based on ABI
                    options.args = processInputArgs(options.args);
                    options.method = method.name;

                    return new Promise(function(resolve, reject) {
                        if (method.constant === true) {
                            contract.read(options).then(function(res) {
                                resolve(processOutputArgs(res));
                            }, function(err) {
                                reject(err);
                            });
                        } else {
                            contract.transact(options).then(function(txId) {
                                resolve(txId);
                            }, function(err) {
                                reject(err);
                            });
                        }
                    });
                };
            });
        }

        return Proxy;
    })();

})();


(function() {

    var Node = window.Node = Backbone.Model.extend({

        urlRoot: "api/node",
        url: function(path) {
            return this.urlRoot + (path ? "/" + path : "");
        },

        initialize: function() {
            this.id = this.get("id");
        },

    });

    // Subscribe to Node status changes
    Node.subscribe = function(handler) {
        Client.subscribe("/topic/node/status", function(res) {
            handler(new Node(res.data.attributes));
        });
    };

    Node.get = function() {
        return new Promise(function(resolve, reject) {
            Client.post(Node.prototype.url('get')).
                done(function(res, status, xhr) {
                    resolve(new Node(res.data.attributes));
                });
        });
    };

    Node.update = function(settings) {
        return new Promise(function(resolve, reject) {
            Client.post(Node.prototype.url('update'), settings).
                done(function(res, status, xhr) {
                    resolve(new Node(res.data.attributes));
                });
        });
    };

})();


(function() {

    var Transaction = window.Transaction = Backbone.Model.extend({

        urlRoot: "api/transaction",
        url: function(path) {
            return this.urlRoot + (path ? "/" + path : "");
        },

        initialize: function() {
            this.id = this.get("address");
        },

    });

    Transaction.waitForTx = function(txId) {
        return new Promise(function(resolve, reject) {
            var sub = Client.stomp.subscribe("/topic/transaction/" + txId, function(res) {
                sub.unsubscribe(); // stop listening to this tx
                var txRes = JSON.parse(res.body);
                if (txRes.data && txRes.data.id === txId) {
                    resolve(new Transaction(txRes.data.attributes));
                }
            });
        });
    };

})();
