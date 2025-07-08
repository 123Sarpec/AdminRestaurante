import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { collection, addDoc } from 'firebase/firestore';
import FirebaseContext from '../../firebase/context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NuevoPlato = () => {
  const { firebase } = useContext(FirebaseContext);
  const navigate = useNavigate();

  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenCargada, setImagenCargada] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      precio: '',
      categoria: '',
      imagen: '',
      descripcion: '',

    },
    validationSchema: yup.object({
      nombre: yup.string().min(3, "Los platillos deben tener al menos 3 caracteres").required("El Nombre del Plato es obligatorio"),
      precio: yup.number().min(1, 'Debes agregar un valor').required('El Precio es obligatorio'),
      categoria: yup.string().required('La Categoría es obligatoria'),
      descripcion: yup.string().min(20, 'Debes agregar al menos 20 caracteres').required('La Descripción es obligatoria'),
    }),
    onSubmit: async (datos) => {
      try {
        await addDoc(collection(firebase.db, 'producto'), {
          nombre: datos.nombre,
          precio: datos.precio,
          categoria: datos.categoria,
          descripcion: datos.descripcion,
          imagen: datos.imagen,
        });
        navigate('/menu');
      } catch (error) {
        console.error('Error al guardar el platillo:', error);
      }
    },
  });

  const subirImagen = async (archivo) => {
    if (!archivo) return;

    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', 'restaurante_preset');

    try {
      setSubiendo(true);
      setProgreso(0);
      setImagenCargada(false);

      const respuesta = await axios.post(
        'https://api.cloudinary.com/v1_1/dr8ht5b5c/image/upload',
        formData,
        {
          onUploadProgress: (e) => {
            if (e.total > 0) {
              const porcentaje = Math.round((e.loaded * 100) / e.total);
              setProgreso(porcentaje);
            }
          },
        }
      );

      const url = respuesta.data.secure_url;
      setImagenUrl(url);
      setImagenCargada(true);
      setSubiendo(false);
      formik.setFieldValue('imagen', url);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setSubiendo(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Agregar Nuevo Plato</h1>

      <div className="flex justify-center mt-10">
        <div className="w-full max-w-2xl bg-white p-6 shadow-md rounded-md">
          <form onSubmit={formik.handleSubmit}>

            {/* Campo: Nombre */}
            <div className="mb-5">
              <label htmlFor="nombre" className="block text-gray-800 text-sm font-bold mb-2">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Nombre del Plato"
                className="w-full border border-gray-300 px-4 py-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-2 text-sm rounded">
                  <p className='font-bold'>Hubo un error:</p>
                  <p>{formik.errors.nombre}</p>
                </div>
              )}
            </div>

            {/* Campo: Precio */}
            <div className="mb-5">
              <label htmlFor="precio" className="block text-gray-800 text-sm font-bold mb-2">Precio</label>
              <input
                id="precio"
                type="number"
                placeholder="Q 30"
                min="0"
                className="w-full border border-gray-300 px-4 py-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formik.values.precio}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.precio && formik.errors.precio && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-2 text-sm rounded">
                  <p className='font-bold'>Hubo un error:</p>
                  <p>{formik.errors.precio}</p>
                </div>
              )}
            </div>

            {/* Campo: Categoría */}
            <div className="mb-5">
              <label htmlFor="categoria" className="block text-gray-800 text-sm font-bold mb-2">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={formik.values.categoria}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 px-4 py-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">-- Seleccione --</option>
                <option value="desayuno">Desayuno</option>
                <option value="refaccion">Refacción</option>
                <option value="almuerzo">Almuerzo</option>
                <option value="postre">Postre</option>
                <option value="bebidas">Bebidas</option>
                <option value="cena">Cena</option>
                <option value="pizzas">Pizzas</option>
              </select>
              {formik.touched.categoria && formik.errors.categoria && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-2 text-sm rounded">
                  <p className='font-bold'>Hubo un error:</p>
                  <p>{formik.errors.categoria}</p>
                </div>
              )}
            </div>

            {/* Campo: Imagen */}
            <div className="mb-5">
              <label htmlFor="imagen" className="block text-gray-800 text-sm font-bold mb-2">Imagen</label>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={(e) => subirImagen(e.currentTarget.files[0])}
                className="w-full border border-gray-300 px-4 py-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {subiendo && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${progreso}%`,
                      backgroundColor:
                        progreso < 50 ? '#f87171' : progreso < 80 ? '#facc15' : '#4ade80',
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{progreso}%</p>
              </div>
            )}

            {imagenCargada && (
              <div className="mb-5 text-green-700 font-medium flex flex-col items-start">
                <span>Imagen subida correctamente</span>
                <img
                  src={imagenUrl}
                  alt="Imagen subida"
                  className="mt-2 w-32 h-32 object-cover rounded border shadow"
                />
              </div>
            )}

            {/* Campo: Descripción */}
            <div className="mb-5">
              <label htmlFor="descripcion" className="block text-gray-800 text-sm font-bold mb-2">Descripción</label>
              <textarea
                id="descripcion"
                placeholder="Descripción del Plato"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-gray-300 px-4 py-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
              />
              {formik.touched.descripcion && formik.errors.descripcion && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-2 text-sm rounded">
                  <p className='font-bold'>Hubo un error:</p>
                  <p>{formik.errors.descripcion}</p>
                </div>
              )}
              
            </div>

            {/* Botón de envío */}
            <input
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 w-full mt-5 p-2 text-white uppercase font-bold"
              value="Agregar Plato"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default NuevoPlato;
