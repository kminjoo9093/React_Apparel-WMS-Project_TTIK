import React from 'react';
import ReactDOM from 'react-dom/client';
import Ttik from './Ttik';
import { BrowserRouter } from 'react-router-dom';
import './css/Global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Ttik />
  </BrowserRouter>
);
