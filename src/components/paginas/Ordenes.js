import React, { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc
} from 'firebase/firestore';
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
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return alert('La orden no existe');

    const orden = snapshot.data();

    // 1. Actualiza estado en ordenes
    await updateDoc(docRef, {
      ordenLista: true,
      estado: 'lista'
    });

    // 2. Guarda copia en 'ventas'
    await addDoc(collection(firebase.db, 'ventas'), {
      ...orden,
      fecha: new Date().toISOString()
    });
  };

  const eliminarOrden = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta orden?')) {
      await deleteDoc(doc(firebase.db, 'ordenes', id));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Órdenes Recibidas</h1>

      {Array.isArray(ordenes) && ordenes.length > 0 ? (
        ordenes.map(o => (
          <div
            key={o.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              margin: '15px 0',
              padding: '15px',
              backgroundColor: '#f9fafb',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>ID:</strong> <span style={{ color: '#f59e0b' }}>{o.id}</span></p>

              {o.ordenLista && (
                <button
                  onClick={() => eliminarOrden(o.id)}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    padding: '4px 10px',
                    fontSize: '13px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>

            <ul style={{ marginTop: '10px' }}>
              {o.pedido?.map(item => (
                <li key={item.id}>
                  {item.nombre} x {item.cantidad} = Q{item.cantidad * item.precio}
                </li>
              ))}
            </ul>

            <p style={{ marginTop: '10px' }}><strong>Total:</strong> Q{o.total}</p>

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
                    borderRadius: '5px',
                    border: '1px solid #d1d5db'
                  }}
                />
                <button
                  onClick={() => definirTiempoEntrega(o.id)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '8px',
                    width: '100%',
                    borderRadius: '5px',
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
                <p style={{ marginTop: '10px' }}><strong>Entrega en:</strong> {o.tiempoEntrega} min</p>
                <button
                  onClick={() => marcarOrdenLista(o.id)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px',
                    width: '100%',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  MARCAR COMO LISTA
                </button>
              </>
            )}

            {o.ordenLista && (
              <p style={{ color: '#000000', fontWeight: 'bold', marginTop: '10px' }}>
                 ORDEN LISTA PARA RECOGER
              </p>
            )}
          </div>
        ))
      ) : (
        <h2 style={{ textAlign: 'center', color: '#666' }}> No hay órdenes recibidas</h2>
      )}
    </div>
  );
}
