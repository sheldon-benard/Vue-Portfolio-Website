import Vue from 'vue'
import Router from 'vue-router'
import main from '@/components/main'
import contact from '@/components/contact'
import about from '@/components/about'

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
    	path: '*',
    	name: 'main',
    	component: main
    }
  ]


})
