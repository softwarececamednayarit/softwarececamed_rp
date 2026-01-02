import React from 'react';
import { Users, Globe, BookOpen } from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

// Recibimos 'currentView' y 'onNavigate' como props
export const Sidebar = ({ currentView, onNavigate }) => {
  
  // Función helper para clases de estilo activo/inactivo
  const getLinkClass = (viewName) => {
    const baseClass = "flex items-center space-x-3 p-3.5 rounded-2xl transition-all w-full text-left";
    const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-semibold";
    const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-white font-medium";

    return `${baseClass} ${currentView === viewName ? activeClass : inactiveClass}`;
  };

  return (
    // Agregamos 'bg-slate-900' aquí para asegurar el fondo oscuro
    <aside className="w-full h-full p-6 bg-slate-900 flex flex-col">
      
      {/* ENCABEZADO MODIFICADO */}
      <div className="mb-10 flex flex-col items-center text-center">
        
        {/* 1. Círculo Blanco para el Logo */}
        <div className="bg-white p-3 rounded-full shadow-lg shadow-white/5 mb-3">
          <img 
            src={logoCecamed} 
            alt="Logo CECAMED Nayarit" 
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* 2. Título y Subtítulo */}
        {/* Agregué el título CECAMED para que se vea más completo, puedes quitarlo si prefieres solo el logo */}
        <h2 className="text-xl font-black tracking-tighter text-white leading-none">
            CECA<span className="text-indigo-400">MED</span>
        </h2>

        {/* Cambiamos el color a slate-300 para que se lea bien sobre el fondo oscuro */}
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
          Panel de Control
        </p>
      </div>

      <nav className="space-y-2">
        {/* Botón Atendidos */}
        <button 
          onClick={() => onNavigate('atendidos')} 
          className={getLinkClass('atendidos')}
        >
          <Users size={20} /> 
          <span>Atendidos</span>
        </button>

        {/* Botón Sitios de Interés */}
        <button 
          onClick={() => onNavigate('sitios')} 
          className={getLinkClass('sitios')}
        >
          <Globe size={20} /> 
          <span>Sitios de Interés</span>
        </button>
      </nav>
    </aside>
  );
};