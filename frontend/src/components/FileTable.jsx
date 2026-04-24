import React from 'react';
import { 
  FileText, ExternalLink, Trash2, 
  Calendar, Building2, Hash, Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2'; // El que faltaba en la lista
import archivosService from '../services/archivosService';

const FileTable = ({ archivos, onRefresh, onEdit }) => {
  
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 
      ? `${(kb / 1024).toFixed(1)} MB` 
      : `${kb.toFixed(1)} KB`;
  };

  // Función funcional de eliminación
  const handleDelete = async (id, nombre) => {
    // Confirmación con SweetAlert2 para que combine con tu UI
    const result = await Swal.fire({
      title: '¿Mover a la papelera?',
      text: `El expediente "${nombre}" se marcará como borrado PERMANENTEMENTE.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e293b', // slate-900
      cancelButtonColor: '#94a3b8', // slate-400
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-xl px-6 py-2',
        cancelButton: 'rounded-xl px-6 py-2'
      }
    });

    if (result.isConfirmed) {
      const toastId = toast.loading("Eliminando expediente...");
      try {
        // Llamada al servicio patch que ya tienes en archivosService
        const response = await archivosService.eliminarArchivo(id);
        
        if (response.success) {
          toast.success("Expediente movido a la papelera", { id: toastId });
          onRefresh(); // Recarga la lista en Archivos.jsx
        }
      } catch (error) {
        toast.error("No se pudo eliminar el archivo", { id: toastId });
        console.error(error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {archivos.map((file) => (
          <div 
            key={file.id} 
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-5 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* SECCIÓN 1: IDENTIDAD DEL DOCUMENTO */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FileText size={28} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Activo" />
                </div>
                
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-800 text-lg leading-tight tracking-tight">
                      {file.nombreOriginal || 'Documento sin nombre'}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md uppercase tracking-wider">
                      {formatSize(file.size)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium line-clamp-1 max-w-xl">
                    {file.asunto || 'Sin asunto registrado para este oficio.'}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                      <Building2 size={12} />
                      {file.origen || 'Origen no especificado'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <Hash size={12} />
                      {file.noOficio}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: METADATOS DE REGISTRO */}
              <div className="flex items-center gap-8 px-4 lg:border-x lg:border-slate-50">
                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Registrado el</span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold">
                      {new Date(file.fechaRegistroSistema).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Por puesto</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                      {file.propietarioRol}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: ACCIONES RÁPIDAS */}
              <div className="flex items-center justify-end gap-3">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all duration-300 group/btn"
                >
                  <ExternalLink size={16} className="group-hover/btn:scale-110 transition-transform" />
                  <span>Abrir</span>
                </a>
                
                <button 
                  onClick={() => onEdit(file)}
                  className="flex items-center gap-2 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group/edit"
                  title="Editar expediente"
                >
                  <Edit3 size={20} className="group-hover/edit:rotate-12 transition-transform" />
                </button>

                {/* Botón de eliminar directo (Sustituye a MoreVertical) */}
                <button 
                  onClick={() => handleDelete(file.id, file.nombreOriginal)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTable;