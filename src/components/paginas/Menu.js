import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import FirebaseContext from '../../firebase/context';

const Menu = () => {
  const [platillos, setPlatillos] = useState([]);
  const { firebase } = useContext(FirebaseContext);

  useEffect(() => {
    const obtenerPlatillos = () => {
      const ref = collection(firebase.db, 'producto');
      onSnapshot(ref, manejarSnapshot);
    };
    obtenerPlatillos();
  }, [firebase]);

  const manejarSnapshot = (snapshot) => {
    const platillosArray = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPlatillos(platillosArray);
  };

  const actualizarExistencia = async (id, valor) => {
    try {
      const ref = doc(firebase.db, 'producto', id);
      await updateDoc(ref, {
        existencia: valor === 'true'
      });
    } catch (error) {
      console.error('Error al actualizar existencia:', error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Menu</h1>
      <Link
        to="/nuevoplato"
        className="bg-blue-900 hover:bg-blue-700 inline-block mb-5 p-2 text-white uppercase font-bold"
      >
        Agregar Plato
      </Link>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platillos.map(plato => (
          <div
            key={plato.id}
            className="relative border p-4 rounded shadow bg-white"
          >
            {/* Fondo oscuro para todo el card */}
            <div className="absolute inset-0 bg-black bg-opacity-5 rounded z-0" />

            {/* Contenido sobre fondo oscuro */}
            <div className="relative z-10">

              <div className="flex justify-center mb-3">
                <span className="px-4 py-1 text-sm font-bold text-orange-800 bg-orange-100 rounded-full uppercase tracking-wide">
                  {plato.categoria}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-1 text-gray-800">{plato.nombre}</h2>
              <p className="text-gray-600 mb-1 truncate">{plato.descripcion}</p>
              <p className="font-bold text-gray-900 mb-2">Q{plato.precio}</p>

              {plato.imagen && (
                <img
                  src={plato.imagen}
                  alt={plato.nombre}
                  className="mt-2 w-full h-48 object-contain rounded"
                />
              )}

              <div className="flex justify-between items-center mt-4">
                <select
                  className="border rounded-full py-1 px-3 text-sm shadow focus:outline-none"
                  value={plato.existencia ? 'true' : 'false'}
                  onChange={(e) => actualizarExistencia(plato.id, e.target.value)}
                >
                  <option value="true">Disponible</option>
                  <option value="false">No disponible</option>
                </select>

                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    plato.existencia
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {plato.existencia ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Menu;
