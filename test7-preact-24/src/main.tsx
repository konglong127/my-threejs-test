import { render } from 'preact';
import './index.css';
import { HashRouter } from 'react-router-dom';
import { Suspense } from 'preact/compat';
import AppRoutes from "@/router/index.tsx";

render(<>
  <HashRouter>
    <Suspense fallback={<div>loading</div>}>
      <AppRoutes />
    </Suspense>
  </HashRouter>
</>, document.getElementById('app')!);
