import {createRouter, createWebHashHistory } from 'vue-router';

const routes = [];

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 导航守卫
// eslint-disable-next-line
router.beforeEach((to, from)=>{
  return true;
})

export default router;