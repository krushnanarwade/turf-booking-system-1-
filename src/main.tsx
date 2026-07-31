import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle browser tab/iframe transition edge-cases where IndexedDB closes or hides
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  if (reason.includes('Database is closing') || reason.includes('Database is hidden') || reason.includes('IndexedDB')) {
    event.preventDefault();
    console.warn('[Ignored non-fatal IndexedDB event]:', reason);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

