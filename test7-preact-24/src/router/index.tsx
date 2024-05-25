import React, { lazy, ReactNode, Suspense, useEffect } from 'react';
import { useRoutes, RouteObject, useNavigate, Routes, Route } from 'react-router-dom';
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

  return (
    <Routes>
      <Route path='/' element={<App />}></Route>
      <Route path='/test1' element={lazyLoad(<Test1 />)}></Route>
      <Route path='/test2' element={lazyLoad(<Test2 />)}></Route>
      <Route path='/test3' element={lazyLoad(<Test3 />)}></Route>
      <Route path='/test4' element={lazyLoad(<Test4 />)}></Route>
      <Route path='/test5' element={lazyLoad(<Test5 />)}></Route>
      <Route path='/test6' element={lazyLoad(<Test6 />)}></Route>
      <Route path='/test7' element={lazyLoad(<Test7 />)}></Route>
      <Route path='/test8' element={lazyLoad(<Test8 />)}></Route>
      <Route path='/test9' element={lazyLoad(<Test9 />)}></Route>
      <Route path='/test10' element={lazyLoad(<Test10 />)}></Route>
      <Route path='*' element={(<div>404 not found</div>)}></Route>
    </Routes>
  );

  // return (<>
  //   <Routes>
  //     <Route path='/' element={<Login />}></Route>
  //     <Route path='/home' element={<Home />}>
  //       <Route index element={<Access isAccess={true} children={<User />}></Access>}></Route>
  //       <Route path='detail/:id' element={<Detail />}></Route>
  //       <Route path='role' element={lazyLoad(<Role />)}></Route>
  //     </Route>
  //   </Routes>
  // </>)
}