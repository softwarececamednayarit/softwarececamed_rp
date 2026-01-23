import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Importar componentes
import { Sidebar } from './components/Sidebar';
import Atendidos from './pages/Atendidos';
import SitiosInteres from './pages/SitiosInteres';
import Recepcion from './pages/Recepcion';
import Perfil from './pages/Perfil';
// 1. IMPORTAR LA NUEVA PÁGINA
import Padron from './pages/Padron'; 

import { LogOut } from 'lucide-react';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  
  const [currentView, setCurrentView] = useState('atendidos');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
        Cargando sistema...
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-slate-100/50 font-sans text-slate-900">
      
      {/* Sidebar Fijo */}
      <div className="hidden lg:flex flex-col sticky top-0 h-screen bg-slate-900 w-72 shrink-0">
        
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
        
        <div className="p-4 border-t border-slate-800 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative">
        {/* Botón móvil de logout */}
        <button onClick={logout} className="lg:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-slate-700 z-50">
          <LogOut size={20} />
        </button>

        {/* RENDERIZADO CONDICIONAL DE PÁGINAS */}
        {currentView === 'atendidos' && <Atendidos />}
        
        {/* 2. AGREGAR ESTA LÍNEA PARA MOSTRAR EL PADRÓN */}
        {currentView === 'padron' && <Padron />}

        {currentView === 'sitios' && <SitiosInteres />}
        {currentView === 'recepcion' && <Recepcion />}
        {currentView === 'perfil' && <Perfil />}

      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;