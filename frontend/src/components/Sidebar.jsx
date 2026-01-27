import React from 'react';
// 1. AGREGAMOS 'Briefcase' a los imports
import { Users, Globe, BookOpen, User, FileSpreadsheet, Briefcase } from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

export const Sidebar = ({ currentView, onNavigate }) => {
  
  const getLinkClass = (viewName) => {
    const baseClass = "flex items-center space-x-3 p-3.5 rounded-2xl transition-all w-full text-left";
    const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-semibold";
    const inactiveClass = "text-slate-400 hover:bg-slate-800 hover:text-white font-medium";

    return `${baseClass} ${currentView === viewName ? activeClass : inactiveClass}`;
  };

  return (
    <aside className="w-full h-full p-6 bg-slate-900 flex flex-col">
      
      {/* ENCABEZADO */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="bg-white p-3 rounded-full shadow-lg shadow-white/5 mb-3">
          <img 
            src={logoCecamed} 
            alt="Logo CECAMED Nayarit" 
            className="h-16 w-16 object-contain"
          />
        </div>

        <h2 className="text-xl font-black tracking-tighter text-white leading-none">
            CECA<span className="text-indigo-400">MED</span>
        </h2>

        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
          Panel de Control
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        
        {/* Botón Atendidos */}
        <button 
          onClick={() => onNavigate('atendidos')} 
          className={getLinkClass('atendidos')}
        >
          <Users size={20} /> 
          <span>Atendidos</span>
        </button>

        {/* Botón Padrón */}
        <button 
          onClick={() => onNavigate('padron')} 
          className={getLinkClass('padron')}
        >
          <FileSpreadsheet size={20} /> 
          <span>Padrón</span>
        </button>

        {/* --- 2. NUEVO BOTÓN: GESTIÓN --- */}
        <button 
          onClick={() => onNavigate('gestion')} 
          className={getLinkClass('gestion')}
        >
          <Briefcase size={20} /> 
          <span>Gestión</span>
        </button>

        {/* Botón Recepción */}
        <button
          onClick={() => onNavigate('recepcion')}
          className={getLinkClass('recepcion')}
        >
          <BookOpen size={20} />
          <span>Recepción</span>
        </button>

        {/* Botón Sitios de Interés */}
        <button 
          onClick={() => onNavigate('sitios')} 
          className={getLinkClass('sitios')}
        >
          <Globe size={20} /> 
          <span>Sitios de Interés</span>
        </button>

        {/* SECCIÓN DE PERFIL */}
        <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2">
              Cuenta
            </p>
            <button 
              onClick={() => onNavigate('perfil')} 
              className={getLinkClass('perfil')}
            >
              <User size={20} /> 
              <span>Mi Perfil</span>
            </button>
        </div>

      </nav>
    </aside>
  );
};