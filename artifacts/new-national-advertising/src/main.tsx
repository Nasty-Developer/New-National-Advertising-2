import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { getFirebaseIdToken } from './lib/firebase-client';

import './index.css';

setBaseUrl(import.meta.env.VITE_API_URL || null);
setAuthTokenGetter(getFirebaseIdToken);

function dismissInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (!loader || loader.classList.contains('initial-loader--exiting')) return;
  loader.classList.add('initial-loader--exiting');
  window.setTimeout(() => loader.remove(), 450);
}

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

requestAnimationFrame(() => requestAnimationFrame(dismissInitialLoader));
window.setTimeout(dismissInitialLoader, 4000);
