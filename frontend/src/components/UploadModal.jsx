import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Loader2, Zap, RotateCcw } from 'lucide-react';
import { optimizePDF, generateFileHash } from '../utils/pdfOptimizer';
import { sanitizeFileName, ensurePdfExtension } from '../utils/fileUtils';
import { toast } from 'react-hot-toast';
import archivosService from '../services/archivosService';

const UploadModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [hash, setHash] = useState('');
  const [stats, setStats] = useState({ original: 0, optimized: 0, percent: 0 });

  const [formData, setFormData] = useState({
    noOficio: '',
    fechaDocumento: '',
    origen: '',
    cargo: '',
    fechaRecibido: new Date().toISOString().split('T')[0],
    horaRecibido: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    asunto: '',
    dirigidoA: '',
    quienRecibe: 'Yael Cuevas', 
    observaciones: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      toast.error("Solo se permiten archivos PDF.");
      return;
    }

    setLoading(true);
    try {
      const optimized = await optimizePDF(selectedFile);
      const fileHash = await generateFileHash(optimized);
      
      const s1 = selectedFile.size;
      const s2 = optimized.size;

      setStats({
        original: (s1 / 1024).toFixed(1),
        optimized: (s2 / 1024).toFixed(1),
        percent: ((s1 - s2) / s1 * 100).toFixed(1)
      });

      setCustomFileName(sanitizeFileName(selectedFile.name));
      setFile(optimized);
      setHash(fileHash);
      toast.success("PDF Optimizado");
    } catch (error) {
      toast.error("Error al procesar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Selecciona un archivo.");
    
    setLoading(true);
    const toastId = toast.loading("Registrando en SACRE...");

    try {
      const data = new FormData();
      const finalName = ensurePdfExtension(customFileName);
      
      data.append('archivo', file, finalName);
      data.append('hash', hash);
      Object.keys(formData).forEach(key => data.append(key, formData[key]));

      const response = await archivosService.subirArchivo(data);

      if (response.success) {
        toast.success("Oficio guardado correctamente", { id: toastId });
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error en el servidor.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white"><Upload size={20} /></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Registro de Documentación</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Bloques de Formulario (Simplificados para lectura) */}
              <div className="space-y-5">
                <SectionHeader color="text-indigo-500" title="Información del Documento" />
                <InputGroup label="No. de Oficio" name="noOficio" value={formData.noOficio} onChange={handleInputChange} placeholder="Ej. CECAMED/JUR/2026-01" required />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Fecha Oficio" name="fechaDocumento" value={formData.fechaDocumento} onChange={handleInputChange} type="date" required />
                  <InputGroup label="Cargo Remitente" name="cargo" value={formData.cargo} onChange={handleInputChange} placeholder="Puesto" />
                </div>
                <InputGroup label="Origen / Institución" name="origen" value={formData.origen} onChange={handleInputChange} placeholder="Entidad que envía" required />
              </div>

              <div className="space-y-5">
                <SectionHeader color="text-emerald-500" title="Datos de Recepción" />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Fecha Recibido" name="fechaRecibido" value={formData.fechaRecibido} onChange={handleInputChange} type="date" />
                  <InputGroup label="Hora Recibido" name="horaRecibido" value={formData.horaRecibido} onChange={handleInputChange} type="time" />
                </div>
                <InputGroup label="A quién va dirigido" name="dirigidoA" value={formData.dirigidoA} onChange={handleInputChange} required />
                <InputGroup label="Quién recibe" name="quienRecibe" value={formData.quienRecibe} onChange={handleInputChange} />
              </div>

              {/* Zona de Archivo */}
              <div className="md:col-span-2 space-y-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase ml-1">Asunto</label>
                  <textarea required name="asunto" value={formData.asunto} onChange={handleInputChange} rows="2" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" 
                    placeholder="Descripción del trámite..." />
                </div>

                {/* Dropzone / File Editor */}
                <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center 
                  ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                  
                  {/* El truco del z-index: Si hay archivo, el input de file se va al fondo */}
                  <input type="file" accept=".pdf" onChange={handleFileChange} 
                    className={`absolute inset-0 opacity-0 cursor-pointer ${file ? '-z-10' : 'z-10'}`} 
                    disabled={loading} />
                  
                  {loading ? <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} /> : 
                   file ? <div className="bg-emerald-500 p-3 rounded-2xl text-white mb-2 shadow-lg"><FileText size={32} /></div> : 
                   <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 mb-2"><Upload size={32} /></div>}
                  
                  <div className="text-center w-full max-w-sm z-20">
                    {file ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del archivo (Editable)</p>
                        <div className="relative group">
                          <input type="text" value={customFileName}
                            onChange={(e) => setCustomFileName(sanitizeFileName(e.target.value))}
                            className="w-full text-center bg-white/80 border-2 border-emerald-500 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none shadow-sm" />
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                           <Badge color="bg-emerald-100 text-emerald-700">
                             <Zap size={10} fill="currentColor" /> {stats.percent}% más ligero
                           </Badge>
                           <button type="button" onClick={() => setFile(null)} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors">
                             <RotateCcw size={12}/> Cambiar archivo
                           </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-slate-600">Haz clic o arrastra el Oficio (PDF)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
             <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500">Cancelar</button>
             <button onClick={handleSubmit} disabled={loading || !file}
              className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 transition-all">
              {loading && <Loader2 size={18} className="animate-spin" />}
              Finalizar Registro
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Sub-componentes internos para limpiar el render principal
const SectionHeader = ({ color, title }) => (
  <h3 className={`text-[10px] font-black ${color} uppercase tracking-[0.2em] flex items-center gap-2`}>{title}</h3>
);

const InputGroup = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">{label}</label>
    <input {...props} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium" />
  </div>
);

const Badge = ({ children, color }) => (
  <div className={`flex items-center gap-2 ${color} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>
    {children}
  </div>
);

export default UploadModal;