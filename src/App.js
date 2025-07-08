import './css/main.css';
import { Routes, Route } from 'react-router';

import FirebaseContext from './firebase/context';  // ✅ default import
import firebase from './firebase/firebase';        // ✅ instancia firebase

import Ordenes from './components/paginas/Ordenes';
import Menu from './components/paginas/Menu';
import NuevoPlato from './components/paginas/NuevoPlato';
import Sidebar from './components/ui/Sidebar';

function App() {
  return (
    <FirebaseContext.Provider value={{ firebase }}>
      <div className="md:flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Ordenes />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/nuevoplato" element={<NuevoPlato />} />
          </Routes>
        </main>
      </div>
    </FirebaseContext.Provider>
  );
}

export default App;
