import React from 'react';
import {Link, NavLink} from 'react-router-dom'

const Sidebar = () => {
    return ( 
         <div className='md:w-2/5 xl:w-1/5 bg-gray-900 min-h-screen'>
            <div className='p-6'>
                <p className='uppercase text-white text-2xl tracking-wider text-center font-bold'>RestauranteApp</p>
                <p className='mt-3 text-gray-600'>Aminsitras por categoria tus productos </p>
                <nav className="flex flex-col gap-2 mt-4">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `p-1 block rounded hover:bg-yellow-500 hover:text-gray-900 ${
                        isActive ? 'text-yellow-500 font-bold' : 'text-white'
                      }`
                    }
                  >
                    Ordenes
                  </NavLink>

                  <NavLink
                    to="/menu"
                    className={({ isActive }) =>
                      `p-1 block rounded hover:bg-yellow-500 hover:text-gray-900 ${
                        isActive ? 'text-yellow-500 font-bold' : 'text-white'
                      }`
                    }
                  >
                    Menu
                  </NavLink>
                </nav>
            </div>
        </div>
     );
}

export default Sidebar;
