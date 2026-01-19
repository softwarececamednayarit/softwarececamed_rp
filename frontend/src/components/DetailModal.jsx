import React from 'react';
import { 
  X, User, Calendar, Tag, Building2, MessageSquare, Fingerprint,
  Phone, Mail, MapPin, FileText, Activity, List,
  Globe, IdCard, AlertTriangle, Stethoscope, Clock, CheckCircle,
  Copy // <--- 1. IMPORTAMOS EL ICONO COPY
} from 'lucide-react';
import { formatDate, formatName, getStatusColor } from '../utils/formatters';

export const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  // --- SOLUCIÓN AL BUG DE ARRAYS ---
  // Esta función normaliza cualquier formato extraño que venga de Firebase
  const getAllTags = () => {
    const rawArrays = [
      item.categorias_asesoria,
      item.categorias_orientacion,
      item.categorias_gestion,
      item.categorias_tipo_queja,
      item.categorias_queja
    ];

    let cleanTags = [];

    rawArrays.forEach(field => {
      if (!field) return;

      // Caso 1: Es un Array normal de Javascript ["A", "B"]
      if (Array.isArray(field)) {
        field.forEach(tag => {
          if (typeof tag === 'string') cleanTags.push(tag);
          else if (tag.stringValue) cleanTags.push(tag.stringValue); // Formato raro
        });
      }
      // Caso 2: Es un Objeto de Firestore { values: [...] }
      else if (field.values && Array.isArray(field.values)) {
        field.values.forEach(v => {
          if (v.stringValue) cleanTags.push(v.stringValue);
          else if (typeof v === 'string') cleanTags.push(v);
        });
      }
    });

    return cleanTags;
  };

  const activeTags = getAllTags();

  // --- 2. NUEVA FUNCIÓN PARA COPIAR DATOS (SIMPLIFICADA) ---
  const handleCopyForPlatform = () => {
    // El usuario solicitó copiar TODO el objeto sin filtrar/mapear campos específicos.
    // Esto es útil si el script receptor (Tampermonkey) es inteligente o si quieres tener toda la data disponible.
    
    const dataExport = { ...item }; // Hacemos una copia simple del objeto

    // Copiamos todo el objeto JSON crudo al portapapeles
    navigator.clipboard.writeText(JSON.stringify(dataExport))
      .then(() => {
        alert("📋 Expediente completo copiado al portapapeles.\n\nAhora ve a la plataforma externa y captura los datos.");
      })
      .catch(err => console.error("Error al copiar:", err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Contenedor Principal */}
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* --- ENCABEZADO --- */}
        <div className="bg-slate-900 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
            <Fingerprint size={240} />
          </div>

          <div className="relative flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md hidden sm:block">
                <Fingerprint className="text-indigo-400" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Expediente Digital</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider w-fit ${getStatusColor(item.tipo)}`}>
                    {item.tipo || 'GENERAL'}
                  </span>
                  <p className="text-indigo-300 text-xs font-mono">
                     ID: {item.id || 'N/A'}
                  </p>
                </div>
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

        {/* --- CUERPO SCROLLABLE --- */}
        <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          
          {/* SECCIÓN 1: DATOS DEL CIUDADANO */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={14} /> Información del Solicitante
            </h3>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-3 lg:col-span-1 space-y-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Nombre Completo</span>
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  {formatName(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno || ''}`)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.sexo && <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{item.sexo}</span>}
                  {(item.edad || item.edad_o_nacimiento) && <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{item.edad || item.edad_o_nacimiento}</span>}
                  {item.nacionalidad && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold flex items-center gap-1"><Globe size={10}/> {item.nacionalidad}</span>}
                </div>
              </div>

              <div className="space-y-4">
                {item.identificacion_tipo && (
                   <div>
                     <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><IdCard size={10}/> Identificación</span>
                     <p className="text-sm font-medium text-slate-700">{item.identificacion_tipo} {item.identificacion_numero ? `- ${item.identificacion_numero}` : ''}</p>
                   </div>
                )}
                {item.grupo_vulnerable && (
                   <div>
                     <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Grupo Vulnerable</span>
                     <p className="text-sm font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg w-fit mt-1">{item.grupo_vulnerable}</p>
                   </div>
                )}
              </div>

              <div className="space-y-3 border-l border-slate-100 pl-4 md:pl-6">
                <div>
                   <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Phone size={10}/> Teléfono</span>
                   <p className="text-sm font-medium text-slate-700">{item.telefono || 'Sin registro'}</p>
                </div>
                <div>
                   <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Mail size={10}/> Correo</span>
                   <p className="text-sm font-medium text-slate-700 truncate" title={item.correo}>{item.correo || 'Sin registro'}</p>
                </div>
                <div>
                   <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><MapPin size={10}/> Ubicación</span>
                   <p className="text-sm font-medium text-slate-700 text-xs">
                     {[item.domicilio_ciudadano, item.entidad_federativa].filter(Boolean).join(', ')}
                   </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: DETALLES DEL TRÁMITE */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} /> Detalles del Caso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                   <div className="flex justify-between">
                     <div>
                       <span className="text-[10px] uppercase text-slate-400 font-bold">Fecha Recepción</span>
                       <p className="text-sm font-bold text-slate-800">{formatDate(item.fecha_recepcion)}</p>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] uppercase text-slate-400 font-bold">Forma Recepción</span>
                       <p className="text-sm font-bold text-slate-800">{item.forma_recepcion || 'N/A'}</p>
                     </div>
                   </div>
                   
                   {(item.fecha_inicio_proceso || item.fecha_conclusion) && (
                     <div className="pt-3 border-t border-slate-100 flex gap-4">
                        {item.fecha_inicio_proceso && (
                          <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                            <Clock size={12}/> Inicio: {formatDate(item.fecha_inicio_proceso)}
                          </div>
                        )}
                        {item.fecha_conclusion && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                            <CheckCircle size={12}/> Fin: {formatDate(item.fecha_conclusion)}
                          </div>
                        )}
                     </div>
                   )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                   <div>
                     <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Building2 size={10}/> Institución / Autoridad</span>
                     <p className="text-base font-bold text-slate-800 mt-1">
                       {item.institucion || item.autoridad_responsable || 'No especificada'}
                     </p>
                   </div>
                   
                   {(item.unidad_medica || item.medico_nombre || item.especialidad_medica) && (
                     <div className="bg-slate-50 p-3 rounded-xl space-y-2 mt-2">
                       {item.unidad_medica && <p className="text-xs text-slate-600"><span className="font-bold">Unidad:</span> {item.unidad_medica}</p>}
                       {item.unidad_medica_domicilio && <p className="text-xs text-slate-500 pl-2">📍 {item.unidad_medica_domicilio}</p>}
                       {item.especialidad_medica && <p className="text-xs text-slate-600"><span className="font-bold">Especialidad:</span> {item.especialidad_medica}</p>}
                       {item.medico_nombre && (
                         <div className="flex items-start gap-2 text-xs text-slate-600 mt-1 pt-1 border-t border-slate-200">
                           <Stethoscope size={12} className="shrink-0 mt-0.5"/> 
                           <div>
                             <span className="font-bold">Médico:</span> {item.medico_nombre}
                             {item.medico_direccion && <p className="text-[10px] text-slate-400">{item.medico_direccion}</p>}
                           </div>
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Motivo Principal</span>
                      <p className="text-sm font-bold text-slate-800">{item.motivo_principal || 'Sin especificar'}</p>
                      {item.submotivo && <p className="text-xs text-slate-500 mt-1">↳ {item.submotivo}</p>}
                    </div>

                    {item.criterio_medico && (
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Criterio Médico</span>
                        <p className="text-xs text-slate-600 mt-1">{item.criterio_medico}</p>
                      </div>
                    )}

                    {activeTags.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                         <span className="text-[10px] uppercase text-slate-400 font-bold mb-2 block flex items-center gap-1"><Tag size={10}/> Clasificación Temática</span>
                         <div className="flex flex-wrap gap-2">
                           {activeTags.map((tag, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                               {tag}
                             </span>
                           ))}
                         </div>
                      </div>
                    )}
                 </div>

                 {item.pretensiones && (
                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Pretensiones del Usuario</span>
                      <p className="text-xs font-medium text-slate-700 mt-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-50">
                        {item.pretensiones}
                      </p>
                   </div>
                 )}
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: NARRATIVA Y SEGUIMIENTO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={14} /> Descripción de Hechos / Queja
               </h3>
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                 <div className="prose prose-sm max-w-none text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                   {item.descripcion_hechos || item.motivo_queja_detalle || 'Sin narrativa capturada.'}
                 </div>
               </div>
            </div>

            {(item.seguimiento_bitacora || item.observaciones) && (
              <div className="space-y-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <List size={14} /> Bitácora de Seguimiento
                 </h3>
                 <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 shadow-sm h-full">
                   <div className="prose prose-sm max-w-none text-emerald-900 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                     {item.seguimiento_bitacora || item.observaciones}
                   </div>
                 </div>
              </div>
            )}
          </section>

        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          
          <button 
            onClick={handleCopyForPlatform}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold text-xs transition-colors border border-indigo-100 shadow-sm"
            title="Copiar datos para pegar en SIREMED/Plataforma Estatal"
          >
            <Copy size={16} /> 
            <span className="hidden sm:inline">Copiar para Plataforma</span>
            <span className="sm:hidden">Copiar</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-[10px] text-slate-400 font-medium hidden md:block text-right">
              Gestión CECA<span className="text-indigo-500">MED</span> <br/>Documento Confidencial
            </div>
            <button 
              onClick={onClose}
              className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};