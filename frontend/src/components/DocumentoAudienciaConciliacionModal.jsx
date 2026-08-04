import React, { useState } from 'react';
import { X, Save, FileText, Handshake, User, Calendar, Stethoscope, Clock, Plus, Trash2, CheckCircle2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { AtendidosService } from '../services/atendidosService';
import { generarPDFAudienciaConciliacion } from '../utils/pdfGenerator'; 

const DocumentoAudienciaConciliacionModal = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  const formatDateCorta = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  
  const formatTime = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const existingData = item?.datos_docs || {};

  // 1. ESTADO PERSISTENTE (Se guarda en BD)
  const [formData, setFormData] = useState({
    medico_nombre: existingData.medico_nombre || 
      (existingData.contra_quien && !existingData.contra_quien.toUpperCase().startsWith('DR') 
        ? `Dr. ${existingData.contra_quien}` 
        : existingData.contra_quien) || 'Dr. ',
    nombre_usuario: existingData.nombre_usuario || `${item?.nombre || ''} ${item?.apellido_paterno || ''} ${item?.apellido_materno || ''}`.trim(),
    nombre_testigo: existingData.nombre_testigo || '',
    clausulas_listadas: existingData.clausulas_listadas || ['']
  });

  // 2. ESTADO EFÍMERO (Solo impresión)
  const [localData, setLocalData] = useState({
    fecha_documento: formatDateCorta(new Date()),
    hora_documento: formatTime(new Date()),
  });

  if (!isOpen || !item) return null;

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  // --- LÓGICA DE CLÁUSULAS ---
  const handleClausulaChange = (index, value) => {
    const nuevasClausulas = [...formData.clausulas_listadas];
    nuevasClausulas[index] = value;
    setFormData(prev => ({ ...prev, clausulas_listadas: nuevasClausulas }));
  };

  const agregarClausula = () => {
    setFormData(prev => ({ ...prev, clausulas_listadas: [...prev.clausulas_listadas, ''] }));
  };

  const eliminarClausula = (index) => {
    const nuevasClausulas = formData.clausulas_listadas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, clausulas_listadas: nuevasClausulas }));
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading('Guardando datos del convenio...');
    try {
      await AtendidosService.updateDatosDocs(item.id, formData);
      toast.success('Datos guardados correctamente', { id: toastId });
    } catch (error) {
      console.error("Error guardando datos_docs:", error);
      toast.error('Error al guardar. Verifica tu conexión.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerando(true);
    const toastId = toast.loading('Guardando y generando acta...');
    
    try {
      await AtendidosService.updateDatosDocs(item.id, formData);
      const expActualizado = { 
        ...item, 
        datos_docs: { ...existingData, ...formData },
        ...localData 
      };
      
      generarPDFAudienciaConciliacion(expActualizado);
      toast.success('Acta generada exitosamente', { id: toastId });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error('Error al generar el PDF.', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  const handlePreviewPDF = async () => {
    const toastId = toast.loading('Previsualizando PDF...');
    try {
      const expActualizado = { 
        ...item, 
        datos_docs: { ...existingData, ...formData },
        ...localData 
      };
      
      generarPDFAudienciaConciliacion(expActualizado, "previsualizar");
      toast.success('PDF previsualizado exitosamente', { id: toastId });
    } catch (error) {
      console.error("Error previsualizando PDF:", error);
      toast.error('Error al previsualizar el PDF.', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <Handshake size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Audiencia de Conciliación (Convenio)</h2>
              <p className="text-xs font-bold text-slate-400">Expediente: {item.servicio || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-sky-900 uppercase tracking-wider flex items-center gap-2 border-b border-sky-100 pb-2">
                <User size={16} /> Partes Involucradas
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Quejoso / Paciente</label>
                <input type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Stethoscope size={14}/> Prestador del Servicio Médico</label>
                <input type="text" name="medico_nombre" value={formData.medico_nombre} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> Nombre del Testigo</label>
                <input type="text" name="nombre_testigo" value={formData.nombre_testigo} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Nombre completo del testigo presente"/>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-sky-900 uppercase tracking-wider flex items-center gap-2 border-b border-sky-100 pb-2">
                <Calendar size={16} /> Fecha y Hora (Impresión)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Audiencia</label>
                  <input type="date" name="fecha_documento" value={localData.fecha_documento} onChange={handleChangeLocal} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Clock size={14}/> Hora de Inicio</label>
                  <input type="time" name="hora_documento" value={localData.hora_documento} onChange={handleChangeLocal} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"/>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE CLÁUSULAS */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} /> Cláusulas del Convenio
              </h3>
              <button onClick={agregarClausula} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Agregar Cláusula
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.clausulas_listadas.map((clausula, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="mt-2 text-xs font-black text-slate-400 w-6 text-center">{index + 1}.</span>
                  <textarea 
                    rows={2}
                    value={clausula}
                    onChange={(e) => handleClausulaChange(index, e.target.value)}
                    placeholder={`Redacta el acuerdo de la cláusula ${index + 1}...`}
                    className="flex-1 p-2 bg-slate-50 border border-slate-100 rounded-md text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none custom-scrollbar"
                  />
                  <button 
                    onClick={() => eliminarClausula(index)}
                    disabled={formData.clausulas_listadas.length === 1}
                    className="mt-1 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-200/50 rounded-xl font-bold text-sm transition-colors">
            Cerrar
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewPDF}
              disabled={loading || generando}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <Eye size={16} />
              Vista Previa
            </button>

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
              className="px-6 py-2.5 bg-sky-600 text-white hover:bg-sky-700 rounded-xl font-bold text-sm transition-all shadow-md shadow-sky-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <Handshake size={16} />
              {generando ? 'Generando...' : 'Generar PDF Convenio'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentoAudienciaConciliacionModal;