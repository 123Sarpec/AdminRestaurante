// src/firebase/config.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDvi3VloZ6zNcVTcG90Q6I7QRDeHgqZFGg",
  authDomain: "restaurante-9f5bd.firebaseapp.com",
  projectId: "restaurante-9f5bd",
  storageBucket: "restaurante-9f5bd.appspot.com",
  messagingSenderId: "65909624724",
  appId: "1:65909624724:web:203a81e2545f8390858981",
  measurementId: "G-NVW32347J6"
};

// Solo inicializa si no hay apps existentes
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exportar instancia
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
