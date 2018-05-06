<template>
	<div class="contact">
	    <div class="nav-box">
	      <div class="nav">
	        <router-link class="nav-link" 
	            v-for="item in menu" 
	            :to="item.link">
	          <span>{{item.text}}</span>
	        </router-link>
	      </div>
	    </div>

	    <h1> Contact Information </h1>

	    <div v-for="item in info">
	    	<h2>{{item.header}}</h2> <h3>{{item.content}}</h3>
	    </div>

	    <h2>LinkedIn</h2> <a href="https://www.linkedin.com/in/sheldon-benard-7aa488ab/" target="_blank"> CLICK HERE! </a>

	</div>

</template>

<script>

export default {
  name: 'contact',
  data () {
    return {
      menu: [
        {text: 'Home', link: '/'},
        {text: 'About', link: '/about'},
        {text: 'Projects', link: '/projects'},
        {text: 'Contact', link: '/contact'}
      ],
      info: [
      	{header: 'School Email', content: 'sheldon.benard@mail.mcgill.ca'},
      	{header: 'Cell-Phone', content: '780-718-3645'},
      ]
    }
  }
}

</script>


<style scoped>

h1 {
  font-weight: 500px;
  font-size: 40px;
  color: #bbb;
  padding-bottom: 40px;
}

h2 {
	padding-top: 15px;
  font-weight: 200px;
  color: #bbb;
}

h3 {
	font-weight: normal;
	color: #42b983;
}

.nav {

  display: flex;

}
.nav-link {
    color: #bbb;
    font-weight: 300;
    justify-content: center;
    flex-flow: row wrap;
    /*padding: 50px 100px 90px 100px;*/
    width: 300px;
    height: 70px;
    padding-top: 50px;
    flex: 1;
    text-transform: uppercase;
    text-shadow: 0px 5px 10px #050505;
    -webkit-text-shadow: 0px 5px 10px #050505;
    -moz-text-shadow: 0px 5px 10px #050505;
    transition: 0.40s all ease;
    text-decoration: none;
}
.nav-link:hover {
    color: #eee;
}
a {
    color: #42b983;
    font-weight: 300;
    display: inline-block;
    padding-top: 5px;
    text-transform: uppercase;
    text-shadow: 0px 5px 10px #050505;
    -webkit-text-shadow: 0px 5px 10px #050505;
    -moz-text-shadow: 0px 5px 10px #050505;
    transition: 0.40s all ease;
    /*text-decoration: none;*/
}
</style>