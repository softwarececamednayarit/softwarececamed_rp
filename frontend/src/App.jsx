import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Loader2, Menu } from 'lucide-react';

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

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('atendidos');
  
  // Estado para menú móvil (opcional, por si quieres expandirlo luego)
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

  // --- APP PRINCIPAL ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1. SIDEBAR (Escritorio) */}
      {/* Nota: Ya no necesitamos el botón de logout aquí abajo, 
          porque el componente <Sidebar /> ya lo trae integrado internamente. */}
      <div className="hidden lg:flex w-72 shrink-0 h-full">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
      </div>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        
        {/* Header Móvil (Solo visible en pantallas chicas) */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-50 shrink-0">
            <span className="font-black tracking-tight text-lg">CECAMED</span>
            <button 
                onClick={logout} 
                className="p-2 bg-white/10 rounded-lg active:bg-white/20 transition-colors"
            >
                <LogOut size={20} />
            </button>
        </div>

        {/* Contenedor de Vistas (Con scroll propio) */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
            {currentView === 'atendidos' && <Atendidos />}
            {currentView === 'padron'    && <Padron />}
            {currentView === 'gestion'   && <Gestion />}
            {currentView === 'sitios'    && <SitiosInteres />}
            {currentView === 'recepcion' && <Recepcion />}
            {currentView === 'perfil'    && <Perfil />}
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