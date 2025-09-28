/* PLEASE NOTE: THESE TAILWIND IMPORTS SHOULD NEVER BE DELETED */
import 'tailwindcss/base';
import 'tailwindcss/components';
import 'tailwindcss/utilities';
/* DO NOT DELETE THESE TAILWIND IMPORTS, OTHERWISE THE STYLING WILL NOT RENDER AT ALL */

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from '../AppRouter'; // default export from AppRouter.js
import '../index.css'; // optional global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
