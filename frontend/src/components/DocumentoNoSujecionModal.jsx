import React, { useState } from 'react';
import { X, Save, FileText, FileX, User, Calendar, Stethoscope, MapPin, Phone, CreditCard, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { AtendidosService } from '../services/atendidosService';
import { generarPDFNoSujecion } from '../utils/pdfGenerator'; 

const DocumentoNoSujecionModal = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);

  const formatDateCorta = (date) => {
    const d = date ? new Date(date) : new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const existingData = item?.datos_docs || {};

  // 1. ESTADO PERSISTENTE (Se guarda en BD)
  const [formData, setFormData] = useState({
    medico_nombre: existingData.medico_nombre || 
      (existingData.contra_quien && !existingData.contra_quien.toUpperCase().startsWith('DR') 
        ? `Dr. ${existingData.contra_quien}` 
        : existingData.contra_quien) || 'Dr. ',
    medico_domicilio: existingData.medico_domicilio || '',
    medico_colonia_Med: existingData.medico_colonia_Med || '',
    medico_ciudad: existingData.medico_ciudad || 'Tepic, Nayarit',
    medico_telefono: existingData.medico_telefono || '',
    medico_cedula: existingData.medico_cedula || '',
    nombre_usuario: existingData.nombre_usuario || `${item?.nombre || ''} ${item?.apellido_paterno || ''} ${item?.apellido_materno || ''}`.trim()
  });

  // 2. ESTADO EFÍMERO (Solo impresión)
  const [localData, setLocalData] = useState({
    fecha_documento: formatDateCorta(new Date()),
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
    const toastId = toast.loading('Guardando datos del prestador...');
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
    const toastId = toast.loading('Guardando y generando constancia...');
    
    try {
      await AtendidosService.updateDatosDocs(item.id, formData);

      const expActualizado = { 
        ...item, 
        datos_docs: { ...existingData, ...formData },
        ...localData 
      };
      
      generarPDFNoSujecion(expActualizado);
      
      toast.success('Documento generado exitosamente', { id: toastId });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error('Error al generar el PDF.', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  const handlePreviewPDF = async () => {
    setGenerando(true);
    const toastId = toast.loading('Generando vista previa...');
    
    try {
      await AtendidosService.updateDatosDocs(item.id, formData);

      const expActualizado = { 
        ...item, 
        datos_docs: { ...existingData, ...formData },
        ...localData 
      };
      
      generarPDFNoSujecion(expActualizado, 'previsualizar');
      
      toast.success('Vista previa abierta', { id: toastId });
    } catch (error) {
      console.error("Error generando vista previa:", error);
      toast.error('Error al generar la vista previa.', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <FileX size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">No Sujeción al Procedimiento</h2>
              <p className="text-xs font-bold text-slate-400">Expediente: {item.servicio || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          
          {/* SECCIÓN 1: DATOS DEL DOCUMENTO Y USUARIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-red-900 uppercase tracking-wider flex items-center gap-2 border-b border-red-100 pb-2">
                <User size={16} /> Datos de la Queja
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Quejoso</label>
                <input type="text" name="nombre_usuario" value={formData.nombre_usuario} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"/>
                <p className="text-[10px] text-slate-400 mt-1">El sistema adaptará (El señor/La señora) basado en el sexo: {item?.sexo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-red-900 uppercase tracking-wider flex items-center gap-2 border-b border-red-100 pb-2">
                <Calendar size={16} /> Fecha de Emisión (Impresión)
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Fecha del Documento</label>
                <input type="date" name="fecha_documento" value={localData.fecha_documento} onChange={handleChangeLocal} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"/>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL MÉDICO */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Stethoscope size={16} /> Prestador del Servicio Médico que Rechaza
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Prestador</label>
                <input type="text" name="medico_nombre" value={formData.medico_nombre} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><CreditCard size={14}/> Cédula Profesional</label>
                <input type="text" name="medico_cedula" value={formData.medico_cedula} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1"><Phone size={14}/> Teléfono</label>
                <input type="text" name="medico_telefono" value={formData.medico_telefono} onChange={handleChangeForm} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none"/>
              </div>

              <div className="md:col-span-2 space-y-3 mt-2">
                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin size={14} /> Ubicación</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Calle y Número</label>
                    <input type="text" name="medico_domicilio" value={formData.medico_domicilio} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Colonia</label>
                    <input type="text" name="medico_colonia_Med" value={formData.medico_colonia_Med} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ciudad y Estado</label>
                    <input type="text" name="medico_ciudad" value={formData.medico_ciudad} onChange={handleChangeForm} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"/>
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
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold text-sm transition-all shadow-md shadow-red-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <FileText size={16} />
              {generando ? 'Generando...' : 'Generar PDF Constancia'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentoNoSujecionModal;