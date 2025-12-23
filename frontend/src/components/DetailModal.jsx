import { X, User, Calendar, Tag, Building2, MessageSquare, Fingerprint } from 'lucide-react';
import { formatDate, formatName, getStatusColor } from '../utils/formatters';

export const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con desenfoque suave */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Contenedor del Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Encabezado Estilizado */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
            <Fingerprint size={200} />
          </div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Fingerprint className="text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Expediente Digital</h2>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Folio de Seguimiento</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cuerpo de la Ficha */}
        <div className="p-8 md:p-10 space-y-10">
          
          {/* Grid de Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Ciudadano */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Nombre del Solicitante</span>
              </div>
              <p className="text-lg font-bold text-slate-900 leading-tight">
                {formatName(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno || ''}`)}
              </p>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Fecha de Registro</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {formatDate(item.fecha_recepcion)}
              </p>
            </div>

            {/* Tipo de Trámite */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Tag size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Categoría de Atención</span>
              </div>
              <div>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusColor(item.tipo)}`}>
                  {item.tipo || 'No especificado'}
                </span>
              </div>
            </div>

            {/* Autoridad */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Institución / Autoridad</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {item.autoridad_responsable || 'Pendiente de asignar'}
              </p>
            </div>
          </div>

          {/* Sección de Observaciones */}
          <div className="bg-slate-50 rounded-[2rem] p-7 border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Observaciones y Detalles</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              {item.observaciones || 'No existen notas adicionales para este registro.'}
            </p>
          </div>
        </div>

        {/* Footer con acciones adicionales */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <div className="text-[10px] text-slate-400 font-medium">
            Sistema de Gestión CECA<span className="text-indigo-400">MED</span> v2.0
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};