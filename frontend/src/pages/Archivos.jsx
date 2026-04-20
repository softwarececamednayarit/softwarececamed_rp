import React, { useState } from 'react';
import { 
  FolderOpen, 
  RefreshCw, 
  Construction,
  Upload,
  FileCheck,
  Download,
  HardDrive
} from 'lucide-react';
import { optimizePDF, generateFileHash } from '../utils/pdfOptimizer';
import { toast } from 'react-hot-toast';

const Archivos = () => {
  const [loading, setLoading] = useState(false);
  const [archivos] = useState([]); 
  const [stats] = useState({ total: 0 });

  const handleProcessFile = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error("Por favor, selecciona un archivo PDF válido.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Procesando y optimizando PDF...");

    try {
      // 1. Optimizar el archivo
      const optimizedFile = await optimizePDF(file);
      
      // 2. Generar y loguear el HASH único
      const fileHash = await generateFileHash(optimizedFile);
      console.log("%c[SACRE DEBUG] Hash del archivo optimizado:", "color: #4f46e5; font-weight: bold;", fileHash);
      
      // 3. Descarga automática
      const url = URL.createObjectURL(optimizedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const ahorro = ((1 - optimizedFile.size / file.size) * 100).toFixed(2);
      toast.success(`¡Optimización completa! Ahorro: ${ahorro}%`, { id: toastId });
      
    } catch (error) {
      console.error("Error en el procesamiento:", error);
      toast.error("Hubo un error al procesar el archivo.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Sincronización de metadatos completada.");
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
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

      {/* ÁREA DE PRUEBA DE OPTIMIZACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card de Subida/Prueba */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-md p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleProcessFile}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={loading}
          />
          
          <div className="bg-indigo-50 p-6 rounded-3xl mb-4 group-hover:scale-110 transition-transform duration-500">
            {loading ? (
              <RefreshCw className="h-12 w-12 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-indigo-600" />
            )}
          </div>
          
          <h2 className="text-xl font-bold text-slate-800">Probar Optimizador</h2>
          <p className="text-slate-500 mt-2 text-center max-w-sm">
            Sube un PDF pesado para ver la magia. Se imprimirá el hash en consola y se descargará la versión ligera automáticamente.
          </p>
          
          {loading && (
            <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold animate-pulse">
              <Construction size={16} />
              Procesando estructura del PDF...
            </div>
          )}
        </div>

        {/* Card de Información Técnica */}
        <div className="bg-slate-900 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <HardDrive size={120} />
          </div>
          
          <h3 className="text-lg font-black uppercase tracking-widest text-indigo-400 mb-6">Info Técnica</h3>
          
          <ul className="space-y-6 relative z-10">
            <li className="flex gap-4">
              <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                <FileCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">SHA-256 Validado</p>
                <p className="text-xs text-slate-400">Huella digital única para evitar duplicados en el servidor.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="h-10 w-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Estructura Clean</p>
                <p className="text-xs text-slate-400">Eliminación de metadatos y objetos huérfanos sin perder calidad.</p>
              </div>
            </li>
          </ul>

          <div className="mt-10 pt-6 border-t border-white/10 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">
            Integrado con Web Crypto API
          </div>
        </div>

      </div>

      {/* FOOTER DE ESTADO */}
      <div className="flex justify-center italic text-slate-400 text-xs gap-2">
        <span>Módulo de gestión de archivos en fase Alpha</span>
        <span>•</span>
        <span className="font-bold text-indigo-500">SACRE v1.0</span>
      </div>
    </div>
  );
};

export default Archivos;