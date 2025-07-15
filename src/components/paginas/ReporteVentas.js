import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import firebase from '../../firebase/firebase';
import html2pdf from 'html2pdf.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ReporteVentas() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const obtenerVentas = async () => {
      const snapshot = await getDocs(collection(firebase.db, 'ventas'));
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVentas(datos);
    };
    obtenerVentas();
  }, []);

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  const ventasDelMes = ventas.filter(v => {
    const fecha = new Date(v.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  });

  const resumenPorCategoria = {};
  ventasDelMes.forEach(v => {
    v.pedido?.forEach(item => {
      const cat = item.categoria || 'Sin categoría';
      resumenPorCategoria[cat] = (resumenPorCategoria[cat] || 0) + item.cantidad;
    });
  });

  // 🔢 Total general de todas las ventas del mes
  const totalGeneral = ventasDelMes.reduce((acum, venta) => {
    const totalVenta = venta.pedido.reduce((suma, item) => suma + item.cantidad * item.precio, 0);
    return acum + totalVenta;
  }, 0);

  const data = {
    labels: Object.keys(resumenPorCategoria),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: Object.values(resumenPorCategoria),
        backgroundColor: '#3b82f6'
      }
    ]
  };

  const generarPDF = () => {
    const elemento = document.getElementById('reportePDF');
    html2pdf().from(elemento).save(`reporte_ventas_${mesActual + 1}_${anioActual}.pdf`);
  };

  const eliminarVentasDelMes = async () => {
    if (!window.confirm('¿Estás seguro de eliminar TODAS las ventas del mes actual?')) return;

    const eliminables = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    for (let v of eliminables) {
      await deleteDoc(doc(firebase.db, 'ventas', v.id));
    }

    alert('Ventas del mes eliminadas');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        Reporte de Ventas - {mesActual + 1}/{anioActual}
      </h2>

      {ventasDelMes.length > 0 ? (
        <div style={{ maxWidth: 700, margin: 'auto' }}>
          <Bar data={data} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#777' }}>
          No hay ventas registradas este mes.
        </p>
      )}

      {/* Tabla imprimible */}
      <div id="reportePDF" style={{ marginTop: '30px' }}>
        <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
          Tabla de ventas - {mesActual + 1}/{anioActual}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Platillo</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventasDelMes.flatMap(v =>
              v.pedido.map((item, idx) => (
                <tr key={`${v.id}-${idx}`} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{new Date(v.fecha).toLocaleDateString()}</td>
                  <td style={tdStyle}>{item.nombre}</td>
                  <td style={tdStyle}>{item.categoria}</td>
                  <td style={tdStyle}>{item.cantidad}</td>
                  <td style={tdStyle}>Q{item.precio}</td>
                  <td style={tdStyle}>Q{item.cantidad * item.precio}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5" style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold' }}>Total General:</td>
              <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#e5f5e0' }}>Q{totalGeneral}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={generarPDF}
          style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Descargar PDF
        </button>
        <button
          onClick={eliminarVentasDelMes}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Eliminar ventas
        </button>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'left',
  backgroundColor: '#f9fafb'
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #eee'
};
