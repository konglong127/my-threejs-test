import { render } from 'preact'
// import { App } from './app.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom';
import { Suspense } from 'react';
import AppRoutes from './router/index';

render((<>
  <HashRouter>
    <Suspense fallback={<div>loading</div>}>
      <AppRoutes />
    </Suspense>
  </HashRouter>
</>), document.getElementById('app')!)
