import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ordenes'), (snapshot) => {
      const ordenesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrdenes(ordenesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Órdenes Recibidas</h1>
      {ordenes.map((orden) => (
        <div key={orden.id} className="p-4 shadow mb-3 bg-white">
          <p><strong>ID:</strong> {orden.id}</p>
          {orden.pedido.map((item, index) => (
            <p key={index}>- {item.nombre} x {item.cantidad} (Q{item.precio})</p>
          ))}
          <p><strong>Total:</strong> Q{orden.total}</p>
          <p><strong>Estado:</strong> {orden.estado}</p>
        </div>
      ))}
    </>
  );
};

export default Ordenes;
