<template>
  <div id="app">
      <router-view/>
      <particles/>
  </div>
</template>

<script>
import particles from "./components/particles";

export default {
  name: "App",
  components: {
    particles
  }
};
</script>

<style>
  [v-cloak] {
    display: none;
  }

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  /* display: flex; */
  /* height: 100%; */
  /*justify-content: center;*/
  align-items: center;
  flex-direction: column;

  /* background-color: #14151a; */
}
</style>
