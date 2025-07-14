import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import firebase from '../../firebase/firebase';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [tiempos, setTiempos] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firebase.db, 'ordenes'), snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setOrdenes(data);
    });
    return unsubscribe;
  }, []);

  const definirTiempoEntrega = async (id) => {
    const tiempo = tiempos[id];
    if (!tiempo) return alert('Ingresa un tiempo válido');

    const docRef = doc(firebase.db, 'ordenes', id);
    await updateDoc(docRef, {
      tiempoEntrega: parseInt(tiempo),
      creado: Date.now(),
      estado: 'en progreso'
    });
  };

  const marcarOrdenLista = async (id) => {
    const docRef = doc(firebase.db, 'ordenes', id);
    await updateDoc(docRef, {
      ordenLista: true,
      estado: 'lista'
    });

    // ❗ Espera 10 segundos y elimina la orden
    setTimeout(async () => {
      await deleteDoc(docRef);
    }, 2000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Órdenes Recibidas</h1>

      {Array.isArray(ordenes) && ordenes.length > 0 ? (
        ordenes.map(o => (
          <div
            key={o.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              margin: '10px 0',
              padding: '15px',
              backgroundColor: o.ordenLista ? '#e6ffed' : '#f9fafb'
            }}
          >
            <p><strong>ID:</strong> <span style={{ color: '#fbbf24' }}>{o.id}</span></p>
            <ul>
              {o.pedido?.map(item => (
                <li key={item.id}>
                  {item.nombre} x {item.cantidad} = Q{item.cantidad * item.precio}
                </li>
              ))}
            </ul>
            <p><strong>Total a Pagar:</strong> Q{o.total}</p>

            {!o.tiempoEntrega && (
              <>
                <label><strong>Tiempo de Entrega</strong></label>
                <input
                  type="number"
                  placeholder="Minutos"
                  value={tiempos[o.id] || ''}
                  onChange={(e) => setTiempos({ ...tiempos, [o.id]: e.target.value })}
                  style={{
                    padding: '8px',
                    marginTop: '5px',
                    marginBottom: '10px',
                    display: 'block',
                    width: '100%',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
                <button
                  onClick={() => definirTiempoEntrega(o.id)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '10px',
                    width: '100%',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  DEFINIR TIEMPO
                </button>
              </>
            )}

            {o.tiempoEntrega && !o.ordenLista && (
              <>
                <p><strong>Tiempo de Entrega:</strong> {o.tiempoEntrega} minutos</p>
                <button
                  onClick={() => marcarOrdenLista(o.id)}
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: 'white',
                    padding: '10px',
                    width: '100%',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  MARCAR COMO LISTA
                </button>
              </>
            )}

            {o.ordenLista && (
              <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>
                ✅ ORDEN LISTA PARA RECOGER
              </p>
            )}
          </div>
        ))
      ) : (
        <h2 style={{ textAlign: 'center', color: '#666' }}>📭 No hay órdenes recibidas</h2>
      )}
    </div>
  );
}
