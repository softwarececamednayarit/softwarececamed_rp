import React, { useState, useEffect } from 'react';
import { 
  X, Fingerprint, Loader2, Layout, FileEdit, Ban, Save, Trash2, Copy 
} from 'lucide-react';
import { getStatusColor } from '../utils/formatters';
import { AtendidosService } from '../services/atendidosService'; 
import { ESTATUS_SIREMED_OPCIONES, ESPECIALIDADES_LISTA, MOTIVOS_CATALOGO } from '../utils/catalogs';

// Subcomponentes importados
import { DetailGeneralTab } from './DetailGeneralTab';
import { DetailPadronTab } from './DetailPadronTab';

export const DetailModal = ({ item, onClose, initialTab = 'general' }) => {
  if (!item) return null;

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState(initialTab); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingPadron, setIsEditingPadron] = useState(false);
  const [fullData, setFullData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isOtherSpecialty, setIsOtherSpecialty] = useState(false);
  const [isOtherSubmotivo, setIsOtherSubmotivo] = useState(false);

  const [statusSiremed, setStatusSiremed] = useState('PENDIENTE');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [padronForm, setPadronForm] = useState({
    tipo_beneficiario: '', criterio_seleccion: '', tipo_apoyo: '', monto_apoyo: '',
    parentesco: '', estado_civil: '', cargo_ocupacion: '', actividad_apoyo: '',
    municipio: '', localidad: '', domicilio: '', diagnostico: '',
    foraneo: false, representante: '', via_telefonica: false, especialidad: '',
    motivo_inconformidad: '', submotivo: '', tipo_asunto: '', observaciones_servicio: '',
    servicio: '', no_asignado: '', prestador_nombre: '', expediente_dga: '',
    fecha_oficio: '', numero_oficio: '', autoridad_solicitante: '', nombre_solicitante: '',
    cargo_solicitante: '', expediente_investigacion: '', motivo_litis: '', sala_medica: '',
    modalidad_conclusion: '', submodalidad_conclusion: '', resultado_analisis: '',
    danos_salud: '', fecha_inicio_proceso: ''
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
          
          const espViene = data.especialidad || '';
          if (espViene && !ESPECIALIDADES_LISTA.includes(espViene)) setIsOtherSpecialty(true);

          const motivoActual = data.motivo_inconformidad;
          const subViene = data.submotivo || '';
          const catalogoSub = MOTIVOS_CATALOGO[motivoActual] || [];
          if (subViene && !catalogoSub.includes(subViene)) setIsOtherSubmotivo(true);

          setPadronForm({
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
            diagnostico: data.diagnostico || '',
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
      if (name === 'motivo_inconformidad') {
        newState.submotivo = ''; 
        setIsOtherSubmotivo(false); 
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

  const handleSubmotivoSelectorChange = (e) => {
    const val = e.target.value;
    if (val === 'OTRO (ESPECIFIQUE)') {
      setIsOtherSubmotivo(true);
      setPadronForm(prev => ({ ...prev, submotivo: '' }));
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
    const msg = "⚠️ ¿ESTÁS SEGURO DE ELIMINAR ESTE EXPEDIENTE?\n\n1. Se borrará permanentemente la información.\n2. Si el registro original sigue en Excel/Forms, podría volver a cargarse.\n\n¿Deseas proceder?";
    if (!window.confirm(msg)) return;

    try {
        setIsDeleting(true);
        await AtendidosService.deleteAtendido(item.id);
        alert("🗑️ Expediente eliminado correctamente.");
        onClose(); 
    } catch (error) {
        console.error("Error eliminando:", error);
        alert("❌ Error al eliminar el expediente.");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleCopyForPlatform = async () => {
    try {
      document.body.style.cursor = 'wait';
      const basicData = await AtendidosService.getById(item.id);
      await navigator.clipboard.writeText(JSON.stringify(basicData.data || basicData));
      alert("📋 Datos básicos copiados.");
    } catch (err) {
      alert("❌ Error al copiar datos.");
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const displayData = fullData ? { ...item, ...fullData } : item;
  const isDictamen = displayData?.tipo === 'Dictamen' || displayData?.tipo === 'DICTAMEN' || padronForm?.actividad_apoyo === 'Dictamen';

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

             <div className="flex items-center gap-3">
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
                                pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg
                                ${statusSiremed === 'PENDIENTE' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : ''}
                                ${statusSiremed === 'COMPLETADO' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : ''}
                                ${!['PENDIENTE', 'COMPLETADO'].includes(statusSiremed) ? 'bg-slate-800 border-slate-600 text-slate-300' : ''}
                            `}
                        >
                            {ESTATUS_SIREMED_OPCIONES.map(st => <option key={st} value={st} className="bg-slate-900 text-slate-200 py-1">{st}</option>)}
                        </select>
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

        {/* --- CUERPO --- */}
        <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          )}

          {activeTab === 'general' && (
             <DetailGeneralTab displayData={displayData} isDictamen={isDictamen} />
          )}

          {activeTab === 'padron' && (
             <DetailPadronTab 
                isEditingPadron={isEditingPadron}
                setIsEditingPadron={setIsEditingPadron}
                padronForm={padronForm}
                displayData={displayData}
                handleInputChange={handleInputChange}
                handleSpecialtyChange={handleSpecialtyChange}
                handleSubmotivoSelectorChange={handleSubmotivoSelectorChange}
                isOtherSpecialty={isOtherSpecialty}
                isOtherSubmotivo={isOtherSubmotivo}
             />
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={handleDelete} disabled={isDeleting || saving} className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50">
                {isDeleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                <span className="hidden sm:inline">{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
             </button>
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
                        {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Guardar Cambios
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