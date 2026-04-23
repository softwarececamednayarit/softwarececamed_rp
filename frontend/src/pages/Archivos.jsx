import React, { useState } from 'react';
import { 
  FolderOpen, 
  RefreshCw, 
  Plus,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import UploadModal from '../components/UploadModal'; 

const Archivos = () => {
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [archivos] = useState([]); // Aquí irán los archivos de Firestore
  const [stats] = useState({ total: 0 });

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Sincronización con Drive completada.");
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER PRINCIPAL */}
      <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-900/20 hidden sm:block">
            <FolderOpen size={32} /> 
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Gestión de Expedientes
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Repositorio digital del <span className="text-indigo-600 font-bold">SACRE</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={handleSync}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Sincronizar"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Subir Archivo</span>
          </button>
        </div>
      </header>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-2 rounded-3xl border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o hash..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL / LISTADO */}
      <main className="min-h-[400px] bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {archivos.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-slate-50 p-8 rounded-[3rem] mb-6">
              <FileText size={64} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No hay archivos en este puesto</h3>
            <p className="text-slate-400 mt-2 max-w-xs leading-relaxed">
              Los documentos que subas aparecerán aquí organizados por fecha y categoría.
            </p>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-8 text-indigo-600 font-bold hover:underline"
            >
              Comenzar a subir archivos
            </button>
          </div>
        ) : (
          <div className="p-8">
            {/* Aquí mapearemos la tabla de archivos más tarde */}
            <p className="text-slate-400 italic">Listado de archivos en desarrollo...</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Almacenamiento: Google Drive 15GB</span>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          SACRE v1.0 • Gestión Digital
        </div>
      </footer>

      {isUploadModalOpen && (
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Archivos;