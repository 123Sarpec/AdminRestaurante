import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/main.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import firebase from './firebase/firebase';
import FirebaseContext from './firebase/context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FirebaseContext.Provider value={{ firebase }}>
    <Router>
      <App />
    </Router>
  </FirebaseContext.Provider>
);

reportWebVitals();
