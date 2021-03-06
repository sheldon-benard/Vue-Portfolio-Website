import Vue from 'vue'
import Router from 'vue-router'
import main from '@/components/main'
import contact from '@/components/contact'
import about from '@/components/about'
import project from '@/components/project'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: main
    },
    {
    	path: '/contact',
    	name: 'contact',
    	component: contact
    },
    {
    	path: '/about',
    	name: 'about',
    	component: about
    },
    {
    	path: '/projects',
    	name: 'projects',
    	component: project
    },

    {
    	path: '*',
    	name: 'main',
    	component: main
    }
  ]


})
