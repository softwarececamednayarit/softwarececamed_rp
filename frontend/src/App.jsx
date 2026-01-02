import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Importar componentes existentes
import { Sidebar } from './components/Sidebar';
import Atendidos from './pages/Atendidos';
import { LogOut } from 'lucide-react';

// Creamos un componente interno para manejar la lógica de "mostrar/ocultar"
// (Necesitamos este componente separado para poder usar el hook 'useAuth')
const AppContent = () => {
  const { user, loading, logout } = useAuth();

  // A. Pantalla de carga (mientras revisa si hay token guardado)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
        Cargando sistema...
      </div>
    );
  }

  // B. Si NO hay usuario logueado -> Muestra el Login
  if (!user) {
    return <Login />;
  }

  // C. Si SÍ hay usuario -> Muestra tu App normal (Dashboard)
  return (
    <div className="flex min-h-screen bg-slate-100/50 font-sans text-slate-900">
      
      {/* Contenedor del Sidebar + Botón de Salir */}
      <div className="hidden lg:flex flex-col sticky top-0 h-screen bg-slate-900">
        <Sidebar />
        
        {/* Botón para Cerrar Sesión (Agregado al final del sidebar) */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto relative">
        {/* Botón de salir flotante para móviles (opcional) */}
        <button 
          onClick={logout} 
          className="lg:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-slate-700 z-50"
        >
          <LogOut size={20} />
        </button>

        <Atendidos />
      </main>
    </div>
  );
};

// Componente Principal
function App() {
  return (
    // 2. ENVOLVER TODO EN EL PROVIDER
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;