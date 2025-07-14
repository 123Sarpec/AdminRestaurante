// src/firebase/firebase.js
import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Esta función se exporta para enviar órdenes
export const enviarOrdenAFirebase = async (pedido, total) => {
  try {
    await addDoc(collection(db, "ordenes"), {
      pedido,
      total,
      estado: 'recibido',
      fecha: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error al enviar orden:", error);
    return false;
  }
};
