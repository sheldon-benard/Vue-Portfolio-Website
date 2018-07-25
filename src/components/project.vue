<template>
	<div class="project">
	    <div class="nav-box">
	      <div class="nav">
	        <router-link class="nav-link" 
	            v-for="item in menu" 
	            :to="item.link">
	          <span>{{item.text}}</span>
	        </router-link>
	      </div>
      </div>

  <div class="project-item" v-for="project in projects">
     <h2>{{project.name}}</h2>
     <p><b>Description</b><br>{{project.desc}}</p>
     <p><b>Languages</b><br>{{project.languages}}</p>
     <p><b>Libraries</b><br>{{project.libraries}}</p>
     <br>
     <a :href="project.github" target="_blank"><img src="../assets/img/GitHub_Logo_White.png"></a>

  </div>

<!--   <div class="project-item">Digit Classification </div>
  <div class="project-item">Digit Classification </div> -->

	</div>

</template>

<script>
var proj = require('./proj.json')
export default {
  name: 'project',
  data () {
    return {
      menu: [
        {text: 'Home', link: '/'},
        {text: 'About', link: '/about'},
        {text: 'Projects', link: '/projects'},
        {text: 'Contact', link: '/contact'}
      ],
      projects: proj

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
	justify-content: center;
  padding-bottom: 15px;
  font-weight: 200px;
  color: #bbb;
  border-bottom: 1px solid white;
}

h3 {
	font-weight: normal;
	color: #42b983;
}

h4 {
  color: #bbb;
  text-align: left;
}

.nav {

  display: flex;

}

img {
  height: 50%;
  width: 50%;
}

p {
  color: #bbb;
  text-align: center;
}

.project-item{
  display: inline-block;
  height: 500px;
  width: 350px;
  border: 1px solid #bbb;
  margin-top: 50px;
  margin-left: 30px;
  background-color: #14151a;
}
.nav-link:hover {
    color: #eee;
}

ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 5px 30px;
  color: #42b983;
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
</style>