import React from 'react';
import { 
  FileText, ExternalLink, Trash2, 
  Calendar, Building2, Hash, Edit3,
  RotateCcw, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import archivosService from '../services/archivosService';

const FileTable = ({ archivos, onRefresh, onEdit }) => {
  
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 
      ? `${(kb / 1024).toFixed(1)} MB` 
      : `${kb.toFixed(1)} KB`;
  };

  // --- LÓGICA DE ACCIONES ---

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Mover a la papelera?',
      text: `El expediente "${nombre}" se enviará a la papelera.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, mover',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      const toastId = toast.loading("Moviendo...");
      try {
        const response = await archivosService.eliminarArchivo(id);
        if (response.success) {
          toast.success("Movido a la papelera", { id: toastId });
          onRefresh();
        }
      } catch (error) {
        toast.error("Error al mover archivo", { id: toastId });
      }
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {archivos.map((file) => {
          const isDeleted = file.estado === 'borrado';

          return (
            <div 
              key={file.id} 
              className={`group relative bg-white border rounded-[2rem] p-5 transition-all duration-300 
                ${isDeleted ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100'}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* SECCIÓN 1: IDENTIDAD */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <div className={`p-4 rounded-2xl transition-colors duration-300 ${
                      isDeleted ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      <FileText size={28} />
                    </div>
                    {/* Indicador de estado */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${
                      isDeleted ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`} title={isDeleted ? 'En Papelera' : 'Activo'} />
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-black text-lg leading-tight tracking-tight ${isDeleted ? 'text-rose-900/40' : 'text-slate-800'}`}>
                        {file.nombreOriginal}
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md uppercase">
                        {formatSize(file.size)}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium line-clamp-1 max-w-xl italic">
                      {isDeleted ? 'Este archivo está en la papelera y no se puede editar.' : (file.asunto || 'Sin asunto.')}
                    </p>
                  </div>
                </div>

                {/* SECCIÓN 2: METADATOS */}
                <div className="flex items-center gap-8 px-4 lg:border-x lg:border-slate-50">
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">
                      {isDeleted ? 'Borrado el' : 'Registrado el'}
                    </span>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} className={isDeleted ? 'text-rose-400' : 'text-indigo-400'} />
                      <span className="text-xs font-bold">
                        {new Date(isDeleted ? file.fechaBorrado : file.fechaRegistroSistema).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: ACCIONES CONDICIONALES */}
                <div className="flex items-center justify-end gap-3">
                  {isDeleted ? (
                    // BOTONES PARA PAPELERA
                    <>
                      <button 
                        className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                        title="Eliminar permanentemente"
                        onClick={() => toast("Función de borrado físico próximamente")}
                      >
                        <ShieldAlert size={20} />
                      </button>
                    </>
                  ) : (
                    // BOTONES PARA ARCHIVOS ACTIVOS
                    <>
                      <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all">
                        <ExternalLink size={16} />
                        <span>Abrir</span>
                      </a>
                      <button onClick={() => onEdit(file)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Edit3 size={20} />
                      </button>
                      <button onClick={() => handleDelete(file.id, file.nombreOriginal)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileTable;