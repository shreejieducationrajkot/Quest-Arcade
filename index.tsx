
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './games/components/App';
import { SoundProvider } from './games/components/SoundManager';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SoundProvider>
      <App />
    </SoundProvider>
  </React.StrictMode>
);
