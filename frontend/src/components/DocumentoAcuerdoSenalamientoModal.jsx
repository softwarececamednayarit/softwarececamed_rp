import React, { useState } from 'react';
import { X, Save, FileText, Calendar, User, MapPin, Hash, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { AtendidosService } from '../services/atendidosService';
import { generarPDFAcuerdoSenalamiento } from '../utils/pdfGenerator'; 

const DocumentoAcuerdoSenalamientoModal = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  const formatDateTimeLocal = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatDateCorta = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const existingData = item?.datos_docs || {};

  // 1. ESTADO PERSISTENTE
  const [formData, setFormData] = useState({
    prestador_noOficio: existingData.prestador_noOficio || 'SM/UC/',
    medico_nombre: existingData.medico_nombre || 
      (existingData.contra_quien && !existingData.contra_quien.toUpperCase().startsWith('DR') 
        ? `Dr. ${existingData.contra_quien}` 
        : existingData.contra_quien) || 'Dr. ',
    nombre_usuario: existingData.nombre_usuario || `${item?.nombre || ''} ${item?.apellido_paterno || ''} ${item?.apellido_materno || ''}`.trim(),
    usuario_domicilio: existingData.usuario_domicilio || '',
    usuario_colonia: existingData.usuario_colonia || '',
    usuario_ciudad: existingData.usuario_ciudad || 'Tepic, Nayarit',
  });

  // 2. ESTADO EFÍMERO
  const [localData, setLocalData] = useState({
    fecha_documento: formatDateTimeLocal(new Date()),
    fecha_citatorio: formatDateTimeLocal(new Date()),
    fecha_contestacion: formatDateCorta(new Date()), // Nueva fecha efímera
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

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading('Guardando datos del oficio...');
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
    const toastId = toast.loading('Guardando y generando oficio...');
    
    try {
      await AtendidosService.updateDatosDocs(item.id, formData);
      const expActualizado = { 
        ...item, 
        datos_docs: { ...existingData, ...formData },
        ...localData 
      };
      
      generarPDFAcuerdoSenalamiento(expActualizado);
      toast.success('Oficio generado exitosamente', { id: toastId });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error('Error al generar el PDF.', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Acuerdo y Señalamiento (Audiencia Prestador)</h2>
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
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Hash size={16} /> Identificación del Oficio
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Número de Oficio</label>
                <input type="text" name="prestador_noOficio" value={formData.prestador_noOficio} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Stethoscope size={14}/> Nombre del Prestador de Servicio</label>
                <input type="text" name="medico_nombre" value={formData.medico_nombre} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Calendar size={16} /> Fechas Programadas
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Elaboración del Documento</label>
                <input type="datetime-local" name="fecha_documento" value={localData.fecha_documento} onChange={handleChangeLocal} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">Fecha de Contestación</label>
                  <input type="date" name="fecha_contestacion" value={localData.fecha_contestacion} onChange={handleChangeLocal} className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">Fecha del Citatorio</label>
                  <input type="datetime-local" name="fecha_citatorio" value={localData.fecha_citatorio} onChange={handleChangeLocal} className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <User size={16} /> Datos del Destinatario (Quejoso/Paciente)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                <input type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>

              <div className="md:col-span-2 space-y-3 mt-2">
                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin size={14} /> Domicilio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Calle y Número</label>
                    <input type="text" name="usuario_domicilio" value={formData.usuario_domicilio} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Colonia</label>
                    <input type="text" name="usuario_colonia" value={formData.usuario_colonia} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ciudad y Estado</label>
                    <input type="text" name="usuario_ciudad" value={formData.usuario_ciudad} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
                  </div>
                </div>
              </div>
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
              className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <FileText size={16} />
              {generando ? 'Generando...' : 'Generar Oficio'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentoAcuerdoSenalamientoModal;