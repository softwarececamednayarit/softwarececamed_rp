import React, { useState } from 'react';
import { 
  FolderOpen, 
  RefreshCw, 
  HardDrive,
  Construction 
} from 'lucide-react';

const Archivos = () => {
  // Estados para simular la funcionalidad del header
  const [loading, setLoading] = useState(false);
  const [archivos] = useState([]); // Simulación de datos filtrados
  const [stats] = useState({ total: 0 }); // Simulación de estadísticas

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER ADAPTADO AL ESTILO SACRE */}
      <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-900/20 hidden sm:block">
            <FolderOpen size={32} /> 
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Manejador de Archivos
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-slate-500 font-medium text-sm">
                Mostrando <span className="text-slate-900 font-bold">{archivos.length}</span> documentos encontrados.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 relative z-10">
          <div className="flex flex-col items-start md:items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Archivos</span>
              <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 leading-none">{stats.total}</span>
                  <span className="text-sm font-bold text-slate-400">Docs.</span>
              </div>
          </div>

          <button 
            onClick={handleSync} 
            disabled={loading} 
            className="group flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 px-5 py-3 rounded-xl font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={`transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span className="hidden sm:inline">{loading ? 'Actualizando' : 'Sincronizar'}</span>
          </button>
        </div>
      </header>

      {/* CUERPO DE LA PÁGINA (MENSAJE DE PROCESO) */}
      <div className="bg-white rounded-[2rem] shadow-md p-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <div className="bg-amber-50 p-6 rounded-3xl mb-6">
          <Construction className="h-16 w-16 text-amber-500 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Módulo en Construcción</h2>
        <p className="text-slate-500 mt-3 text-center max-w-md leading-relaxed">
          Este espacio está reservado para la gestión centralizada de expedientes y documentación digital del <span className="font-bold text-indigo-600">SACRE</span>.
        </p>
        <div className="mt-8 px-6 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          Versión Alpha 0.1
        </div>
      </div>
    </div>
  );
};

export default Archivos;