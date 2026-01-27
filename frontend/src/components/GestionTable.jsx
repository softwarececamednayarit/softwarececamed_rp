import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit2, Loader2, AlertCircle, 
  Briefcase, Eye, MessageSquare, Building2 
} from 'lucide-react';
import { AtendidosService } from '../services/atendidosService';
import { DetailModal } from './DetailModal';

// --- CATÁLOGOS ---
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
  "TRATAMIENTO MÉDICO": ["ACCIDENTES E INCIDENTES", "COMPLICACIONES SECUNDARIAS", "DESINFORMACIÓN SOBRE EL TRATAMIENTO", "FALTA DE CONSENTIMIENTO", "RETRASO DEL TRATAMIENTO", "SECUELAS: EXCESO TERAPEUTICO", "TRATAMIENTO INADECUADO O INNECESARIO", "TRATAMIENTO INSATISFACTORIO", "OTRO (ESPECIFIQUE)"],
  "TRATAMIENTO QUIRÚRGICO": ["ACCIDENTES E INCIDENTES", "ALTA PREMATURA DE LOS CIUDADANOS POSTOPERATORIOS", "CIRUGIA INNECESARIA", "COMPLICACIONES QUIRÚRGICAS DEL POST OPERATORIO", "COMPLICACIONES QUIRÚRGICAS DEL TRANS OPERATORIO", "ERROR QUIRÚRGICO", "FALTA DE CARETA DE CONOCIMIENTO INFORMATIVO", "FALTA DE SEGUIMIENTO O SEGUIMIENTO INADECUADO EN EL POSTOPERATORIO", "FALTA DE VALORACION PRE QUIRÚRGICA", "RETRASO DEL TRATAMIENTO QUIRÚRGICO", "SECUELAS", "TECNICA QUIRÚRGICA INADECUADA", "TRATAMIENTO QUIRÚRGICO NO SATISFACTORIO", "OTRO (ESPECIFIQUE)"],
  "DEFICIENCIAS ADMINISTRATIVAS": ["CAMBIO DE MÉDICO TRATANTE O DE UNIDAD MÉDICA", "DEMORA PROLONGADA Y/O DIFERIMENTO PARA OBTENER EL SERVICIO", "FALTA DE EQUIPO MEDICO", "FALTA DE INSUMOS O MEDICAMENTOS", "FALTA DE PERSONAL", "NEGACIÓN DE LA ATENCIÓN", "SISTEMA DE REFERENCIA Y CONTRAREFERENCIA", "TRATO INADECUADO POR PARTE DEL PERSONAL ADMINISTRATIVO", "OTRO (ESPECIFIQUE)"],
  "AUXILIARES DE DIAGNOSTICO Y TRATAMIENTO": ["COMPLICACIONES SECUNDARIAS DE LOS PROCEDIMIENTOS DIAGNÓSTICOS", "ESTUDIOS INNECESARIOS", "FALSOS POSITIVOS O NEGATIVOS", "FALTA DE INFORMACIÓN Y CONOCIMIENTO", "RETRASO DEL PROCEDIMIENTO DIAGNÓSTICO", "RETRASO O FALTA DE NOTIFICACIÓN DE RESULTADOS", "SECUELAS", "OTRO (ESPECIFIQUE)"],
  "DIAGNÓSTICO": ["DESINFORMACIÓN SOBRE EL DIAGNÓSTICO", "DIAGNÓSTICO ERRÓNEO", "OMISION DEL DIAGNOSTICO", "RETRASO DEL DIAGNÓSTICO", "OTRO (ESPECIFIQUE)"],
  "RELACIÓN MÉDICO PACIENTE": ["FALLAS EN LA COMUNICACION", "TRATAMIENTO INADECUADO", "FALSAS EXPECTATIVAS", "OTRO (ESPECIFIQUE)"]
};

const ESTADOS_CIVILES = ["Soltero(a)", "Casado(a)", "Unión libre", "Viudo(a)", "Divorciado(a)", "Separado(a)", "No Aplica"];
const TIPOS_ASUNTO = ["Gestion", "Orientacion", "Asesoria", "Queja", "Dictamen"];

