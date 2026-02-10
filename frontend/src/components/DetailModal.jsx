import React, { useState, useEffect } from 'react';
import { 
  X, User, Calendar, Tag, Building2, MessageSquare, Fingerprint,
  Phone, Mail, MapPin, FileText, Activity, List,
  Globe, IdCard, AlertTriangle, Stethoscope, Clock, CheckCircle,
  Copy, Save, Loader2, FileEdit, Layout, Pencil, Ban, Briefcase,
  PhoneCall, Map, UserCheck, AlertCircle, HelpCircle, Scale, Trash2, Target
} from 'lucide-react';
import { formatDate, formatName, getStatusColor } from '../utils/formatters';
import { AtendidosService } from '../services/atendidosService'; 

// =============================================================================
// CATÁLOGOS ESTÁTICOS
// =============================================================================

const ESPECIALIDADES_LISTA = [
  "URGENCIAS", "ANESTESIOLOGÍA", "CARDIOLOGÍA", "CIRUGÍA CARDIOTORÁCICA",
  "CIRUGÍA DE GASTROENTEROLOGÍA", "CIRUGÍA GENERAL", "CIRUGÍA NEUROLÓGICA",
  "CIRUGÍA PEDIÁTRICA", "CIRUGÍA PLÁSTICA ESTÉTICA Y RECONSTRUCTIVA",
  "CIRUGÍA VASCULAR Y ANGIOLOGÍA", "DERMATOLOGÍA", "ESPECIALIDADES ODONTOLÓGICAS",
  "GASTROENTEROLOGÍA", "GINECOLOGÍA Y OBSTETRICIA", "HEMATOLOGÍA",
  "MEDICINA CRÍTICA-TERAPIA INTENSIVA", "MEDICINA GENERAL", "MEDICINA INTERNA",
  "NEFROLOGÍA", "NEONATOLOGÍA", "NEUMOLOGÍA", "NEUROLOGÍA",
  "ODONTOLOGÍA GENERAL", "OFTALMOLOGÍA", "ONCOLOGÍA", "OTORRINOLARINGOLOGÍA",
  "PEDIATRÍA", "PSIQUIATRÍA", "REUMATOLOGÍA",
  "SERVICIOS AUXILIARES DE DIAGNÓSTICO Y TRATAMIENTO",
  "TRAUMATOLOGÍA Y ORTOPEDIA", "UROLOGÍA", "OTROS"
];

const MOTIVOS_CATALOGO = {
  "TRATAMIENTO MÉDICO": [
    "ACCIDENTES E INCIDENTES", "COMPLICACIONES SECUNDARIAS", 
    "DESINFORMACIÓN SOBRE EL TRATAMIENTO", "FALTA DE CONSENTIMIENTO", 
    "RETRASO DEL TRATAMIENTO", "SECUELAS: EXCESO TERAPEUTICO", 
    "TRATAMIENTO INADECUADO O INNECESARIO", "TRATAMIENTO INSATISFACTORIO", "OTRO (ESPECIFIQUE)"
  ],
  "TRATAMIENTO QUIRÚRGICO": [
    "ACCIDENTES E INCIDENTES", "ALTA PREMATURA DE LOS CIUDADANOS POSTOPERATORIOS",
    "CIRUGIA INNECESARIA", "COMPLICACIONES QUIRÚRGICAS DEL POST OPERATORIO",
    "COMPLICACIONES QUIRÚRGICAS DEL TRANS OPERATORIO", "ERROR QUIRÚRGICO",
    "FALTA DE CARETA DE CONOCIMIENTO INFORMATIVO", 
    "FALTA DE SEGUIMIENTO O SEGUIMIENTO INADECUADO EN EL POSTOPERATORIO",
    "FALTA DE VALORACION PRE QUIRÚRGICA", "RETRASO DEL TRATAMIENTO QUIRÚRGICO",
    "SECUELAS", "TECNICA QUIRÚRGICA INADECUADA", 
    "TRATAMIENTO QUIRÚRGICO NO SATISFACTORIO", "OTRO (ESPECIFIQUE)"
  ],
  "DEFICIENCIAS ADMINISTRATIVAS": [
    "CAMBIO DE MÉDICO TRATANTE O DE UNIDAD MÉDICA", 
    "DEMORA PROLONGADA Y/O DIFERIMENTO PARA OBTENER EL SERVICIO",
    "FALTA DE EQUIPO MEDICO", "FALTA DE INSUMOS O MEDICAMENTOS",
    "FALTA DE PERSONAL", "NEGACIÓN DE LA ATENCIÓN", 
    "SISTEMA DE REFERENCIA Y CONTRAREFERENCIA", 
    "TRATO INADECUADO POR PARTE DEL PERSONAL ADMINISTRATIVO", "OTRO (ESPECIFIQUE)"
  ],
  "AUXILIARES DE DIAGNOSTICO Y TRATAMIENTO": [
    "COMPLICACIONES SECUNDARIAS DE LOS PROCEDIMIENTOS DIAGNÓSTICOS",
    "ESTUDIOS INNECESARIOS", "FALSOS POSITIVOS O NEGATIVOS",
    "FALTA DE INFORMACIÓN Y CONOCIMIENTO", "RETRASO DEL PROCEDIMIENTO DIAGNÓSTICO",
    "RETRASO O FALTA DE NOTIFICACIÓN DE RESULTADOS", "SECUELAS", "OTRO (ESPECIFIQUE)"
  ],
  "DIAGNÓSTICO": [
    "DESINFORMACIÓN SOBRE EL DIAGNÓSTICO", "DIAGNÓSTICO ERRÓNEO",
    "OMISION DEL DIAGNOSTICO", "RETRASO DEL DIAGNÓSTICO", "OTRO (ESPECIFIQUE)"
  ],
  "RELACIÓN MÉDICO PACIENTE": [
    "FALLAS EN LA COMUNICACION", "TRATAMIENTO INADECUADO",
    "FALSAS EXPECTATIVAS", "OTRO (ESPECIFIQUE)"
  ]
};

