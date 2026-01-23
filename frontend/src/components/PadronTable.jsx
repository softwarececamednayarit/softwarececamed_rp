import React, { useState, useEffect } from 'react';
import { 
  Search, Save, X, Edit2, Loader2, AlertCircle, FileSpreadsheet, Eye 
} from 'lucide-react';
import { AtendidosService } from '../services/atendidosService';
import { DetailModal } from './DetailModal';
import { formatDate, getStatusColor } from '../utils/formatters';

// --- CONSTANTES ---
const MUNICIPIOS = [
  "Acaponeta","Ahuacatlán","Amatlán de Cañas","Bahía de Banderas",
  "Compostela","Del Nayar","Huajicori","Ixtlán del Río",
  "Jala","La Yesca","Rosamorada","Ruiz","San Blas",
  "San Pedro Lagunillas","Santa María del Oro",
  "Santiago Ixcuintla","Tecuala","Tepic","Tuxpan","Xalisco"
];

const ESTADOS_CIVILES = [
  "Soltero(a)", "Casado(a)", "Unión libre", "Viudo(a)", 
  "Divorciado(a)", "Separado(a)", "No Aplica"
];

const TIPOS_BENEFICIARIO = ["Directo", "Indirecto"];

const PARENTESCOS = [
  "Beneficiario", "Cónyuge o Compañero(a)", "Padre o Madre", "Hijo(a)",
  "Abuelo(a)", "Hermano(a)", "Nieto(a)", "Suegro(a)", 
  "Sobrino(a)", "Yerno o Nuera", "Hijastro(a) / Entendado(a)", 
  "No Tiene Parentesco", "Otro Parentesco"
];

const TIPOS_APOYO = [
  "Servicio", "Especie", "Monetario", "Producto Subsidiado", "Mixto", "Estatal"
];

const ACTIVIDADES_APOYO = [
  "Orientación", "Gestión", "Asesoría", "Queja", "Dictamen"
];

export const PadronTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // --- CARGA ---
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await AtendidosService.getPadronReport();
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error cargando tabla", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- EDICIÓN ---
  const startEditing = (row) => {
    setEditingId(row.id);
    setEditForm({
      municipio: row.municipio || '',
      localidad: row.localidad || '',
      estado_civil: row.estado_civil || 'Soltero(a)',
      cargo_ocupacion: row.cargo_ocupacion || '',
      tipo_beneficiario: row.tipo_beneficiario || 'Directo',
      parentesco: row.parentesco || 'Beneficiario',
      actividad_apoyo: row.actividad_apoyo || 'Orientación',
      tipo_apoyo: row.tipo_apoyo || 'Servicio',
      // 1. AGREGADO: Default "Servidor Público Estatal" si viene vacío
      criterio_seleccion: row.criterio_seleccion || 'Servidor Público Estatal', 
      monto_apoyo: row.monto_apoyo || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveRow = async (id) => {
    try {
      setSaving(true);
      await AtendidosService.updatePadron(id, editForm);
      setData(prevData => prevData.map(item => item.id === id ? { ...item, ...editForm } : item));
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (item) => setSelectedItem(item);
  const handleCloseModal = () => {
    setSelectedItem(null);
    loadData(); 
  };

  const filteredData = data.filter(item => 
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.apellido_paterno?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[85vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600" /> Tabla Maestra de Padrón
            </h2>
            <p className="text-xs text-slate-500 mt-1">Edición masiva y complementación de datos</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar por nombre..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* TABLA */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
          ) : (
            <table className="w-full text-left border-collapse" style={{ minWidth: '1400px' }}>
              <thead className="text-slate-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-20">
                <tr className="bg-slate-100 shadow-sm">
                  <th className="p-4 w-60 bg-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ciudadano (Datos Base)</th>
                  <th className="p-4 w-32 bg-slate-100">Ubicación</th>
                  <th className="p-4 w-32 bg-slate-100">Socioeconómico</th>
                  <th className="p-4 w-32 bg-slate-100">Beneficiario</th>
                  <th className="p-4 w-32 bg-slate-100">Actividad</th>
                  {/* 2. AGREGADO: Columna Criterio */}
                  <th className="p-4 w-48 bg-slate-100">Criterio / Justificación</th> 
                  <th className="p-4 w-32 bg-slate-100">Apoyo</th>
                  <th className="p-4 w-20 bg-slate-100">Monto</th>
                  <th className="p-4 w-24 text-center bg-slate-100 sticky right-0 z-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredData.map((row) => {
                  const isEditing = editingId === row.id;
                  const isIncomplete = !row.municipio || !row.tipo_apoyo || !row.actividad_apoyo;

                  return (
                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-indigo-50/30' : ''}`}>
                      
                      {/* COLUMNA FIJA */}
                      <td className="p-4 sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-slate-800 text-sm mb-1">
                          {row.nombre} {row.apellido_paterno} {row.apellido_materno}
                        </div>
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500">
                           <span className="font-mono bg-slate-100 px-1 rounded w-fit text-slate-600">{row.fecha_beneficio || 'SIN FECHA'}</span>
                           <span className="font-mono bg-slate-100 px-1 rounded w-fit text-slate-600">{row.curp || 'SIN CURP'}</span>
                           <div className="flex gap-2 mt-1">
                              <span>{row.sexo || '?'}</span>
                              <span className="text-slate-300">|</span>
                              <span>{row.edad ? `${row.edad}` : 'Edad N/A'}</span>
                           </div>
                        </div>
                        {isIncomplete && !isEditing && (
                          <div className="flex items-center gap-1 text-[9px] text-amber-600 mt-2 font-bold bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                            <AlertCircle size={10} /> Faltan datos
                          </div>
                        )}
                      </td>

                      {isEditing ? (
                        /* --- MODO EDICIÓN --- */
                        <>
                          <td className="p-2 align-top space-y-2">
                             <select name="municipio" value={editForm.municipio} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               <option value="">Mpio...</option>
                               {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                             <input name="localidad" value={editForm.localidad} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs" placeholder="Loc." />
                          </td>
                          
                          <td className="p-2 align-top space-y-2">
                             <select name="estado_civil" value={editForm.estado_civil} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
                             </select>
                             <input name="cargo_ocupacion" value={editForm.cargo_ocupacion} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs" placeholder="Ocupación" />
                          </td>

                          <td className="p-2 align-top space-y-2">
                             <select name="tipo_beneficiario" value={editForm.tipo_beneficiario} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               {TIPOS_BENEFICIARIO.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                             <select name="parentesco" value={editForm.parentesco} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                          </td>

                          <td className="p-2 align-top">
                             <select name="actividad_apoyo" value={editForm.actividad_apoyo} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               {ACTIVIDADES_APOYO.map(a => <option key={a} value={a}>{a}</option>)}
                             </select>
                          </td>

                          {/* 3. CAMPO EDITABLE CRITERIO (TEXTAREA) */}
                          <td className="p-2 align-top">
                             <textarea 
                                name="criterio_seleccion" 
                                value={editForm.criterio_seleccion} 
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white resize-none focus:outline-none focus:border-indigo-500"
                                placeholder="Criterio..."
                             />
                          </td>

                          <td className="p-2 align-top">
                             <select name="tipo_apoyo" value={editForm.tipo_apoyo} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs bg-white">
                               {TIPOS_APOYO.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                          </td>

                          <td className="p-2 align-top">
                             <input type="number" name="monto_apoyo" value={editForm.monto_apoyo} onChange={handleChange} className="w-full p-1.5 border border-indigo-300 rounded text-xs" placeholder="$" />
                          </td>

                          <td className="p-2 text-center align-top sticky right-0 bg-white z-10">
                             <div className="flex flex-col gap-1 items-center">
                               <button onClick={() => saveRow(row.id)} disabled={saving} className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition w-8 flex justify-center shadow-md">
                                 {saving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />}
                               </button>
                               <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition w-8 flex justify-center">
                                 <X size={14} />
                               </button>
                             </div>
                          </td>
                        </>
                      ) : (
                        /* --- MODO LECTURA --- */
                        <>
                          <td className="p-4 align-top">
                             <div className="font-bold text-slate-700">{row.municipio || '-'}</div>
                             <div className="text-slate-400 text-[10px]">{row.localidad}</div>
                          </td>
                          <td className="p-4 align-top">
                             <div>{row.estado_civil || '-'}</div>
                             <div className="text-slate-400 truncate" style={{ fontSize: '10px', maxWidth: '100px' }} title={row.cargo_ocupacion}>
                                {row.cargo_ocupacion}
                              </div>
                          </td>
                          <td className="p-4 align-top">
                             <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${row.tipo_beneficiario === 'Directo' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                               {row.tipo_beneficiario || '-'}
                             </span>
                             <div className="text-slate-400 text-[10px] mt-1">{row.parentesco}</div>
                          </td>
                          <td className="p-4 align-top">
                             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 block w-fit">
                               {row.actividad_apoyo || '-'}
                             </span>
                          </td>
                          
                          {/* 4. CAMPO LECTURA CRITERIO */}
                          <td className="p-4 align-top">
                             <div className="text-[10px] text-slate-500 line-clamp-3 leading-tight" title={row.criterio_seleccion}>
                               {row.criterio_seleccion || '-'}
                             </div>
                          </td>

                          <td className="p-4 align-top">
                             <div className="text-slate-600 font-medium">{row.tipo_apoyo || '-'}</div>
                          </td>
                          <td className="p-4 align-top font-mono text-slate-600 font-bold">
                             {row.monto_apoyo ? `$${row.monto_apoyo}` : '-'}
                          </td>
                          <td className="p-4 text-center sticky right-0 bg-inherit z-10">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => handleViewDetails(row)} className="p-1.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded transition border border-indigo-100" title="Ver Detalle">
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