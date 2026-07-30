import React, { useState } from 'react';
import { X, Save, FileText, User, Calendar, Stethoscope, Clock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AtendidosService } from '../services/atendidosService';
import { generarPDFDiferimientoAudiencia } from '../utils/pdfGenerator'; 

const DocumentoDiferimientoAudienciaModal = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  const formatDateTimeLocal = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const existingData = item?.datos_docs || {};

  // 1. ESTADO PERSISTENTE
  const [formData, setFormData] = useState({
    medico_nombre: existingData.medico_nombre || 
      (existingData.contra_quien && !existingData.contra_quien.toUpperCase().startsWith('DR') 
        ? `Dr. ${existingData.contra_quien}` 
        : existingData.contra_quien) || 'Dr. ',
    nombre_usuario: existingData.nombre_usuario || `${item?.nombre || ''} ${item?.apellido_paterno || ''} ${item?.apellido_materno || ''}`.trim(),
    usuario_manifestacion: existingData.usuario_manifestacion || ''
  });

  // 2. ESTADO EFÍMERO
  const defaultInicio = new Date();
  const defaultFin = new Date(defaultInicio.getTime() + 60 * 60 * 1000); 

  const [localData, setLocalData] = useState({
    fecha_documento: formatDateTimeLocal(defaultInicio),
    fecha_conclusion: formatDateTimeLocal(defaultFin),
    fecha_citatorio: formatDateTimeLocal(new Date(defaultInicio.getTime() + 7 * 24 * 60 * 60 * 1000)), // Sugiere 7 días después
  });

  const handleInicioChange = (e) => {
    const nuevaFecha = new Date(e.target.value);
    const nuevaConclusion = new Date(nuevaFecha.getTime() + 60 * 60 * 1000);
    setLocalData(prev => ({
      ...prev,
      fecha_documento: formatDateTimeLocal(nuevaFecha),
      fecha_conclusion: formatDateTimeLocal(nuevaConclusion)
    }));
  };

  if (!isOpen || !item) return null;

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const esFemeninoUsuario = item?.sexo === 'Femenino';
  const articuloUsuario = esFemeninoUsuario ? 'La' : 'El';
  const sustantivoUsuario = esFemeninoUsuario ? 'usuaria' : 'usuario';

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading('Guardando datos...');
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
      
      generarPDFDiferimientoAudiencia(expActualizado);
      toast.success('Acta generada exitosamente', { id: toastId });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error('Error al generar el PDF.', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Diferimiento de Audiencia</h2>
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
              <h3 className="text-sm font-black text-teal-900 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-2">
                <User size={16} /> Partes Involucradas
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Quejoso / Paciente</label>
                <input type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Stethoscope size={14}/> Nombre del Prestador de Servicio</label>
                <input type="text" name="medico_nombre" value={formData.medico_nombre} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"/>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-teal-900 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-2">
                <Calendar size={16} /> Fechas de la Sesión (Impresión)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">Fecha y Hora de Inicio</label>
                  <input type="datetime-local" name="fecha_documento" value={localData.fecha_documento} onChange={handleInicioChange} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">Hora de Conclusión</label>
                  <input type="datetime-local" name="fecha_conclusion" value={localData.fecha_conclusion} onChange={handleChangeLocal} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nueva Fecha (Siguiente Audiencia)</label>
                <input type="datetime-local" name="fecha_citatorio" value={localData.fecha_citatorio} onChange={handleChangeLocal} className="w-full p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"/>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <MessageCircle size={16} /> Motivo del Diferimiento
            </h3>
            
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 italic">
                "{articuloUsuario} {sustantivoUsuario} de servicios médicos {formData.nombre_usuario || '___'}, manifiesta que..."
              </p>
              <textarea 
                name="usuario_manifestacion" 
                value={formData.usuario_manifestacion} 
                onChange={handleChangeForm} 
                rows={3}
                placeholder="Redacta por qué el paciente pide tiempo (ej. necesita consultar con sus familiares la propuesta)..."
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none custom-scrollbar resize-none"
              />
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
              className="px-6 py-2.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <FileText size={16} />
              {generando ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentoDiferimientoAudienciaModal;