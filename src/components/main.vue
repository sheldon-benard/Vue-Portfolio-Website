<template>
      
  <div class="main">
    <div class="nav-box">
      <div class="nav">
        <router-link class="nav-link" 
            v-for="item in menu" 
            :to="item.link">
          <span>{{item.text}}</span>
        </router-link>
      </div>
    </div>

    <img src="../assets/prof.png">

    <h1>{{ msg }}</h1>
    <ul>
      <li>
        <a
          href="/static/Benard_Sheldon_Resume.pdf"
          target="_blank"
        >
          CV/Resume
        </a>
      </li>
      <li>
        <a
          href="/static/Benard_Sheldon_General_Cover_Letter.pdf"
          target="_blank"
        >
          Cover Letter
        </a>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'main',
  data () {
    return {
      menu: [
        {text: 'Home', link: '/'},
        {text: 'About', link: '/about'},
        {text: 'Projects', link: '/projects'},
        {text: 'Contact', link: '/contact'}
      ],
      msg: 'Sheldon Benard'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

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

img {
  padding-top: 45px;
}

h1 {
  padding-top: 25px;
}

h1, h2 {
  font-weight: normal;
  color: #bbb;
}

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 20px;
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
