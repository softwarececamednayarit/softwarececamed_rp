import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit2, Loader2, AlertCircle, 
  Briefcase, Eye, MessageSquare, Building2 
} from 'lucide-react';
import { AtendidosService } from '../services/atendidosService';

// ... (CATÁLOGOS SE QUEDAN IGUAL) ...
const ESPECIALIDADES_LISTA = [ "URGENCIAS", "ANESTESIOLOGÍA", /* ...resto... */ "OTROS" ];
const MOTIVOS_CATALOGO = { /* ...resto... */ };
const ESTADOS_CIVILES = ["Soltero(a)", "Casado(a)", "Unión libre", "Viudo(a)"];
const ACTIVIDADES_APOYO = ["Orientación", "Gestión", "Asesoría", "Queja", "Dictamen"];

export const GestionTable = ({ onViewDetails }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // --- EDICIÓN (AQUÍ ESTÁ LA LÓGICA NUEVA) ---
  const startEditing = (row) => {
    setEditingId(row.id);
    
    // Lógica existente de especialidad/submotivo
    const espViene = row.especialidad || '';
    const esEspecialidadEstandar = ESPECIALIDADES_LISTA.includes(espViene);
    setIsOtherSpecialty(!!espViene && !esEspecialidadEstandar);

    const mot = row.motivo_inconformidad || '';
    const sub = row.submotivo || '';
    const catalogoSub = MOTIVOS_CATALOGO[mot] || [];
    const esSubmotivoEstandar = catalogoSub.includes(sub);
    setIsOtherSubmotivo(!!sub && !esSubmotivoEstandar);

    // =========================================================
    // 📍 LÓGICA AUTOMÁTICA DE FORÁNEO
    // =========================================================
    let valorForaneo = row.foraneo === true || row.foraneo === "true";
    
    // Normalizamos el municipio (quitamos espacios y mayúsculas)
    const municipio = (row.municipio || '').trim().toUpperCase();

    // REGLA: Si hay municipio y NO es TEPIC, forzamos a TRUE
    if (municipio && municipio !== 'TEPIC') {
        valorForaneo = true;
    }
    // =========================================================

    setEditForm({
      domicilio: row.domicilio || '', 
      ocupacion: row.cargo_ocupacion || row.ocupacion || '', 
      representante: row.representante || '',
      prestador_nombre: row.prestador_nombre || '',
      observaciones_servicio: row.observaciones_servicio || '',
      
      // Usamos el valor calculado
      foraneo: valorForaneo, 
      
      via_telefonica: row.via_telefonica === true || row.via_telefonica === "true",
      estado_civil: row.estado_civil || ESTADOS_CIVILES[0],
      actividad_apoyo: row.actividad_apoyo || ACTIVIDADES_APOYO[0], 
      especialidad: row.especialidad || '',
      motivo_inconformidad: row.motivo_inconformidad || '',
      submotivo: row.submotivo || ''
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
      if (name === 'motivo_inconformidad') {
        newState.submotivo = '';
        setIsOtherSubmotivo(false); 
      }
      return newState;
    });
  };

  // ... (RESTO DE TUS HANDLERS: handleSpecialtySelect, etc. SE QUEDAN IGUAL) ...
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

  const handleViewDetails = (item) => {
    if (onViewDetails) {
        onViewDetails(item); 
    }
  };

  const filteredData = data.filter(item => {
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
                  <th className="p-4 w-48 bg-slate-100">Actividad / Prestador</th>
                  <th className="p-4 w-64 bg-slate-100">Clasificación (Motivo)</th>
                  <th className="p-4 w-64 bg-slate-100">Narrativa (No Editable)</th>
                  <th className="p-4 w-48 bg-slate-100">Observaciones</th>
                  <th className="p-4 w-24 text-center bg-slate-100 sticky right-0 z-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isEditing = editingId === row.id;
                  const isMissing = !row.motivo_inconformidad || !row.actividad_apoyo || !row.especialidad;

                  return (
                    <tr key={row.id} className={`group hover:bg-slate-50 transition-colors ${isEditing ? 'bg-indigo-50/40' : ''}`}>
                      
                      {/* 1. COLUMNA FIJA */}
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
                              <span>
                                {row.edad ? `${String(row.edad).replace(/ ?años/gi, '')} años` : ''}
                              </span>
                           </div>
                           {/* MUESTRO EL MUNICIPIO PARA QUE SEPAS POR QUÉ SE MARCÓ */}
                           <div className="text-[9px] text-slate-400 mt-1">
                              {row.municipio || 'Sin Municipio'}
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
                             <input name="representante" value={editForm.representante || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Representante" />
                          </td>

                          <td className="p-2 align-top space-y-2 bg-white">
                             <textarea name="domicilio" value={editForm.domicilio || ''} onChange={handleChange} rows="2" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Domicilio..." />
                             <div className="grid grid-cols-2 gap-1">
                                <select name="estado_civil" value={editForm.estado_civil || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]">
                                   {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <input name="ocupacion" value={editForm.ocupacion || ''} onChange={handleChange} className="p-1 border border-indigo-200 rounded text-[10px]" placeholder="Ocupación" />
                             </div>
                          </td>

                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="actividad_apoyo" value={editForm.actividad_apoyo || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs font-bold">
                               {ACTIVIDADES_APOYO.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>

                             <input name="prestador_nombre" value={editForm.prestador_nombre || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs" placeholder="Prestador / Unidad" />
                             
                             <select value={isOtherSpecialty ? 'OTROS' : (editForm.especialidad || '')} onChange={handleSpecialtySelect} className="w-full p-1.5 border border-indigo-200 rounded text-xs">
                               <option value="">Especialidad...</option>
                               {ESPECIALIDADES_LISTA.map(e => <option key={e} value={e}>{e}</option>)}
                             </select>
                             {isOtherSpecialty && (
                                <input name="especialidad" value={editForm.especialidad || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" placeholder="Especifique..." autoFocus />
                             )}
                          </td>

                          <td className="p-2 align-top space-y-2 bg-white">
                             <select name="motivo_inconformidad" value={editForm.motivo_inconformidad || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs">
                               <option value="">Motivo...</option>
                               {Object.keys(MOTIVOS_CATALOGO).map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             <select value={isOtherSubmotivo ? 'OTRO (ESPECIFIQUE)' : (editForm.submotivo || '')} onChange={handleSubmotivoSelect} disabled={!editForm.motivo_inconformidad} className="w-full p-1.5 border border-indigo-200 rounded text-xs disabled:bg-slate-100">
                               <option value="">Submotivo...</option>
                               {editForm.motivo_inconformidad && MOTIVOS_CATALOGO[editForm.motivo_inconformidad]?.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             {isOtherSubmotivo && (
                                <input name="submotivo" value={editForm.submotivo || ''} onChange={handleChange} className="w-full p-1.5 border border-indigo-200 rounded text-xs bg-indigo-50 animate-in fade-in" placeholder="Especifique..." autoFocus />
                             )}
                          </td>

                          <td className="p-2 align-top bg-slate-50/50">
                             <div className="text-[10px] text-slate-500 max-h-32 overflow-y-auto leading-relaxed border border-dashed border-slate-200 p-1.5 rounded">
                                {row.descripcion_hechos || 'Sin descripción'}
                             </div>
                          </td>

                          <td className="p-2 align-top bg-white">
                             <textarea name="observaciones_servicio" value={editForm.observaciones_servicio || ''} onChange={handleChange} rows="5" className="w-full p-1.5 border border-indigo-200 rounded text-xs resize-none" placeholder="Observaciones..." />
                          </td>

                          <td className={`p-4 text-center sticky right-0 z-10 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-indigo-50`}>
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
                             <div className="font-bold text-slate-700 mb-1">{row.actividad_apoyo}</div>
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

                          <td className="p-4 text-center sticky right-0 z-10 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-white group-hover:bg-slate-50">
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
    </>
  );
};