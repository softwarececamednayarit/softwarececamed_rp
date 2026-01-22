import React, { useState, useEffect } from 'react';
import { 
  X, User, Calendar, Tag, Building2, MessageSquare, Fingerprint,
  Phone, Mail, MapPin, FileText, Activity, List,
  Globe, IdCard, AlertTriangle, Stethoscope, Clock, CheckCircle,
  Copy, Save, Loader2, FileEdit, Layout, Pencil, Ban
} from 'lucide-react';
import { formatDate, formatName, getStatusColor } from '../utils/formatters';
import { AtendidosService } from '../services/AtendidosService'; 

export const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'padron'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Nuevo estado para controlar si estamos editando o solo viendo
  const [isEditingPadron, setIsEditingPadron] = useState(false);

  const [fullData, setFullData] = useState(null);
  
  const [padronForm, setPadronForm] = useState({
    tipo_beneficiario: '',
    criterio_seleccion: '',
    tipo_apoyo: '',
    monto_apoyo: '',
    parentesco: '',
    estado_civil: '',
    cargo_ocupacion: '',
    actividad_apoyo: '',
    municipio: '',
    localidad: ''
  });

  // --- EFECTO: CARGAR DATOS COMPLETOS ---
  useEffect(() => {
    let isMounted = true;
    const fetchFullData = async () => {
      try {
        setLoading(true);
        const response = await AtendidosService.getCompleto(item.id);
        
        if (isMounted && response.ok) {
          setFullData(response.data);
          setPadronForm({
            tipo_beneficiario: response.data.tipo_beneficiario || '',
            criterio_seleccion: response.data.criterio_seleccion || '',
            tipo_apoyo: response.data.tipo_apoyo || '',
            monto_apoyo: response.data.monto_apoyo || '',
            parentesco: response.data.parentesco || '',
            estado_civil: response.data.estado_civil || '',
            cargo_ocupacion: response.data.cargo_ocupacion || '',
            actividad_apoyo: response.data.actividad_apoyo || '',
            municipio: response.data.municipio || '',
            localidad: response.data.localidad || ''
          });
        }
      } catch (error) {
        console.error("Error cargando expediente completo", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFullData();
    return () => { isMounted = false; };
  }, [item.id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPadronForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePadron = async () => {
    try {
      setSaving(true);
      await AtendidosService.updatePadron(item.id, padronForm);
      alert("✅ Información de Padrón actualizada correctamente.");
      
      setFullData(prev => ({ ...prev, ...padronForm }));
      setIsEditingPadron(false); // Salir del modo edición al guardar
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar la información.");
    } finally {
      setSaving(false);
    }
  };

  // Usamos fullData si ya cargó, si no usamos item (data ligera) para mostrar algo mientras carga
  const displayData = fullData || item;

  // Helper para renderizar campos vacíos de forma visual en modo lectura
  const RenderField = ({ label, value, icon: Icon }) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 block flex items-center gap-1">
            {Icon && <Icon size={10} />} {label}
        </span>
        {value ? (
            <p className="text-sm font-bold text-slate-700">{value}</p>
        ) : (
            <p className="text-xs text-slate-400 italic">No registrado</p>
        )}
    </div>
  );

  // --- HELPERS EXISTENTES ---
  const getAllTags = () => {
    const rawArrays = [
      displayData.categorias_asesoria,
      displayData.categorias_orientacion,
      displayData.categorias_gestion,
      displayData.categorias_tipo_queja,
      displayData.categorias_queja
    ];
    let cleanTags = [];
    rawArrays.forEach(field => {
      if (!field) return;
      if (Array.isArray(field)) {
        field.forEach(tag => {
            if (typeof tag === 'string') cleanTags.push(tag);
            else if (tag.stringValue) cleanTags.push(tag.stringValue);
        });
      } else if (field.values && Array.isArray(field.values)) {
        field.values.forEach(v => {
            if (v.stringValue) cleanTags.push(v.stringValue);
            else if (typeof v === 'string') cleanTags.push(v);
        });
      }
    });
    return cleanTags;
  };

  const activeTags = getAllTags();

  const handleCopyForPlatform = () => {
    const dataExport = { ...displayData };
    navigator.clipboard.writeText(JSON.stringify(dataExport))
      .then(() => alert("📋 Expediente copiado al portapapeles."))
      .catch(err => console.error("Error al copiar:", err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider w-fit ${getStatusColor(displayData.tipo)}`}>
                    {displayData.tipo || 'GENERAL'}
                  </span>
                  <p className="text-indigo-300 text-xs font-mono">ID: {displayData.id || 'N/A'}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* --- PESTAÑAS (TABS) --- */}
          <div className="flex gap-4 mt-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'general' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2"><Layout size={16}/> Vista General</span>
              {activeTab === 'general' && <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-full"></span>}
            </button>
            
            <button
              onClick={() => setActiveTab('padron')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'padron' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2"><FileEdit size={16}/> Padrón / Detalles</span>
              {activeTab === 'padron' && <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full"></span>}
            </button>
          </div>
        </div>

        {/* --- CUERPO SCROLLABLE --- */}
        <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          )}

          {/* ================= PESTAÑA 1: GENERAL (COMPLETA) ================= */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* SECCIÓN 1: DATOS DEL CIUDADANO */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User size={14} /> Información del Solicitante
                </h3>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="md:col-span-3 lg:col-span-1 space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-bold">Nombre Completo</span>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {formatName(`${displayData.nombre} ${displayData.apellido_paterno} ${displayData.apellido_materno || ''}`)}
                    </p>
                    
                    {/* CURP */}
                    <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-100 inline-block">
                        <span className="text-[10px] uppercase text-indigo-400 font-bold block">CURP</span>
                        <p className="text-sm font-mono font-bold text-indigo-900 tracking-wide">
                            {displayData.curp || 'NO REGISTRADA'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {displayData.sexo && <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{displayData.sexo}</span>}
                      {(displayData.edad || displayData.edad_o_nacimiento) && <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{displayData.edad || displayData.edad_o_nacimiento}</span>}
                      {displayData.nacionalidad && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold flex items-center gap-1"><Globe size={10}/> {displayData.nacionalidad}</span>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {displayData.identificacion_tipo && (
                       <div>
                         <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><IdCard size={10}/> Identificación</span>
                         <p className="text-sm font-medium text-slate-700">{displayData.identificacion_tipo} {displayData.identificacion_numero ? `- ${displayData.identificacion_numero}` : ''}</p>
                       </div>
                    )}
                    {displayData.grupo_vulnerable && (
                       <div>
                         <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Grupo Vulnerable</span>
                         <p className="text-sm font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-lg w-fit mt-1">{displayData.grupo_vulnerable}</p>
                       </div>
                    )}
                  </div>

                  <div className="space-y-3 border-l border-slate-100 pl-4 md:pl-6">
                    <div>
                       <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Phone size={10}/> Teléfono</span>
                       <p className="text-sm font-medium text-slate-700">{displayData.telefono || 'Sin registro'}</p>
                    </div>
                    <div>
                       <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Mail size={10}/> Correo</span>
                       <p className="text-sm font-medium text-slate-700 truncate" title={displayData.correo}>{displayData.correo || 'Sin registro'}</p>
                    </div>
                    <div>
                       <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><MapPin size={10}/> Ubicación</span>
                       <p className="text-sm font-medium text-slate-700 text-xs">
                         {[displayData.domicilio_ciudadano, displayData.entidad_federativa].filter(Boolean).join(', ')}
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
                                <p className="text-sm font-bold text-slate-800">{formatDate(displayData.fecha_recepcion)}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase text-slate-400 font-bold">Forma Recepción</span>
                                <p className="text-sm font-bold text-slate-800">{displayData.forma_recepcion || 'N/A'}</p>
                              </div>
                           </div>
                           
                           {(displayData.fecha_inicio_proceso || displayData.fecha_conclusion) && (
                             <div className="pt-3 border-t border-slate-100 flex gap-4">
                                {displayData.fecha_inicio_proceso && (
                                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                                    <Clock size={12}/> Inicio: {formatDate(displayData.fecha_inicio_proceso)}
                                  </div>
                                )}
                                {displayData.fecha_conclusion && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                                    <CheckCircle size={12}/> Fin: {formatDate(displayData.fecha_conclusion)}
                                  </div>
                                )}
                             </div>
                           )}
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                           <div>
                             <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1"><Building2 size={10}/> Institución / Autoridad</span>
                             <p className="text-base font-bold text-slate-800 mt-1">
                               {displayData.institucion || displayData.autoridad_responsable || 'No especificada'}
                             </p>
                           </div>
                           
                           {(displayData.unidad_medica || displayData.medico_nombre || displayData.especialidad_medica) && (
                             <div className="bg-slate-50 p-3 rounded-xl space-y-2 mt-2">
                               {displayData.unidad_medica && <p className="text-xs text-slate-600"><span className="font-bold">Unidad:</span> {displayData.unidad_medica}</p>}
                               {displayData.unidad_medica_domicilio && <p className="text-xs text-slate-500 pl-2">📍 {displayData.unidad_medica_domicilio}</p>}
                               {displayData.especialidad_medica && <p className="text-xs text-slate-600"><span className="font-bold">Especialidad:</span> {displayData.especialidad_medica}</p>}
                               {displayData.medico_nombre && (
                                 <div className="flex items-start gap-2 text-xs text-slate-600 mt-1 pt-1 border-t border-slate-200">
                                   <Stethoscope size={12} className="shrink-0 mt-0.5"/> 
                                   <div>
                                     <span className="font-bold">Médico:</span> {displayData.medico_nombre}
                                     {displayData.medico_direccion && <p className="text-[10px] text-slate-400">{displayData.medico_direccion}</p>}
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
                               <p className="text-sm font-bold text-slate-800">{displayData.motivo_principal || 'Sin especificar'}</p>
                               {displayData.submotivo && <p className="text-xs text-slate-500 mt-1">↳ {displayData.submotivo}</p>}
                            </div>

                            {displayData.criterio_medico && (
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 font-bold">Criterio Médico</span>
                                <p className="text-xs text-slate-600 mt-1">{displayData.criterio_medico}</p>
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

                         {displayData.pretensiones && (
                           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[10px] uppercase text-slate-400 font-bold">Pretensiones del Usuario</span>
                              <p className="text-xs font-medium text-slate-700 mt-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-50">
                                {displayData.pretensiones}
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
                       {displayData.descripcion_hechos || displayData.motivo_queja_detalle || 'Sin narrativa capturada.'}
                     </div>
                   </div>
                </div>

                {(displayData.seguimiento_bitacora || displayData.observaciones) && (
                  <div className="space-y-2">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <List size={14} /> Bitácora de Seguimiento
                     </h3>
                     <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100/50 shadow-sm h-full">
                       <div className="prose prose-sm max-w-none text-emerald-900 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                         {displayData.seguimiento_bitacora || displayData.observaciones}
                       </div>
                     </div>
                  </div>
                )}
              </section>

            </div>
          )}

          {/* ================= PESTAÑA 2: PADRÓN ================= */}
          {activeTab === 'padron' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
              
              {!isEditingPadron ? (
                // --- MODO LECTURA (READ ONLY) ---
                <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-900 text-sm">Datos del Padrón</h4>
                                <p className="text-xs text-emerald-700">Resumen de información complementaria.</p>
                            </div>
                        </div>
                        {/* Botón flotante superior para editar rápido */}
                        <button 
                            onClick={() => setIsEditingPadron(true)}
                            className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Pencil size={12} /> Editar / Completar
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ubicación */}
                        <div className="md:col-span-2 pb-2 border-b border-slate-100">
                             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ubicación</h5>
                        </div>
                        <RenderField label="Municipio" value={displayData.municipio} icon={MapPin} />
                        <RenderField label="Localidad" value={displayData.localidad} />

                        {/* Socioeconómico */}
                        <div className="md:col-span-2 pb-2 border-b border-slate-100 mt-2">
                             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Socioeconómico</h5>
                        </div>
                        <RenderField label="Estado Civil" value={displayData.estado_civil} />
                        <RenderField label="Ocupación" value={displayData.cargo_ocupacion} />
                        <RenderField label="Tipo Beneficiario" value={displayData.tipo_beneficiario} />
                        <RenderField label="Parentesco" value={displayData.parentesco} />

                        {/* Apoyo */}
                        <div className="md:col-span-2 pb-2 border-b border-slate-100 mt-2">
                             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Gestión / Apoyo</h5>
                        </div>
                        <RenderField label="Tipo de Apoyo" value={displayData.tipo_apoyo} />
                        <RenderField label="Monto" value={displayData.monto_apoyo ? `$${displayData.monto_apoyo}` : null} />
                        
                        <div className="md:col-span-2">
                             <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Criterio / Actividad</span>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700">
                                 {displayData.criterio_seleccion || <span className="text-slate-400 italic">No especificado</span>}
                             </div>
                        </div>
                    </div>
                </div>

              ) : (
                // --- MODO EDICIÓN (FORMULARIO) ---
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                            <FileEdit size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-sm">Editando Información</h4>
                            <p className="text-xs text-indigo-700 mt-1">
                            Complete los campos faltantes. Los cambios se reflejarán en el padrón de beneficiarios.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm border-2 border-indigo-50">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            <div className="md:col-span-2">
                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Ubicación del Beneficiario</h5>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Municipio</label>
                              <select
                                  name="municipio"
                                  value={padronForm.municipio}
                                  onChange={handleInputChange}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              >
                                  <option value="">Seleccione...</option>
                                  {[
                                      "Acaponeta","Ahuacatlán","Amatlán de Cañas","Bahía de Banderas",
                                      "Compostela","Del Nayar","Huajicori","Ixtlán del Río",
                                      "Jala","La Yesca","Rosamorada","Ruiz","San Blas",
                                      "San Pedro Lagunillas","Santa María del Oro",
                                      "Santiago Ixcuintla","Tecuala","Tepic","Tuxpan","Xalisco"
                                  ].map(m => (
                                      <option key={m} value={m}>{m}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Estado Civil</label>
                              <select
                                  name="estado_civil"
                                  value={padronForm.estado_civil || "Soltero(a)"}
                                  onChange={handleInputChange}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              >
                                  <option value="Soltero(a)">Soltero(a)</option>
                                  <option value="Casado(a)">Casado(a)</option>
                                  <option value="Unión libre">Unión libre</option>
                                  <option value="Viudo(a)">Viudo(a)</option>
                                  <option value="Divorciado(a)">Divorciado(a)</option>
                                  <option value="Separado(a)">Separado(a)</option>
                                  <option value="No Aplica">No Aplica</option>
                              </select>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Tipo Beneficiario</label>
                              <select
                                  name="tipo_beneficiario"
                                  value={padronForm.tipo_beneficiario || "Directo"}
                                  onChange={handleInputChange}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              >
                                  <option value="Directo">Directo</option>
                                  <option value="Indirecto">Indirecto</option>
                              </select>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Parentesco</label>
                              <select
                                  name="parentesco"
                                  value={padronForm.parentesco || "Beneficiario"}
                                  onChange={handleInputChange}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              >
                                  {[
                                      "Beneficiario","Cónyuge o Compañero(a)","Padre o Madre","Hijo(a)",
                                      "Abuelo(a)","Hermano(a)","Nieto(a)","Suegro(a)",
                                      "Sobrino(a)","Yerno o Nuera","Hijastro(a) / Entendado(a)",
                                      "No Tiene Parentesco","Otro Parentesco","No Respondió"
                                  ].map(p => (
                                      <option key={p} value={p}>{p}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Tipo Apoyo</label>
                              <select
                                  name="tipo_apoyo"
                                  value={padronForm.tipo_apoyo || "Servicio"}
                                  onChange={handleInputChange}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              >
                                  <option value="Servicio">Servicio</option>
                                  <option value="Especie">Especie</option>
                                  <option value="Monetario">Monetario</option>
                                  <option value="Producto Subsidiado">Producto Subsidiado</option>
                                  <option value="Mixto">Mixto</option>
                                  <option value="Estatal">Estatal</option>
                              </select>
                          </div>

                          <div className="md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-slate-700 ml-1">Criterio / Actividad</label>
                              <textarea
                                  name="criterio_seleccion"
                                  value={padronForm.criterio_seleccion || "Servidor Público Estatal"}
                                  onChange={handleInputChange}
                                  rows="2"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                              />
                          </div>
                        </form>
                    </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* --- FOOTER DINÁMICO --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          
          <button 
            onClick={handleCopyForPlatform}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold text-xs transition-colors border border-indigo-100 shadow-sm"
          >
            <Copy size={16} /> 
            <span className="hidden sm:inline">Copiar JSON</span>
          </button>

          <div className="flex items-center gap-4">
            
            {/* LOGICA DE BOTONES PARA PADRON */}
            {activeTab === 'padron' ? (
                // Si estamos en la pestaña PADRON
                isEditingPadron ? (
                    // MODO EDICION: Mostrar Cancelar + Guardar
                    <>
                        <button 
                           onClick={() => setIsEditingPadron(false)}
                           className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <Ban size={16}/> Cancelar
                        </button>
                        <button 
                          onClick={handleSavePadron}
                          disabled={saving}
                          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70"
                        >
                          {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                          {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </>
                ) : (
                    // MODO LECTURA: Mostrar Botón para ir a Editar
                    <button 
                        onClick={() => setIsEditingPadron(true)}
                        className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                    >
                        <Pencil size={18}/> Completar / Editar Datos
                    </button>
                )
            ) : (
                // Si estamos en la pestaña GENERAL
                <div className="text-[10px] text-slate-400 font-medium hidden md:block text-right">
                    Gestión CECA<span className="text-indigo-500">MED</span> <br/>Documento Confidencial
                </div>
            )}

            <button 
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};