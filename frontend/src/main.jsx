import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './app/App.jsx';
import { store } from './store/store.js';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Provider store={store}><App /><Toaster position="top-right" /></Provider></React.StrictMode>,
);
