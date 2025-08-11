import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import firebase from '../../firebase/firebase';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenActiva, setOrdenActiva] = useState(null); 

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firebase.db, 'ordenes'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrdenes(data);
    });
    return unsubscribe;
  }, []);

  // --- Helper: registra en 'ventas' si no existe ---
  const registrarEnVentas = useCallback(async (id) => {
    const docRef = doc(firebase.db, 'ordenes', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    // ¿ya está registrada en ventas?
    const q = query(collection(firebase.db, 'ventas'), where('ordenId', '==', id));
    const existentes = await getDocs(q);
    if (!existentes.empty) return; // evitar duplicado

    const orden = snap.data();

    await addDoc(collection(firebase.db, 'ventas'), {
      ...orden,
      ordenId: id,
      fecha: new Date().toISOString(),
      creado: orden.creado || Date.now()
    });

    // marca en la orden para no intentar registrarla de nuevo
    try {
      await updateDoc(docRef, { registradaEnVentas: true });
    } catch (_) {
      // opcional: si no quieres escribir este flag, puedes omitirlo
    }
  }, []);

  // Definir tiempo SOLO con botones: ahora también registra en ventas
  const definirTiempoEntrega = useCallback(
    async (id, minutos) => {
      if (!minutos || minutos <= 0) return;
      const ref = doc(firebase.db, 'ordenes', id);

      await updateDoc(ref, {
        tiempoEntrega: parseInt(minutos, 10),
        creado: Date.now(),          // como antes, para que el app/reporte funcione
        estado: 'en progreso'
      });

      // registra en ventas inmediatamente (sin esperar "marcar como lista")
      await registrarEnVentas(id);
    },
    [registrarEnVentas]
  );

  // Atajos de teclado:  para la tarjeta bajo el mouse
  useEffect(() => {
    const handler = (e) => {
      if (!ordenActiva) return;
      const mapa = { '1': 1, '2': 2, '4': 4, '5': 5 ,'10': 10, '15': 15, '20': 20, '30': 30 };
      const minutos = mapa[e.key];
      if (minutos) definirTiempoEntrega(ordenActiva, minutos);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ordenActiva, definirTiempoEntrega]);

  // Respaldo: si llega una orden con tiempoEntrega y aún no fue registrada, registrar
  useEffect(() => {
    if (!Array.isArray(ordenes) || ordenes.length === 0) return;
    const pendientes = ordenes.filter(o => o.tiempoEntrega && !o.registradaEnVentas);
    pendientes.forEach(o => registrarEnVentas(o.id));
  }, [ordenes, registrarEnVentas]);

  const marcarOrdenLista = async (id) => {
    const docRef = doc(firebase.db, 'ordenes', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return alert('La orden no existe');

    // 1) Actualiza estado en ordenes
    await updateDoc(docRef, {
      ordenLista: true,
      estado: 'lista'
    });

    // 2) Asegura registro en ventas (no duplica)
    await registrarEnVentas(id);
  };

  const eliminarOrden = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta orden?')) {
      await deleteDoc(doc(firebase.db, 'ordenes', id));
    }
  };

  // Botonera rápida (respetando tu estilo general)
  const BotoneraRapida = ({ onSelect }) => (
    <div style={{
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      background: '#ffffff',
      border: '1px dashed #d1d5db',
      borderRadius: 8,
      padding: 10,
      marginBottom: 12
    }}>
      {[1, 2, 4, 5, 10, 15, 20, 30].map(m => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          style={{
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13
          }}
          title={`Asignar ${m} min`}
        >
          {m} min
        </button>
      ))}
      <span style={{ fontSize: 12, color: '#6b7280' }}>
        (Defina el tiempo de entrega.)
      </span>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Órdenes Recibidas</h1>

      {Array.isArray(ordenes) && ordenes.length > 0 ? (
        ordenes.map(o => (
          <div
            key={o.id}
            onMouseEnter={() => setOrdenActiva(o.id)}
            onMouseLeave={() => setOrdenActiva(null)}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              margin: '15px 0',
              padding: '15px',
              backgroundColor: '#f9fafb',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Botonera rápida ARRIBA (afuera de los datos de la orden) */}
            {!o.tiempoEntrega && (
              <>
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>
                  Definir tiempo
                </p>
                <BotoneraRapida onSelect={(m) => definirTiempoEntrega(o.id, m)} />
              </>
            )}

            {/* Encabezado con ID y acciones */}
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

            {/* Detalle de pedido */}
            <ul style={{ marginTop: '10px' }}>
              {o.pedido?.map(item => (
                <li key={item.id}>
                  {item.nombre} x {item.cantidad} = Q{item.cantidad * item.precio}
                </li>
              ))}
            </ul>

            <p style={{ marginTop: '10px' }}><strong>Total:</strong> Q{o.total}</p>

            {/* Estado luego de asignar tiempo */}
            {o.tiempoEntrega && !o.ordenLista && (
              <>
                <p style={{ marginTop: '10px' }}>
                  <strong>Entrega en:</strong> {o.tiempoEntrega} min
                </p>
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