const ESTATUS_SIREMED_OPCIONES = [
  "PENDIENTE",
  "SUBIDO"
];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export const DetailModal = ({ item, onClose, initialTab = 'general' }) => {
  if (!item) return null;

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState(initialTab); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingPadron, setIsEditingPadron] = useState(false);
  const [fullData, setFullData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para controlar inputs manuales (OTROS)
  const [isOtherSpecialty, setIsOtherSpecialty] = useState(false);
  const [isOtherSubmotivo, setIsOtherSubmotivo] = useState(false); // <--- NUEVO ESTADO

  // Estado para estatus SIREMED
  const [statusSiremed, setStatusSiremed] = useState('PENDIENTE');
  const [updatingStatus, setUpdatingStatus] = useState(false); // Para el loading del select

  // Formulario único que agrupa Padrón + Gestión
  const [padronForm, setPadronForm] = useState({
    // -- Datos Padrón --
    tipo_beneficiario: '',
    criterio_seleccion: '',
    tipo_apoyo: '',
    monto_apoyo: '',
    parentesco: '',
    estado_civil: '',
    cargo_ocupacion: '', 
    actividad_apoyo: '',
    municipio: '',
    localidad: '',
    domicilio: '',
    
    // -- Datos Gestión / Queja --
    foraneo: false,
    representante: '',
    via_telefonica: false,
    especialidad: '',
    motivo_inconformidad: '',
    submotivo: '',
    tipo_asunto: '',
    observaciones_servicio: '',
    servicio: '',
    no_asignado: '',
    prestador_nombre: '' ,
    expediente_dga: '',
    fecha_oficio: '',
    numero_oficio: '',
    autoridad_solicitante: '',
    nombre_solicitante: '',
    cargo_solicitante: '',
    expediente_investigacion: '',
    motivo_litis: '',
    sala_medica: '',
    modalidad_conclusion: '',
    submodalidad_conclusion: '',
    resultado_analisis: '',
    danos_salud: '',
    fecha_inicio_proceso: ''
  });

  // --- EFECTO: CARGAR DATOS ---
  useEffect(() => {
    let isMounted = true;
    const fetchFullData = async () => {
      try {
        setLoading(true);
        const response = await AtendidosService.getCompleto(item.id);
        
        if (isMounted && response.ok) {
          const data = response.data;
          setFullData(data);
          setStatusSiremed(data.estatus_siremed || 'PENDIENTE');
          
          // 1. Detección de Especialidad Custom
          const espViene = data.especialidad || '';
          const esEspecialidadEstandar = ESPECIALIDADES_LISTA.includes(espViene);
          if (espViene && !esEspecialidadEstandar) setIsOtherSpecialty(true);

          // 2. Detección de Submotivo Custom (NUEVO)
          const motivoActual = data.motivo_inconformidad;
          const subViene = data.submotivo || '';
          const catalogoSub = MOTIVOS_CATALOGO[motivoActual] || [];

          // Si hay submotivo Y no está en la lista estándar, es un "OTRO" guardado anteriormente
          const esSubmotivoCustom = subViene && !catalogoSub.includes(subViene);
          if (esSubmotivoCustom) setIsOtherSubmotivo(true);
          setPadronForm({
            // Padrón
            tipo_beneficiario: data.tipo_beneficiario || '',
            criterio_seleccion: data.criterio_seleccion || '',
            tipo_apoyo: data.tipo_apoyo || '',
            monto_apoyo: data.monto_apoyo || '',
            parentesco: data.parentesco || '',
            estado_civil: data.estado_civil || '',
            cargo_ocupacion: data.cargo_ocupacion || '',
            actividad_apoyo: data.actividad_apoyo || '',
            municipio: data.municipio || '',
            localidad: data.localidad || '',
            domicilio: data.domicilio || '',
            
            // Gestión
            foraneo: data.foraneo === true || data.foraneo === "true",
            representante: data.representante || '',
            via_telefonica: data.via_telefonica === true || data.via_telefonica === "true",
            especialidad: data.especialidad || '',
            motivo_inconformidad: data.motivo_inconformidad || '',
            submotivo: data.submotivo || '',
            tipo_asunto: data.tipo_asunto || '',
            observaciones_servicio: data.observaciones_servicio || '',
            servicio: data.servicio || '',
            no_asignado: data.no_asignado || '',
            prestador_nombre: data.prestador_nombre || '',
            expediente_dga: data.expediente_dga || '',
            fecha_oficio: data.fecha_oficio || '',
            numero_oficio: data.numero_oficio || '',
            autoridad_solicitante: data.autoridad_solicitante || '',
            nombre_solicitante: data.nombre_solicitante || '',
            cargo_solicitante: data.cargo_solicitante || '',
            expediente_investigacion: data.expediente_investigacion || '',
            motivo_litis: data.motivo_litis || '',
            sala_medica: data.sala_medica || '',
            modalidad_conclusion: data.modalidad_conclusion || '',
            submodalidad_conclusion: data.submodalidad_conclusion || '',
            resultado_analisis: data.resultado_analisis || '',
            danos_salud: data.danos_salud || '',
            fecha_inicio_proceso: data.fecha_inicio_proceso || ''
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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setPadronForm(prev => {
      const newState = { ...prev, [name]: val };
      
      // RESETEO EN CASCADA
      // Si cambia el motivo, limpiar el submotivo y apagar la bandera de 'Otro'
      if (name === 'motivo_inconformidad') {
        newState.submotivo = ''; 
        setIsOtherSubmotivo(false); // Resetear estado de input manual
      }
      return newState;
    });
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      await AtendidosService.updateEstatusSiremed(item.id, newStatus);
      
      setStatusSiremed(newStatus);
      
      setFullData(prev => ({ ...prev, estatus_siremed: newStatus }));
      
    } catch (error) {
      console.error("Error actualizando estatus SIREMED:", error);
      alert("❌ No se pudo actualizar el estatus.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handler para Especialidad (Ya existente)
  const handleSpecialtyChange = (e) => {
    const val = e.target.value;
    if (val === 'OTROS') {
      setIsOtherSpecialty(true);
      setPadronForm(prev => ({ ...prev, especialidad: '' })); 
    } else {
      setIsOtherSpecialty(false);
      setPadronForm(prev => ({ ...prev, especialidad: val }));
    }
  };

  // Handler para Submotivo (NUEVO)
  const handleSubmotivoSelectorChange = (e) => {
    const val = e.target.value;
    if (val === 'OTRO (ESPECIFIQUE)') {
      setIsOtherSubmotivo(true);
      setPadronForm(prev => ({ ...prev, submotivo: '' })); // Limpiar para que el usuario escriba
    } else {
      setIsOtherSubmotivo(false);
      setPadronForm(prev => ({ ...prev, submotivo: val }));
    }
  };

  const handleSavePadron = async () => {
    try {
      setSaving(true);
      await AtendidosService.updatePadron(item.id, padronForm);
      alert("✅ Información actualizada correctamente.");
      
      setFullData(prev => ({ ...prev, ...padronForm }));
      setIsEditingPadron(false); 
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar la información.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const mensajeConfirmacion = 
      "⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTE EXPEDIENTE?\n\n" +
      "1. Se borrará permanentemente la información complementaria (Padrón, Gestión, Dictamen) y el registro base de este sistema.\n\n" +
      "2. NOTA: Si el registro original permanece en la fuente de datos (Excel/Forms), podría volver a cargarse automáticamente en el futuro, pero PERDERÁS todos los avances y detalles capturados aquí.\n\n" +
      "💡 RECOMENDACIÓN:\n" +
      "• Usa esta función solo para eliminar duplicados o errores de sistema.\n" +
      "• Si solo quieres corregir datos, hazlo desde la pestaña de 'Edición' en este mismo modal.\n\n" +
      "¿Deseas proceder con la eliminación?";

    if (!window.confirm(mensajeConfirmacion)) {
        return;
    }

    try {
        setIsDeleting(true);
        // Llamada al servicio que borra tanto 'atendidos' como 'expedientes_detalle'
        await AtendidosService.deleteAtendido(item.id);
        
        alert("🗑️ Expediente y sus detalles eliminados correctamente.");
        onClose(); // Cerramos el modal
        // Aquí la tabla principal debería recargarse (dependiendo de cómo manejes el estado padre)
    } catch (error) {
        console.error("Error eliminando:", error);
        alert("❌ Error al eliminar el expediente. Intente nuevamente.");
    } finally {
        setIsDeleting(false);
    }
  };

  const displayData = fullData ? { ...item, ...fullData } : item;
  const isDictamen = displayData?.tipo === 'Dictamen' || 
                     displayData?.tipo === 'DICTAMEN' || 
                     padronForm?.actividad_apoyo === 'Dictamen';

  const RenderField = ({ label, value, icon: Icon, isBool }) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 h-full">
        <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 block flex items-center gap-1">
            {Icon && <Icon size={10} />} {label}
        </span>
        {isBool ? (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                {value ? 'SÍ' : 'NO'}
            </span>
        ) : (
            value ? (
                <p className="text-sm font-bold text-slate-700 break-words">{value}</p>
            ) : (
                <p className="text-xs text-slate-400 italic">No registrado</p>
            )
        )}
    </div>
  );

  const getAllTags = () => {
    return []; 
  };
  const activeTags = getAllTags();

  const handleCopyForPlatform = async () => {
    try {
      document.body.style.cursor = 'wait';
      const basicData = await AtendidosService.getById(item.id);
      const dataToCopy = basicData.data || basicData;
      await navigator.clipboard.writeText(JSON.stringify(dataToCopy));
      
      alert("📋 Datos básicos copiados al portapapeles.");

    } catch (err) {
      console.error("Error al obtener datos básicos:", err);
      alert("❌ Error al conectar con el servidor para obtener datos básicos.");
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* --- ENCABEZADO --- */}
        <div className="bg-slate-900 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
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

             {/* --- SECCIÓN DERECHA: ESTATUS SIREMED Y CERRAR --- */}
             <div className="flex items-center gap-3">
                {/* SELECTOR DE ESTATUS */}
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                       {updatingStatus && <Loader2 size={10} className="animate-spin" />} Estatus SIREMED
                    </span>
                    <div className="relative group">
                        <select 
                            value={statusSiremed} 
                            onChange={handleStatusChange}
                            disabled={updatingStatus}
                            className={`
                                appearance-none cursor-pointer
                                pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border 
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                transition-all shadow-lg
                                ${statusSiremed === 'PENDIENTE' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : ''}
                                ${statusSiremed === 'COMPLETADO' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : ''}
                                ${!['PENDIENTE', 'COMPLETADO'].includes(statusSiremed) ? 'bg-slate-800 border-slate-600 text-slate-300' : ''}
                            `}
                        >
                            {ESTATUS_SIREMED_OPCIONES.map(st => (
                                <option key={st} value={st} className="bg-slate-900 text-slate-200 py-1">
                                    {st}
                                </option>
                            ))}
                        </select>
                        {/* Flecha personalizada */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70">
                             <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0L5 6L10 0H0Z"/></svg>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
             </div>
          </div>

          <div className="flex gap-4 mt-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'general' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><Layout size={16}/> Vista General</span>
              {activeTab === 'general' && <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-t-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('padron')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'padron' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><FileEdit size={16}/> Padrón y Clasificación</span>
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

          {/* =================================================================================
                PESTAÑA 1: VISTA GENERAL (COMPLETA)
            ================================================================================= */}
            {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* 1. TARJETA DEL CIUDADANO (Enriquecida) */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <User size={120} />
                    </div>
                    
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                        <User size={14} /> Información del Solicitante
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="md:col-span-1 space-y-2">
                            <div>
                                <span className="text-[10px] uppercase text-slate-400 font-bold">Nombre Completo</span>
                                <p className="text-xl font-black text-slate-900 leading-tight">
                                    {formatName(`${displayData.nombre} ${displayData.apellido_paterno} ${displayData.apellido_materno || ''}`)}
                                </p>
                            </div>
                            
                            {/* BADGES PRINCIPALES */}
                            <div className="flex flex-wrap gap-2">
                                {/* Edad (Maneja numero o string "23 años") */}
                                {(displayData.edad_o_nacimiento || displayData.edad) && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                        {displayData.edad_o_nacimiento ? displayData.edad_o_nacimiento.toString().replace(/\D/g,'') + ' Años' : displayData.edad + ' Años'}
                                    </span>
                                )}
                                {displayData.sexo && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                        {displayData.sexo}
                                    </span>
                                )}
                                {displayData.nacionalidad && (
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                                        <Globe size={10}/> {displayData.nacionalidad}
                                    </span>
                                )}
                            </div>
                            
                            {/* Grupo Vulnerable */}
                            {displayData.grupo_vulnerable && displayData.grupo_vulnerable !== "No me identifico con ningún grupo" && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-100">
                                    <AlertCircle size={10} />
                                    {displayData.grupo_vulnerable}
                                </div>
                            )}

                            <div className="pt-2">
                                <span className="text-[10px] uppercase text-indigo-400 font-bold block">CURP</span>
                                <p className="text-sm font-mono font-bold text-indigo-900 tracking-wide bg-indigo-50/50 px-2 py-1 rounded border border-indigo-100 w-fit">
                                    {displayData.curp || 'NO REGISTRADA'}
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-l border-slate-100 pl-0 md:pl-6">
                            <RenderField label="Teléfono" value={displayData.telefono} icon={Phone} />
                            <RenderField label="Correo Electrónico" value={displayData.correo} icon={Mail} />
                            
                            <div className="sm:col-span-2">
                                <RenderField 
                                    label="Domicilio Ciudadano" 
                                    value={displayData.domicilio_ciudadano || displayData.domicilio} 
                                    icon={MapPin} 
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. DATOS DEL CASO Y CLASIFICACIÓN (Grid denso) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Columna Izquierda: Datos Administrativos */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText size={14} /> Datos Administrativos
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <RenderField label="Fecha Recepción" value={formatDate(displayData.fecha_recepcion)} icon={Calendar} />
                            <RenderField label="Fecha Inicio Proceso" value={formatDate(displayData.fecha_inicio_proceso)} icon={Clock} />
                            
                            <div className="col-span-2">
                                <RenderField label="Forma de Recepción" value={displayData.forma_recepcion} icon={Tag} />
                            </div>
                            
                            <div className="col-span-2">
                                <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-1">
                                    <CheckCircle size={10} /> Seguimiento / Bitácora
                                </span>
                                <div className={`p-2 rounded-lg text-xs font-bold border ${displayData.seguimiento_bitacora ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    {displayData.seguimiento_bitacora || 'Sin seguimiento registrado'}
                                </div>
                            </div>
                            
                            {displayData.autoridad_responsable && displayData.autoridad_responsable !== "Otra" && (
                                <div className="col-span-2">
                                    <RenderField label="Autoridad Responsable" value={displayData.autoridad_responsable} icon={Building2} />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Columna Derecha: Datos Médicos */}
                    <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Stethoscope size={14} /> Contexto Médico
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                                    <Building2 size={10}/> Unidad Médica / Institución
                                </span>
                                <p className="text-sm font-bold text-slate-800 mt-1">
                                    {displayData.unidad_medica || displayData.prestador_nombre || 'No especificada'}
                                </p>
                            </div>

                            {displayData.medico_nombre && (
                                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                    <span className="text-[10px] uppercase text-indigo-400 font-bold flex items-center gap-1">
                                        <User size={10}/> Nombre del Médico
                                    </span>
                                    <p className="text-sm font-bold text-indigo-900 mt-1">
                                        {displayData.medico_nombre}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <RenderField label="Especialidad Médica" value={displayData.especialidad_medica || displayData.especialidad} />
                                <RenderField label="Motivo Principal" value={displayData.motivo_principal || displayData.motivo_inconformidad} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* 3. DESCRIPCIÓN, PRETENSIONES Y CATEGORÍAS */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    
                    {/* Hechos */}
                    <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2">
                            <MessageSquare size={10} /> Descripción de Hechos / Motivo Detallado
                        </span>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                            {displayData.descripcion_hechos || displayData.motivo_queja_detalle || 'Sin narrativa capturada.'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        {/* Pretensiones */}
                        <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2">
                                <Target size={10} /> Pretensiones del Usuario
                            </span>
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-900 text-xs font-medium">
                                {displayData.pretensiones || 'No especificadas'}
                            </div>
                        </div>

                        {/* Categorías (Arrays) */}
                        <div>
                            <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-2">
                                <List size={10} /> Categorías y Clasificación
                            </span>
                            <div className="space-y-2">
                                {/* Helper para renderizar arrays o strings */}
                                {[
                                    { label: 'Categorías Asesoría', val: displayData.categorias_asesoria },
                                    { label: 'Categorías Queja', val: displayData.categorias_queja },
                                    { label: 'Tipo Queja', val: displayData.categorias_tipo_queja },
                                    { label: 'Submotivo', val: displayData.submotivo }
                                ].map((cat, idx) => {
                                    if (!cat.val || (Array.isArray(cat.val) && cat.val.length === 0)) return null;
                                    return (
                                        <div key={idx} className="flex gap-2 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 mr-2">{cat.label}:</span>
                                                <span className="text-xs text-slate-700">
                                                    {Array.isArray(cat.val) ? cat.val.join(', ') : cat.val}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Fallback si no hay categorías */}
                                {(!displayData.categorias_asesoria && !displayData.categorias_queja && !displayData.submotivo) && (
                                    <p className="text-xs text-slate-400 italic">Sin clasificación adicional.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. SECCIÓN ESPECÍFICA SI ES DICTAMEN (Mantenemos la lógica anterior por si acaso) */}
                {isDictamen && (
                    <section className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 shadow-sm">
                        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Scale size={14} /> Datos Dictamen
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <RenderField label="Expediente" value={displayData.expediente_dga || displayData.expediente_investigacion} />
                            <RenderField label="Fecha Oficio" value={displayData.fecha_oficio} />
                            <RenderField label="Autoridad" value={displayData.autoridad_solicitante} />
                            <RenderField label="Litis" value={displayData.motivo_litis} />
                        </div>
                    </section>
                )}
            </div>
            )}

          {/* =================================================================================
              PESTAÑA 2: PADRÓN Y CLASIFICACIÓN (EDITABLE)
             ================================================================================= */}
          {activeTab === 'padron' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
              
              {!isEditingPadron ? (
                // --- VISTA LECTURA ---
                <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0"><FileText size={20} /></div>
                            <div>
                                <h4 className="font-bold text-emerald-900 text-sm">Detalles y Clasificación</h4>
                                <p className="text-xs text-emerald-700">Información técnica, administrativa y socioeconómica.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsEditingPadron(true)} className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                            <Pencil size={12} /> Editar Datos
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* SECCIÓN 1: CLASIFICACIÓN MÉDICA */}
                        <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2">
                             <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Stethoscope size={14}/> Clasificación del Asunto
                             </h5>
                        </div>
                        <div className="md:col-span-2">
                            <RenderField label="Motivo Inconformidad" value={displayData.motivo_inconformidad} icon={AlertCircle} />
                        </div>
                        <div className="md:col-span-2">
                            <RenderField label="Submotivo" value={displayData.submotivo} icon={AlertTriangle}/>
                        </div>
                        <div className="md:col-span-2">
                             <RenderField label="Especialidad" value={displayData.especialidad} icon={Stethoscope} />
                        </div>
                        <RenderField label="Tipo Asunto" value={displayData.tipo_asunto} icon={Tag} />
                        <div className="md:col-span-4">
                             <RenderField label="Prestador de Servicio" value={displayData.prestador_nombre} icon={Building2} />
                        </div>

                        {/* SECCIÓN 2: GESTIÓN ADMINISTRATIVA */}
                        <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={14}/> Datos de Gestión
                             </h5>
                        </div>
                        <RenderField label="Foráneo" value={displayData.foraneo} isBool={true} icon={Map} />
                        <RenderField label="Vía Telefónica" value={displayData.via_telefonica} isBool={true} icon={PhoneCall} />
                        <div className="md:col-span-2">
                            <RenderField label="Representante" value={displayData.representante} icon={UserCheck} />
                        </div>
                        <div className="md:col-span-4">
                             <RenderField label="Observaciones Servicio" value={displayData.observaciones_servicio} icon={MessageSquare} />
                        </div>

                        {/* SECCIÓN 3: PADRÓN SOCIOECONÓMICO */}
                        <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                             <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14}/> Datos Socioeconómicos
                             </h5>
                        </div>
                        <RenderField label="Estado Civil" value={displayData.estado_civil} />
                        <RenderField label="Ocupación" value={displayData.cargo_ocupacion} />
                        <RenderField label="Tipo Beneficiario" value={displayData.tipo_beneficiario} />
                        <RenderField label="Parentesco" value={displayData.parentesco} />
                        <RenderField label="Actividad / Apoyo" value={displayData.actividad_apoyo} />
                        <RenderField label="Monto Apoyo" value={displayData.monto_apoyo ? `$${displayData.monto_apoyo}` : null} />
                        <div className="md:col-span-2 lg:col-span-4 pb-2 border-b border-slate-100 mb-2 mt-4">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14}/> Ubicación
                            </h5>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                            <RenderField label="Domicilio Completo" value={displayData.domicilio} icon={MapPin} />
                        </div>
                        <RenderField label="Municipio" value={displayData.municipio} icon={MapPin} />
                        <RenderField label="Localidad" value={displayData.localidad} />
                    </div>
                </div>

              ) : (
                // --- VISTA EDICIÓN (FORMULARIO) ---
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0"><FileEdit size={20} /></div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-sm">Modo Edición</h4>
                            <p className="text-xs text-indigo-700">Complete los campos. Los cambios se guardarán en la base de datos de detalles.</p>
                        </div>
                    </div>

                    <form className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-2 border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. CLASIFICACIÓN TÉCNICA */}
                        <div className="md:col-span-2 pb-2 border-b border-indigo-100">
                             <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Clasificación Médica / Técnica</h5>
                        </div>

                        {/* Prestador Editable */}
                        <div className="md:col-span-2 space-y-1">
                             <label className="text-xs font-bold text-slate-700 ml-1">Prestador de Servicio / Institución</label>
                             <input type="text" name="prestador_nombre" value={padronForm.prestador_nombre} onChange={handleInputChange} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900" placeholder="Nombre de la unidad o institución..." />
                             <p className="text-[10px] text-slate-400 ml-1">Si se deja vacío, se usará el valor original del expediente.</p>
                        </div>

                        {/* MOTIVO (Headers del Objeto) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Motivo Inconformidad</label>
                            <select name="motivo_inconformidad" value={padronForm.motivo_inconformidad} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                                <option value="">Seleccione Motivo...</option>
                                {Object.keys(MOTIVOS_CATALOGO).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* SUBMOTIVO (Dependiente del Motivo) CON LÓGICA 'OTRO' */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Submotivo</label>
                            <select 
                                name="submotivo" 
                                value={isOtherSubmotivo ? 'OTRO (ESPECIFIQUE)' : padronForm.submotivo} 
                                onChange={handleSubmotivoSelectorChange} 
                                disabled={!padronForm.motivo_inconformidad}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                            >
                                <option value="">Seleccione Submotivo...</option>
                                {padronForm.motivo_inconformidad && MOTIVOS_CATALOGO[padronForm.motivo_inconformidad]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>

                        {/* Input de Submotivo CUSTOM */}
                        {isOtherSubmotivo && (
                            <div className="md:col-span-2 space-y-1 animate-in fade-in slide-in-from-left-2">
                                <label className="text-xs font-bold text-indigo-600 ml-1">Especifique Submotivo</label>
                                <input 
                                  type="text" 
                                  name="submotivo" 
                                  value={padronForm.submotivo} 
                                  onChange={handleInputChange} 
                                  className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                  placeholder="Escriba el detalle del submotivo..." 
                                  autoFocus 
                                />
                            </div>
                        )}

                        {/* ESPECIALIDAD (Select + Input Custom) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Especialidad</label>
                            <select 
                                value={isOtherSpecialty ? 'OTROS' : padronForm.especialidad} 
                                onChange={handleSpecialtyChange} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            >
                                <option value="">Seleccione...</option>
                                {ESPECIALIDADES_LISTA.map(esp => (
                                    <option key={esp} value={esp}>{esp}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Input de Especialidad CUSTOM */}
                        {isOtherSpecialty && (
                             <div className="space-y-1 animate-in fade-in slide-in-from-left-2">
                                <label className="text-xs font-bold text-indigo-600 ml-1">Especifique Especialidad</label>
                                <input type="text" name="especialidad" value={padronForm.especialidad} onChange={handleInputChange} className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Escriba la especialidad..." autoFocus />
                             </div>
                        )}
                        {!isOtherSpecialty && !isOtherSubmotivo && <div className="hidden md:block"></div>}


                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Tipo de Asunto</label>
                            <select name="tipo_asunto" value={padronForm.tipo_asunto} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                                <option value="">Seleccione...</option>
                                <option value="Servicio">Servicio</option>
                                <option value="Especie">Especie</option>
                                <option value="Indirecto">Indirecto</option>
                                <option value="Mixto">Mixto</option>
                                <option value="Monetario">Monetario</option>
                                <option value="Producto Subsidiado">Producto Subsidiado</option>
                            </select>
                        </div>

                        {/* 2. DATOS GESTIÓN */}
                        <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                             <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Datos Administrativos</h5>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors w-full">
                                <input type="checkbox" name="foraneo" checked={padronForm.foraneo} onChange={handleInputChange} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                                <span className="text-xs font-bold text-slate-700">¿Es Foráneo?</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors w-full">
                                <input type="checkbox" name="via_telefonica" checked={padronForm.via_telefonica} onChange={handleInputChange} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"/>
                                <span className="text-xs font-bold text-slate-700">¿Vía Telefónica?</span>
                            </label>
                        </div>

                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-700 ml-1">Representante</label>
                             <input type="text" name="representante" value={padronForm.representante} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                             <label className="text-xs font-bold text-slate-700 ml-1">Observaciones del Servicio</label>
                             <textarea name="observaciones_servicio" value={padronForm.observaciones_servicio} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
                        </div>

                        {/* 3. PADRÓN SOCIOECONÓMICO */}
                        <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                             <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Datos Socioeconómicos</h5>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Ocupación</label>
                            <input type="text" name="cargo_ocupacion" value={padronForm.cargo_ocupacion} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Ocupación del solicitante" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Estado Civil</label>
                            <select name="estado_civil" value={padronForm.estado_civil} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                                <option value="">Seleccione...</option>
                                <option value="Soltero(a)">Soltero/a</option>
                                <option value="Casado(a)">Casado/a</option>
                                <option value="Unión Libre">Unión Libre</option>
                                <option value="Viudo(a)">Viudo/a</option>
                                <option value="Divorciado(a)">Divorciado/a</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Tipo Beneficiario</label>
                            <input type="text" name="tipo_beneficiario" value={padronForm.tipo_beneficiario} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Parentesco</label>
                            <input type="text" name="parentesco" value={padronForm.parentesco} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Actividad / Apoyo</label>
                            <select name="actividad_apoyo" value={padronForm.actividad_apoyo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                                <option value="">Seleccione...</option>
                                <option value="Orientación">Orientación</option>
                                <option value="Gestión">Gestión</option>
                                <option value="Asesoría">Asesoría</option>
                                <option value="Queja">Queja</option>
                                <option value="Dictamen">Dictamen</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Monto ($)</label>
                            <input type="number" name="monto_apoyo" value={padronForm.monto_apoyo} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>

                        <div className="md:col-span-2 pb-2 border-b border-indigo-100 mt-4">
                             <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Ubicación</h5>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Calle y Número / Domicilio</label>
                            <input 
                                type="text" 
                                name="domicilio" 
                                value={padronForm.domicilio} 
                                onChange={handleInputChange} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                                placeholder="Ingrese calle, número y colonia..." 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Municipio</label>
                            <input type="text" name="municipio" value={padronForm.municipio} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Localidad</label>
                            <input type="text" name="localidad" value={padronForm.localidad} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                        </div>

                    </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          {/* ZONA IZQUIERDA: UTILIDADES Y PELIGRO */}
          <div className="flex items-center gap-3">
             {/* Botón Eliminar */}
             <button 
                onClick={handleDelete} 
                disabled={isDeleting || saving}
                className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
             >
                {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                <span className="hidden sm:inline">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
             </button>

             {/* Botón Copiar (El que ya tenías) */}
             <button onClick={handleCopyForPlatform} className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl font-bold text-xs transition-colors border border-indigo-100 shadow-sm">
                <Copy size={16} /> <span className="hidden sm:inline">Copiar</span>
             </button>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === 'padron' && isEditingPadron ? (
                <>
                    <button onClick={() => setIsEditingPadron(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                        <Ban size={16}/> Cancelar
                    </button>
                    <button onClick={handleSavePadron} disabled={saving} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </>
            ) : (
                <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                    Cerrar
                </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};