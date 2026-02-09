import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Globe, BookOpen, User, FileSpreadsheet, Briefcase, LogOut, TrendingUp,
  Shield // 1. IMPORTAMOS EL ICONO SHIELD
} from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

export const Sidebar = ({ currentView, onNavigate }) => {
  const { logout, user } = useAuth(); 

  // ===========================================================================
  // 1. CONFIGURACIÓN DE ACCESOS (Aquí defines quién ve qué)
  // ===========================================================================
  const MENU_ITEMS = [
    // --- ACCESO PÚBLICO (Sin propiedad 'roles') ---
    { id: 'atendidos',    label: 'Atendidos',        icon: Users },
    { id: 'sitios',       label: 'Sitios',           icon: Globe },
    
    // --- ACCESO RESTRINGIDO ---
    { 
      id: 'recepcion',    
      label: 'Recepción',        
      icon: BookOpen, 
      roles: ['admin'] 
    },
    { 
        id: 'padron',       
        label: 'Padrón',           
        icon: FileSpreadsheet,
        roles: ['admin', 'operativo']
    },
    { 
        id: 'gestion',      
        label: 'Registro Clásico', 
        icon: Briefcase,
        roles: ['admin', 'operativo']
    },
    { 
        id: 'estadisticas', 
        label: 'Estadísticas',     
        icon: TrendingUp,
        roles: ['admin'] 
    },

    // 2. AGREGAMOS LA BITÁCORA AQUÍ
    { 
        id: 'bitacora',     
        label: 'Bitácora',         
        icon: Shield,
        roles: ['admin'] // Solo Admin puede ver auditoría
    },
    
    // --- ACCESO EXCLUSIVO ---
    { 
        id: 'usuarios',     
        label: 'Usuarios',         
        icon: Users,
        roles: ['admin'] 
    },
  ];

  // 2. FILTRADO INTELIGENTE
  const visibleItems = MENU_ITEMS.filter(item => {
    // Si no tiene la propiedad roles, es público -> MOSTRAR
    if (!item.roles) return true;
    
    // Si tiene roles, verificamos si el rol del usuario está en la lista -> MOSTRAR SI COINCIDE
    return item.roles.includes(user?.role);
  });

  // Helper de estilos
  const getLinkClass = (isActive) => {
    return `
      flex items-center space-x-3 p-3.5 rounded-2xl transition-all w-full text-left font-medium outline-none
      ${isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-bold' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `;
  };

  const handleLogout = () => {
    if (window.confirm("¿Desea cerrar sesión?")) {
      logout();
    }
  };

  return (
    <aside className="w-full h-full p-6 bg-slate-900 flex flex-col shadow-2xl relative z-50">
      
      {/* --- ENCABEZADO --- */}
      <div className="mb-8 flex flex-col items-center text-center shrink-0">
        <div className="bg-white p-3 rounded-[1.2rem] shadow-lg shadow-white/5 mb-3 transition-transform hover:scale-105 duration-500">
          <img 
            src={logoCecamed} 
            alt="Logo CECAMED" 
            className="h-14 w-14 object-contain"
          />
        </div>

        <h2 className="text-xl font-black tracking-tighter text-white leading-none">
            CECA<span className="text-indigo-400">MED</span>
        </h2>

        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-2">
          Panel de Control
        </p>
      </div>

      {/* --- NAV SCROLLABLE --- */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-2">
            Navegación
        </p>
        
        {visibleItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)} 
            className={getLinkClass(currentView === item.id)}
          >
            <item.icon size={20} className={currentView === item.id ? 'animate-in zoom-in duration-300' : ''} /> 
            <span>{item.label}</span>
          </button>
        ))}

        {/* SECCIÓN CUENTA */}
        <div className="pt-6 mt-6 border-t border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-2">
              Sistema
            </p>
            <button 
              onClick={() => onNavigate('perfil')} 
              className={getLinkClass(currentView === 'perfil')}
            >
              <User size={20} /> 
              <span>Mi Perfil</span>
            </button>
        </div>

      </nav>

      {/* --- FOOTER / LOGOUT --- */}
      <div className="pt-4 mt-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3.5 rounded-2xl transition-all w-full text-left font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/> 
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
};