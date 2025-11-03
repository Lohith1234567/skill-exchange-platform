import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error logs (do not suppress default handling to keep Vite overlay visible)
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Log unhandled promise rejections (no preventDefault)
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('main.jsx: Starting React app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('ROOT ELEMENT NOT FOUND!');
} else {
  console.log('Root element found, rendering App...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('App rendered successfully');
}
