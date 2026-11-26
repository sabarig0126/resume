import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enforce HTTPS when deployed on non-local public domains accessed via plain HTTP
if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
  const host = window.location.hostname.toLowerCase();
  const isLocalHost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1';

  if (!isLocalHost) {
    window.location.replace(
      `https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`
    );
  }
}

createRoot(document.getElementById('root')!).render(<App />);
