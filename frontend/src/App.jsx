import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Loader2, Menu, X } from 'lucide-react'; // Agregué 'X' para cerrar menú

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

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('atendidos');
  
  // Estado para el menú móvil
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

  // Función para navegar y cerrar el menú móvil automáticamente
  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Cierra el menú al seleccionar
  };

  // --- APP PRINCIPAL ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* 1. SIDEBAR (Escritorio) - Siempre visible en pantallas grandes */}
      <div className="hidden lg:flex w-72 shrink-0 h-full">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
      </div>

      {/* 2. SIDEBAR (Móvil - Overlay) */}
      {/* Si está abierto, mostramos un fondo oscuro y el menú encima */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-50 lg:hidden flex">
           {/* Fondo oscuro al dar click cierra */}
           <div 
             className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
             onClick={() => setIsMobileMenuOpen(false)}
           />
           
           {/* El Sidebar en sí */}
           <div className="relative w-72 h-full bg-slate-900 shadow-2xl flex flex-col">
              {/* Botón cerrar manual */}
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>

              {/* Reutilizamos el componente Sidebar */}
              <Sidebar 
                currentView={currentView} 
                onNavigate={handleNavigate} // Usamos la función que cierra el menú
              />
           </div>
        </div>
      )}

      {/* 3. ÁREA PRINCIPAL */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        
        {/* Header Móvil */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-40 shrink-0">
            {/* Botón Hamburguesa para abrir menú */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-300 hover:text-white active:scale-95 transition-transform"
            >
                <Menu size={24} />
            </button>

            <span className="font-black tracking-tight text-lg">CECAMED</span>
            
            <button 
                onClick={logout} 
                className="p-2 bg-white/10 rounded-lg active:bg-white/20 transition-colors"
            >
                <LogOut size={20} />
            </button>
        </div>

        {/* Contenedor de Vistas */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
            {currentView === 'atendidos' && <Atendidos />}
            {currentView === 'padron'    && <Padron />}
            {currentView === 'gestion'   && <Gestion />}
            {currentView === 'sitios'    && <SitiosInteres />}
            {currentView === 'recepcion' && <Recepcion />}
            {currentView === 'perfil'    && <Perfil />}
            {currentView === 'estadisticas' && <Estadisticas />}
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