import { RouteRecordRaw } from 'vue-router';
import { RoutePath } from '@/constants/enums/RoutePath';
import component from '*.vue';

const routeComponent = (view: string, name: string) => () =>
  import(/* webpackChunkName: "[request]" */ `@/views/${view}/${name}.vue`);
const devopsChildrenComponent = (page: string, name: string) => () =>
  import(
    /* webpackChunkName: "[request]" */ `@/views/DevOps/contents/${page}/${name}.vue`
  );

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: RoutePath.홈,
  },
  {
    path: '/home',
    name: 'Home',
    component: routeComponent('Home', 'HomeView'),
  },
  {
    path: '/DevOps',
    name: 'DevOps',
    component: routeComponent('DevOps', 'DevOpsView'),
    children: [
      {
        path: '/DevOps/Home/Welcome',
        component: devopsChildrenComponent('Home', 'WelcomeDevops'),
      },
      {
        path: '/DevOps/DevSupport/ALM',
        component: devopsChildrenComponent('DevSupport', 'AlmSupport'),
      },
      {
        path: '/DevOps/DevSupport/DevTools',
        component: devopsChildrenComponent('DevSupport', 'DevToolsSupport'),
      },
      {
        path: '/DevOps/AboutJSTF/WhatisJSTF',
        component: devopsChildrenComponent('AboutJSTF', 'WhatJSTF'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFIntroduction',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFIntroduction'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFGoals',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFGoal'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFUsage',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFUsage'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFDemoSHV',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFShv'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFDemoSIV',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFSiv'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFDemoSDV',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFSdv'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFDemoTIV',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFTiv'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFFAQ',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFFaq'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFLicense',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFLicense'),
      },
      {
        path: '/DevOps/AboutJSTF/JSTFDownload',
        component: devopsChildrenComponent('AboutJSTF', 'JSTFDownload'),
      },
      {
        path: '/DevOps/Community/Contributors',
        component: devopsChildrenComponent('Community', 'ComuContributor'),
      },
    ],
  },
];

export default routes;
