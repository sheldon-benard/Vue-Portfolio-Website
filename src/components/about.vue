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

      <h1> About Me </h1>
       <div class="paragraph">
        <p>
            Hi! I'm Sheldon Benard, and I'm a 4th year Computer Science and Mathmatics student at McGill University. I am also doing a Minor in Statistics. 
            I'm very interested in Machine Learning, Data Science, and utilizing data to make informed decisions.</p>
        <p>
            Currently, I'm working at BMO Capital Markets as a Quantitative Analyst. There, I've mainly been doing full-stack development in both C# and Javascript (Vue.js). For some side projects, we've also worked on some Blockchain technologies and we are starting a machine learning project shortly.
        </p>

        <p> 
          I am returning to school in the fall, for my final semester. I am going to be taking:
        </p>
        <ul>
          <li> Machine Learning (Comp 652 - Graduate Level)</li>
          <li> Introduction to Time Series Analysis (Math 545)</li>
          <li> Distributed Systems (Comp 512)</li>
          <li> Regression and Analysis of Variance (Math 423)</li>
          <li> Numerical Analysis (Math 317)</li>
        </ul>
        <!-- <ul>
          <li> <b>Country Assignment Automation:</b> Redo my <a href="https://github.com/sheldon-benard/CA_Automation" target="_blank">CA project</a>. This will automate the assignment of countries to delegates for Model United Nations conferences
          </li>
          <li>
            <b> Audit Financial Courses:</b> Audit the <a href="https://www.coursera.org/specializations/wharton-business-financial-modeling" target="_blank">Business and Financial Modeling Specialization</a> coursera course.
          </li>
           <li>
            <b> Kaggle Competitions:</b> Participate in some kaggle competitions
          </li>
          <li>
            <b> Machine Learning for Horse Racing:</b> Try and apply machine learning to horse racing
          </li>
          <li>
            <b> Blockchain Development:</b> Learn and develop first blockchain project
          </li> 

        </ul> -->
      </div> 

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

h4 {
  color: #bbb;
  text-align: left;
}

.nav {

  display: flex;

}

p {
  color: #bbb;
  text-align: left;
}

.paragraph {
/*    padding-left: 150px;
    padding-right: 150px;*/
    width: 65%;
    margin-left: auto;
    margin-right: auto;
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