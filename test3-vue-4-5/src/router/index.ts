import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import Pages from '../pages/index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/pages'
  },
  {
    path: '/pages',
    name: 'pages',
    component: Pages
  },
  {
    path: '/test1',
    name: 'test1',
    component: () => import('../pages/test1.vue')
  },
  {
    path: '/test2',
    name: 'test2',
    component: () => import('../pages/test2.vue')
  },
  {
    path: '/test3',
    name: 'test3',
    component: () => import('../pages/test3.vue')
  },
  {
    path: '/test4',
    name: 'test4',
    component: () => import('../pages/test4.vue')
  },
  {
    path: '/test5',
    name: 'test5',
    component: () => import('../pages/test5.vue')
  },
  {
    path: '/test6',
    name: 'test6',
    component: () => import('../pages/test6.vue')
  },
  {
    path: '/test7',
    name: 'test7',
    component: () => import('../pages/test7.vue')
  },
  {
    path: '/test8',
    name: 'test8',
    component: () => import('../pages/test8.vue')
  },
  {
    path: '/test9',
    name: 'test9',
    component: () => import('../pages/test9.vue')
  },
  {
    path: '/test10',
    name: 'test10',
    component: () => import('../pages/test10.vue')
  },
  {
    path: '/test11',
    name: 'test11',
    component: () => import('../pages/test11.vue')
  },
  {
    path: '/test12',
    name: 'test12',
    component: () => import('../pages/test12.vue')
  },
  {
    path: '/test13',
    name: 'test13',
    component: () => import('../pages/test13.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
