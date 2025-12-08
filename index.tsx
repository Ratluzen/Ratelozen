import React from 'react';
import ReactDOM from 'react-dom/client';

// 👈 هنا أهم نقطة: استخدم App من داخل مجلد src
import App from './src/App';

import './index.css'; // Global styles

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
