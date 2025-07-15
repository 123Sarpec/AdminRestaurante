import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/main.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';


import App from './App';
import firebase from './firebase/firebase'; // ✅ Solo si exportas default (Opción 1)
import FirebaseContext from './firebase/context';
<script src="https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"></script>


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FirebaseContext.Provider value={{ firebase }}>
    <Router>
      <App />
    </Router>
  </FirebaseContext.Provider>
);

reportWebVitals();
