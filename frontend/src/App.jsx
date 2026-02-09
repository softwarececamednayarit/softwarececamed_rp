import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Loader2, Menu, X, AlertCircle } from 'lucide-react'; 

// Importar componentes
import Login from './pages/Login';
import { Sidebar } from './components/Sidebar';

// Importar páginas
import Atendidos from './pages/Atendidos';
import SitiosInteres from './pages/SitiosInteres';
import Recepcion from './pages/Recepcion';
import Perfil from './pages/Perfil';
import Padron from './pages/Padron'; 
import Gestion from './pages/Gestion';
import Estadisticas from './pages/Estadisticas';
import Usuarios from './pages/Usuarios';
import Bitacora from './pages/Bitacora'; // 1. IMPORTAR BITÁCORA

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('atendidos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- PANTALLA DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600 gap-3">
        <Loader2 size={48} className="animate-spin" />
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Cargando sistema...</p>
      </div>
    );
  }

  // --- LOGIN ---
  if (!user) return <Login />;

  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // --- COMPONENTE DE ACCESO DENEGADO ---
  const AccesoDenegado = () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in zoom-in duration-300">
       <div className="bg-rose-50 p-6 rounded-full mb-4">
           <AlertCircle size={48} className="text-rose-500" />
       </div>
       <h2 className="text-2xl font-black text-slate-800">Acceso Denegado</h2>
       <p className="mt-2 font-medium">No tienes los permisos necesarios para ver esta sección.</p>
       <button 
           onClick={() => setCurrentView('atendidos')}
           className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
       >
           Volver al Inicio
       </button>
    </div>
  );

  // --- LÓGICA DE RENDERIZADO CON SEGURIDAD ---
  const renderView = () => {
    // Obtenemos el rol actual (con fallback a string vacío por seguridad)
    const myRole = user?.role || '';

    switch (currentView) {
      // =================================================================
      // 1. PÁGINAS PÚBLICAS (Sin restricción de roles)
      // =================================================================
      case 'atendidos':    return <Atendidos />;
      case 'sitios':       return <SitiosInteres />;
      case 'perfil':       return <Perfil />; // Generalmente pública para logueados

      // =================================================================
      // 2. PÁGINAS DE OPERACIÓN (Admin + Operativo)
      // =================================================================
      case 'padron':
        if (['admin', 'operativo'].includes(myRole)) return <Padron />;
        return <AccesoDenegado />;

      case 'gestion':
        if (['admin', 'operativo'].includes(myRole)) return <Gestion />;
        return <AccesoDenegado />;

      // =================================================================
      // 3. PÁGINAS EXCLUSIVAS DE ADMINISTRADOR
      // =================================================================
      case 'recepcion': 
      case 'estadisticas':
      case 'usuarios':
      case 'bitacora': // 2. AGREGAMOS EL CASO BITÁCORA
        if (['admin'].includes(myRole)) {
            if (currentView === 'recepcion')    return <Recepcion />;
            if (currentView === 'estadisticas') return <Estadisticas />;
            if (currentView === 'bitacora')     return <Bitacora />; // Renderizar componente
            return <Usuarios />;
        }
        return <AccesoDenegado />;

      default: return <Atendidos />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* 1. SIDEBAR (Escritorio) */}
      <div className="hidden lg:flex w-72 shrink-0 h-full">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      </div>

      {/* 2. SIDEBAR (Móvil) */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-50 lg:hidden flex">
           <div 
             className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
             onClick={() => setIsMobileMenuOpen(false)}
           />
           <div className="relative w-72 h-full bg-slate-900 shadow-2xl flex flex-col">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <Sidebar currentView={currentView} onNavigate={handleNavigate} />
           </div>
        </div>
      )}

      {/* 3. ÁREA PRINCIPAL */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        {/* Header Móvil */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-40 shrink-0">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-300 hover:text-white active:scale-95 transition-transform"
            >
                <Menu size={24} />
            </button>
            <span className="font-black tracking-tight text-lg">CECAMED</span>
            <button onClick={logout} className="p-2 bg-white/10 rounded-lg active:bg-white/20 transition-colors">
                <LogOut size={20} />
            </button>
        </div>

        {/* Contenedor de Vistas */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
            {renderView()}
        </div>
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