export const GestionTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Estados para controlar los inputs manuales en la fila que se está editando
  const [isOtherSpecialty, setIsOtherSpecialty] = useState(false);
  const [isOtherSubmotivo, setIsOtherSubmotivo] = useState(false);

  // --- CARGA ---
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await AtendidosService.getPadronReport(); 
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error cargando tabla gestión", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE EDICIÓN ---
  const startEditing = (row) => {
    setEditingId(row.id);
    
    // 1. Detectar si la especialidad actual es "Custom"
    const espViene = row.especialidad || '';
    const esEspecialidadEstandar = ESPECIALIDADES_LISTA.includes(espViene);
    setIsOtherSpecialty(!!espViene && !esEspecialidadEstandar);

    // 2. Detectar si el submotivo actual es "Custom"
    const mot = row.motivo_inconformidad || '';
    const sub = row.submotivo || '';
    const catalogoSub = MOTIVOS_CATALOGO[mot] || [];
    const esSubmotivoEstandar = catalogoSub.includes(sub);
    setIsOtherSubmotivo(!!sub && !esSubmotivoEstandar);

    setEditForm({
      // Checkboxes
      foraneo: row.foraneo === true || row.foraneo === "true",
      via_telefonica: row.via_telefonica === true || row.via_telefonica === "true",
      
      // Textos
      domicilio: row.domicilio || '',
      estado_civil: row.estado_civil || 'Soltero(a)',
      ocupacion: row.cargo_ocupacion || row.ocupacion || '', 
      representante: row.representante || '',
      prestador_nombre: row.prestador_nombre || '',
      
      // Clasificación
      especialidad: row.especialidad || '',
      motivo_inconformidad: row.motivo_inconformidad || '',
      submotivo: row.submotivo || '',
      tipo_asunto: row.tipo_asunto || 'Orientacion',
      
      // Observaciones (Narrativa NO se edita)
      observaciones_servicio: row.observaciones_servicio || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setIsOtherSpecialty(false);
    setIsOtherSubmotivo(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setEditForm(prev => {
      const newState = { ...prev, [name]: val };
      
      // Resetear submotivo y bandera de "Otro" si cambia el motivo principal
      if (name === 'motivo_inconformidad') {
        newState.submotivo = '';
        setIsOtherSubmotivo(false); 
      }
      return newState;
    });
  };

  // Handler especial para el Select de Especialidad
  const handleSpecialtySelect = (e) => {
    const val = e.target.value;
    if (val === 'OTROS') {
      setIsOtherSpecialty(true);
      setEditForm(prev => ({ ...prev, especialidad: '' })); 
    } else {
      setIsOtherSpecialty(false);
      setEditForm(prev => ({ ...prev, especialidad: val }));
    }
  };

  // Handler especial para el Select de Submotivo
  const handleSubmotivoSelect = (e) => {
    const val = e.target.value;
    if (val === 'OTRO (ESPECIFIQUE)') {
      setIsOtherSubmotivo(true);
      setEditForm(prev => ({ ...prev, submotivo: '' }));
    } else {
      setIsOtherSubmotivo(false);
      setEditForm(prev => ({ ...prev, submotivo: val }));
    }
  };

  const saveRow = async (id) => {
    try {
      setSaving(true);
      await AtendidosService.updatePadron(id, editForm);
      setData(prevData => prevData.map(item => item.id === id ? { ...item, ...editForm } : item));
      setEditingId(null);
      setIsOtherSpecialty(false);
      setIsOtherSubmotivo(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar gestión");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (item) => setSelectedItem(item);
  const handleCloseModal = () => {
    setSelectedItem(null);
    loadData(); 
  };

  // --- FILTRO BLINDADO (SOLUCIÓN PANTALLA BLANCA) ---
  const filteredData = data.filter(item => {
    // Usamos ( || '') para asegurar que sea string antes de llamar a toLowerCase
    const nombre = (item.nombre || '').toLowerCase();
    const apellido = (item.apellido_paterno || '').toLowerCase();
    const termino = searchTerm.toLowerCase();
    return nombre.includes(termino) || apellido.includes(termino);
  });

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Briefcase className="text-indigo-600" /> Tabla de Gestión y Quejas
            </h2>
            <p className="text-xs text-slate-500 mt-1">Clasificación técnica y seguimiento de asuntos</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar expediente..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* TABLA SCROLLABLE */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                <Briefcase size={40} className="mb-2 opacity-50"/>
                <p>No se encontraron registros</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{ minWidth: '1800px' }}>
              <thead className="text-slate-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-20">
                <tr className="bg-slate-100 shadow-sm">
                  <th className="p-4 w-56 bg-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Datos Base</th>
                  <th className="p-4 w-32 bg-slate-100">Contacto</th>
                  <th className="p-4 w-48 bg-slate-100">Socioeconómico</th>
                  <th className="p-4 w-48 bg-slate-100">Asunto / Prestador</th>
                  <th className="p-4 w-64 bg-slate-100">Clasificación (Motivo)</th>
                  <th className="p-4 w-64 bg-slate-100">Narrativa (No Editable)</th>
                  <th className="p-4 w-48 bg-slate-100">Observaciones</th>
                  <th className="p-4 w-24 text-center bg-slate-100 sticky right-0 z-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isEditing = editingId === row.id;
                  const isMissing = !row.motivo_inconformidad || !row.tipo_asunto || !row.especialidad;

                  return (
                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-indigo-50/40' : ''}`}>
                      
                      {/* 1. COLUMNA FIJA: DATOS BASE */}
                      <td className="p-4 sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top">
                        <div className="font-bold text-slate-800 text-sm mb-1">
                          {row.nombre} {row.apellido_paterno}
                        </div>
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500">
                           <div className="flex gap-2">
                              <span className="font-mono bg-slate-100 px-1 rounded">{row.curp || 'S/C'}</span>
                              <span>{row.sexo}</span>
                           </div>
                           <div className="flex gap-1 items-center mt-1">
                              <span className="font-bold">{row.telefono}</span>
                              <span className="text-slate-300">|</span>
                              <span>{row.edad ? `${row.edad} años` : ''}</span>
                           </div>
                        </div>
                        {isMissing && !isEditing && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-600 mt-2 font-bold bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                            <AlertCircle size={10} /> Faltan campos
                          </div>
                        )}
                      </td>

                      {isEditing ? (
                        /* --- MODO EDICIÓN --- */
                        <>
                          <td className="p-2 align-top space-y-2 bg-white">
                             <div className="flex gap-2">
                               <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                 <input type="checkbox" name="foraneo" checked={editForm.foraneo} onChange={handleChange} className="rounded text-indigo-600"/> Foráneo
                               </label>
                               <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                 <input type="checkbox" name="via_telefonica" checked={editForm.via_telefonica} onChange={handleChange} className="rounded text-indigo-600"/> Tel.
                               </label>
                             </div>
                             <input name="representante" value={editForm.representante} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Representante" />
                          </td>

                          <td className="p-2 align-top space-y-2 bg-white">
                             <textarea name="domicilio" value={editForm.domicilio} onChange={handleChange} rows="2" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Domicilio..." />
                             <div className="grid grid-cols-2 gap-1">
                                <select name="estado_civil" value={editForm.estado_civil} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]">
                                   {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <input name="ocupacion" value={editForm.ocupacion} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]" placeholder="Ocupación" />
                             </div>
                          </td>

                          {/* 4. Asunto + ESPECIALIDAD CON LOGICA OTROS */}
                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="tipo_asunto" value={editForm.tipo_asunto} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs font-bold">
                               {TIPOS_ASUNTO.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                             <input name="prestador_nombre" value={editForm.prestador_nombre} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Prestador / Unidad" />
                             
                             {/* Select Especialidad */}
                             <select 
                                value={isOtherSpecialty ? 'OTROS' : editForm.especialidad} 
                                onChange={handleSpecialtySelect} 
                                className="w-full p-1.5 border border-indigo-200 rounded text-xs"
                             >
                               <option value="">Especialidad...</option>
                               {ESPECIALIDADES_LISTA.map(e => <option key={e} value={e}>{e}</option>)}
                             </select>
                             
                             {/* Input Especialidad Custom */}
                             {isOtherSpecialty && (
                                <input 
                                    name="especialidad" 
                                    value={editForm.especialidad} 
                                    onChange={handleChange} 
                                    className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" 
                                    placeholder="Especifique especialidad..."
                                    autoFocus
                                />
                             )}
                          </td>

                          {/* 5. Clasificación + SUBMOTIVO CON LOGICA OTROS */}
                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="motivo_inconformidad" value={editForm.motivo_inconformidad} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs">
                               <option value="">Motivo...</option>
                               {Object.keys(MOTIVOS_CATALOGO).map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             
                             {/* Select Submotivo */}
                             <select 
                                value={isOtherSubmotivo ? 'OTRO (ESPECIFIQUE)' : editForm.submotivo} 
                                onChange={handleSubmotivoSelect} 
                                disabled={!editForm.motivo_inconformidad} 
                                className="w-full p-1.5 border border-indigo-200 rounded text-xs disabled:bg-slate-100"
                             >
                               <option value="">Submotivo...</option>
                               {editForm.motivo_inconformidad && MOTIVOS_CATALOGO[editForm.motivo_inconformidad]?.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>

                             {/* Input Submotivo Custom */}
                             {isOtherSubmotivo && (
                                <input 
                                    name="submotivo" 
                                    value={editForm.submotivo} 
                                    onChange={handleChange} 
                                    className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" 
                                    placeholder="Especifique submotivo..."
                                    autoFocus
                                />
                             )}
                          </td>

                          {/* 6. Descripción (SOLO LECTURA EN MODO EDICIÓN TAMBIÉN) */}
                          <td className="p-2 align-top bg-slate-50/50">
                             <div className="text-[10px] text-slate-500 max-h-32 overflow-y-auto leading-relaxed border border-dashed border-slate-200 p-1.5 rounded">
                                {editForm.descripcion_hechos || 'Sin descripción'}
                             </div>
                          </td>

                          {/* 7. Observaciones (Editable) */}
                          <td className="p-2 align-top bg-white">
                             <textarea name="observaciones_servicio" value={editForm.observaciones_servicio} onChange={handleChange} rows="5" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Observaciones..." />
                          </td>

                          <td className="p-2 text-center align-top sticky right-0 bg-white z-10">
                             <div className="flex flex-col gap-2 items-center mt-2">
                               <button onClick={() => saveRow(row.id)} disabled={saving} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-md">
                                 {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                               </button>
                               <button onClick={cancelEditing} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition">
                                 <X size={16} />
                               </button>
                             </div>
                          </td>
                        </>
                      ) : (
                        /* --- MODO LECTURA --- */
                        <>
                          <td className="p-4 align-top">
                             <div className="flex gap-2 mb-1">
                                {row.foraneo && <span className="bg-purple-100 text-purple-700 px-1.5 rounded text-[9px] font-bold">Foráneo</span>}
                                {row.via_telefonica && <span className="bg-blue-100 text-blue-700 px-1.5 rounded text-[9px] font-bold">Tel</span>}
                             </div>
                             {row.representante && <div className="text-[10px] text-slate-500">Rep: {row.representante}</div>}
                          </td>

                          <td className="p-4 align-top">
                             <div className="line-clamp-2 text-slate-600 mb-1" title={row.domicilio}>{row.domicilio || '-'}</div>
                             <div className="text-[10px] text-slate-400">{row.estado_civil} • {row.cargo_ocupacion}</div>
                          </td>

                          <td className="p-4 align-top">
                             <div className="font-bold text-slate-700 mb-1">{row.tipo_asunto}</div>
                             <div className="text-[10px] text-slate-500 mb-1 line-clamp-1" title={row.prestador_nombre}>
                                <Building2 size={10} className="inline mr-1"/>{row.prestador_nombre || 'N/A'}
                             </div>
                             <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] border border-slate-200">
                                {row.especialidad || 'Sin Esp.'}
                             </span>
                          </td>

                          <td className="p-4 align-top">
                             <div className="font-medium text-slate-700 mb-1 leading-tight">{row.motivo_inconformidad || '-'}</div>
                             <div className="text-[10px] text-slate-400 leading-tight">↳ {row.submotivo}</div>
                          </td>

                          <td className="p-4 align-top">
                             <div className="text-[10px] text-slate-500 line-clamp-4 leading-relaxed" title={row.descripcion_hechos}>
                                {row.descripcion_hechos || 'Sin descripción'}
                             </div>
                          </td>

                          <td className="p-4 align-top">
                             {row.observaciones_servicio ? (
                                <div className="text-[10px] text-indigo-600 bg-indigo-50 p-2 rounded line-clamp-4 border border-indigo-100">
                                   <MessageSquare size={10} className="inline mr-1"/>
                                   {row.observaciones_servicio}
                                </div>
                             ) : <span className="text-slate-300">-</span>}
                          </td>

                          <td className="p-4 text-center sticky right-0 bg-inherit z-10">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => handleViewDetails(row)} className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded transition border border-indigo-100" title="Ver Detalle Completo">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => startEditing(row)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition" title="Editar">
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right text-xs text-slate-400">Mostrando {filteredData.length} registros</div>
      </div>

      {selectedItem && <DetailModal item={selectedItem} onClose={handleCloseModal} initialTab="padron" />}
    </>
  );
};