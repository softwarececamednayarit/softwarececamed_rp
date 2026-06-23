import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Plus, Trash2, Info, Clock, User, UserCheck, Scale, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AtendidosService } from '../services/atendidosService';
// Importamos la función generadora de PDF (Ajusta la ruta según tu estructura)
import { generarPDFActaQueja } from '../utils/pdfGenerator'; 

const DocumentosQuejaModal = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  // Helper para formatear fechas al input datetime-local (YYYY-MM-DDThh:mm)
  const formatDatetimeLocal = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 1. INICIALIZACIÓN DEL ESTADO
  // Si el item ya trae datos guardados previamente en datos_docs, los usamos. Si no, cargamos los defaults sugeridos.
  const existingData = item?.datos_docs || {};
  
  const [formData, setFormData] = useState({
    consultor_medico: existingData.consultor_medico || 'DRA. AMERICA IVONNE GAMEROS ORTIZ',
    consultor_juridico: existingData.consultor_juridico || 'LCDA. ROSA GLORIA AGUILAR SARTIAGUÍN',
    fecha_hora_inicio: existingData.fecha_hora_inicio || formatDatetimeLocal(),
    fecha_hora_conclusion: existingData.fecha_hora_conclusion || formatDatetimeLocal(),
    
    nombre_usuario: existingData.nombre_usuario || `${item?.nombre || ''} ${item?.apellido_paterno || ''} ${item?.apellido_materno || ''}`.trim(),
    motivo_queja: existingData.motivo_queja || item?.submotivo_catalogo || '',
    edad: existingData.edad || item?.edad_o_nacimiento || item?.edad || '',
    
    contra_quien: existingData.contra_quien || item?.medico_nombre || '',
    profesion_especialidad: existingData.profesion_especialidad || '',
    
    hechos_ocurridos: existingData.hechos_ocurridos || '',
    pretensiones_generales: existingData.pretensiones_generales || item?.pretensiones || '',
    
    // Arrays dinámicos
    pretensiones_listadas: existingData.pretensiones_listadas?.length > 0 
      ? existingData.pretensiones_listadas 
      : [''],
    documentacion_recibida: existingData.documentacion_recibida?.length > 0 
      ? existingData.documentacion_recibida 
      : ['COPIA SIMPLE DE INE.', 'COPIA SIMPLE DE COMPROBANTE DE DOMICILIO CFE.']
  });

  if (!isOpen || !item) return null;

  // 2. MANEJADORES DE ESTADO
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejadores para Arrays Dinámicos (Listas)
  const handleArrayChange = (field, index, value) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveArrayItem = (field, index) => {
    const newList = [...formData[field]];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  // 3. GUARDAR EN BACKEND
  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading('Guardando datos del documento...');
    try {
      // Usamos updateDatosDocs que definimos en el controlador/modelo (hace un merge)
      await AtendidosService.updateDatosDocs(item.id, formData);
      toast.success('Datos guardados correctamente', { id: toastId });
      // Nota: NO cerramos el modal aquí por si el usuario quiere generar el PDF inmediatamente después.
    } catch (error) {
      console.error("Error guardando datos_docs:", error);
      // Al rechazar el servidor, lanzamos el error, PERO los datos escritos siguen en `formData` intactos.
      toast.error('Error al guardar. Revisa tu conexión e intenta de nuevo.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 4. GENERAR PDF
  const handleGeneratePDF = async () => {
    setGenerando(true);
    try {
      // Inyectamos el formData actual al item para mandarlo al PDF
      const expActualizado = { ...item, datos_docs: formData };
      // Llamamos a tu función de PDF (asegúrate de que esa función lea `exp.datos_docs` y no `exp.datos_queja`)
      generarPDFActaQueja(expActualizado);
      toast.success('PDF Generado correctamente');
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error('Ocurrió un error al generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Generación de Acta de Queja</h2>
              <p className="text-xs font-bold text-slate-400">Expediente: {item.folio || 'S/F'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY - FORMULARIO */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          
          {/* SECCIÓN 1: PERSONAL Y TIEMPOS */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-2">
              <UserCheck size={16} /> Personal y Fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Consultor Médico</label>
                <select name="consultor_medico" value={formData.consultor_medico} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="DRA. AMERICA IVONNE GAMEROS ORTIZ">DRA. AMERICA IVONNE GAMEROS ORTIZ</option>
                  <option value="DR. ANTONIO ALDACO TORRES">DR. ANTONIO ALDACO TORRES</option>
                  <option value="DR. CESAR ENRIQUE ARIAS CASTILLO">DR. CESAR ENRIQUE ARIAS CASTILLO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Consultor Jurídico</label>
                <select name="consultor_juridico" value={formData.consultor_juridico} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="LCDA. ROSA GLORIA AGUILAR SARTIAGUÍN">LCDA. ROSA GLORIA AGUILAR SARTIAGUÍN</option>
                  <option value="LIC. JUAN TREJO PEÑA">LIC. JUAN TREJO PEÑA</option>
                  <option value="LIC. MARTÍN ALEJANDRO OLMEDO LOMELÍ">LIC. MARTÍN ALEJANDRO OLMEDO LOMELÍ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Clock size={12}/> Fecha y Hora de Inicio</label>
                <input type="datetime-local" name="fecha_hora_inicio" value={formData.fecha_hora_inicio} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Clock size={12}/> Fecha y Hora de Conclusión</label>
                <input type="datetime-local" name="fecha_hora_conclusion" value={formData.fecha_hora_conclusion} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DE LAS PARTES */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-100 pb-2">
              <User size={16} /> Usuario y Prestador de Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Usuario (Quejoso)</label>
                <input type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"/>
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">Edad</label>
                <input type="text" name="edad" value={formData.edad} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"/>
              </div>
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-600 mb-1">Contra quién va la queja</label>
                <input type="text" name="contra_quien" value={formData.contra_quien} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"/>
              </div>
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-600 mb-1">Profesión / Especialidad</label>
                <input type="text" name="profesion_especialidad" value={formData.profesion_especialidad} placeholder="Ej. Odontólogo especialista en Ortodoncia" onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none"/>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: HECHOS Y MOTIVOS (Con panel de ayuda) */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2 border-b border-amber-100 pb-2">
              <FileText size={16} /> Narrativa de Hechos
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Motivo de la Queja</label>
                  <input type="text" name="motivo_queja" value={formData.motivo_queja} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Hechos Ocurridos (Redactar en Primera Persona)</label>
                  <textarea name="hechos_ocurridos" value={formData.hechos_ocurridos} onChange={handleChange} rows={8} placeholder="Ej. El día 15 de marzo acudí a consulta porque presentaba dolor..." className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed"></textarea>
                </div>
              </div>

              {/* Columna Derecha: Recordatorio del Expediente */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col h-full">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Info size={14}/> Datos Originales del Registro
                </h4>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-amber-700/70 uppercase">Detalle del Motivo</span>
                    <p className="text-amber-900 font-medium bg-white/60 p-2 rounded border border-amber-100 mt-1 italic">
                      {item.motivo_queja_detalle || 'Sin detalle previo.'}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-amber-700/70 uppercase">Descripción de Hechos</span>
                    <p className="text-amber-900 font-medium bg-white/60 p-2 rounded border border-amber-100 mt-1 italic text-xs leading-relaxed">
                      {item.descripcion_hechos || 'Sin hechos redactados en registro.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: PRETENSIONES */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-100 pb-2">
              <Scale size={16} /> Pretensiones
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pretensión General</label>
              <input type="text" name="pretensiones_generales" value={formData.pretensiones_generales} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 mt-4">
                <label className="block text-xs font-bold text-slate-600">Listado Específico de Pretensiones</label>
                <button onClick={() => handleAddArrayItem('pretensiones_listadas')} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                  <Plus size={12}/> AGREGAR PRETENSION
                </button>
              </div>
              <div className="space-y-2">
                {formData.pretensiones_listadas.map((pret, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="mt-2.5 text-xs font-black text-slate-400 w-5">{idx + 1}.</span>
                    <input type="text" value={pret} onChange={(e) => handleArrayChange('pretensiones_listadas', idx, e.target.value)} placeholder="Ej. El reembolso de la cantidad pagada..." className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"/>
                    <button onClick={() => handleRemoveArrayItem('pretensiones_listadas', idx)} disabled={formData.pretensiones_listadas.length === 1} className="mt-1 p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: DOCUMENTACIÓN RECIBIDA */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileCheck size={16} /> Documentación Recibida
            </h3>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-600">Lista de Documentos Anexos</label>
                <button onClick={() => handleAddArrayItem('documentacion_recibida')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-200 transition-colors">
                  <Plus size={12}/> AGREGAR DOCUMENTO
                </button>
              </div>
              <div className="space-y-2">
                {formData.documentacion_recibida.map((docu, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="mt-2.5 text-xs font-black text-slate-400 w-5">{idx + 1}.</span>
                    <input type="text" value={docu} onChange={(e) => handleArrayChange('documentacion_recibida', idx, e.target.value)} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-500 outline-none uppercase"/>
                    <button onClick={() => handleRemoveArrayItem('documentacion_recibida', idx)} disabled={formData.documentacion_recibida.length === 1} className="mt-1 p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER - ACCIONES */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-200/50 rounded-xl font-bold text-sm transition-colors">
            Cerrar
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={loading || generando}
              className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Guardar Datos'}
            </button>
            
            <button 
              onClick={handleGeneratePDF}
              disabled={loading || generando}
              className="px-6 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold text-sm transition-all shadow-md shadow-rose-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <FileText size={16} />
              {generando ? 'Generando PDF...' : 'Generar PDF Queja'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentosQuejaModal;