import React, { lazy, ReactNode, Suspense, useEffect } from 'react';
import { useRoutes, RouteObject, useNavigate } from 'react-router-dom';
// import { Navigate } from 'react-router-dom';
import App from '../pages/app';
const Test1 = lazy(() => import('../pages/test1'));
const Test2 = lazy(() => import('../pages/test2'));
const Test3 = lazy(() => import('../pages/test3'));
const Test4 = lazy(() => import('../pages/test4'));
const Test5 = lazy(() => import('../pages/test5'));
const Test6 = lazy(() => import('../pages/test6'));
const Test7 = lazy(() => import('../pages/test7'));
const Test8 = lazy(() => import('../pages/test8'));
const Test9 = lazy(() => import('../pages/test9'));
const Test10 = lazy(() => import('../pages/test10'));

const lazyLoad = (children: ReactNode) => {
  return (<Suspense fallback={<div>loading</div>}>
    {children}
  </Suspense>)
}

export default function Router() {
  const router: RouteObject[] = [
    {
      path: '/',
      element: <App />
    },
    {
      path: '/test1',
      element: lazyLoad(<Test1></Test1>),
    },
    {
      path: '/test2',
      element: lazyLoad(<Test2></Test2>),
      // children: [
      //   {
      //     index:true,
      //     element:lazyLoad(<Validate><Home/></Validate>)
      //   },
      // ]
    },
    {
      path: '/test3',
      element: lazyLoad(<Test3></Test3>)
    },
    {
      path: '/test4',
      element: lazyLoad(<Test4></Test4>)
    },
    {
      path: '/test5',
      element: lazyLoad(<Test5></Test5>)
    },
    {
      path: '/test6',
      element: lazyLoad(<Test6></Test6>)
    },
    {
      path: '/test7',
      element: lazyLoad(<Test7></Test7>)
    },
    {
      path: '/test8',
      element: lazyLoad(<Test8></Test8>)
    },
    {
      path: '/test9',
      element: lazyLoad(<Test9></Test9>)
    },
    {
      path: '/test10',
      element: lazyLoad(<Test10></Test10>)
    },
    {
      path: '*',
      element: (<div>404 not found</div>)
    }
  ];

  return useRoutes(router);
}