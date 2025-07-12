import React from 'react';
const Orden = () => {
    return (  
        <div className='sm:w-1'>
            <div className=''>
                <h1 className=''>
                    {orden.id}
                </h1>
                {orden.orden.map(platillos => (
                    <p className=''>{platillos.cantidad} {platillos.nombre} </p>
                ))}
                <p className=''>Total a Pagar: Q {orden.total} </p>

                {orden.tiempoentrega == 0 && (
                    <div className='mb-4'>
                        <label>Tiempo de entrega</label>
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default Orden;