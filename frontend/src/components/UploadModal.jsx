import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Loader2, Zap, RotateCcw, Save } from 'lucide-react';
import { optimizePDF, generateFileHash } from '../utils/pdfOptimizer';
import { sanitizeFileName, ensurePdfExtension } from '../utils/fileUtils';
import { toast } from 'react-hot-toast';
import archivosService from '../services/archivosService';

// --- SUB-COMPONENTES (Definidos arriba para evitar ReferenceError) ---
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

// --- COMPONENTE PRINCIPAL ---
const UploadModal = ({ isOpen, onClose, archivoParaEditar = null }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [hash, setHash] = useState('');
  const [stats, setStats] = useState({ original: 0, optimized: 0, percent: 0 });

  const isEditing = !!archivoParaEditar;

  const [formData, setFormData] = useState({
    noOficio: '',
    fechaDocumento: '',
    origen: '',
    cargo: '',
    fechaRecibido: '',
    horaRecibido: '',
    asunto: '',
    dirigidoA: '',
    quienRecibe: '', 
    observaciones: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (archivoParaEditar) {
        // IMPORTANTE: Los inputs type="date" solo aceptan formato YYYY-MM-DD
        setFormData({
          noOficio: archivoParaEditar.noOficio || '',
          fechaDocumento: archivoParaEditar.fechaDocumento?.split('T')[0] || '',
          origen: archivoParaEditar.origen || '',
          cargo: archivoParaEditar.cargo || '',
          fechaRecibido: archivoParaEditar.fechaRecibido?.split('T')[0] || '',
          horaRecibido: archivoParaEditar.horaRecibido || '',
          asunto: archivoParaEditar.asunto || '',
          dirigidoA: archivoParaEditar.dirigidoA || '',
          quienRecibe: archivoParaEditar.quienRecibe || '',
          observaciones: archivoParaEditar.observaciones || ''
        });
        setCustomFileName(archivoParaEditar.nombreOriginal || '');
      } else {
        setFormData({
          noOficio: '',
          fechaDocumento: '',
          origen: '',
          cargo: '',
          fechaRecibido: new Date().toISOString().split('T')[0],
          horaRecibido: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          asunto: '',
          dirigidoA: '',
          quienRecibe: '', 
          observaciones: ''
        });
        setFile(null);
        setCustomFileName('');
      }
    }
  }, [isOpen, archivoParaEditar]);

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
    if (!isEditing && !file) return toast.error("Selecciona un archivo.");
    
    setLoading(true);
    const toastId = toast.loading(isEditing ? "Actualizando expediente..." : "Registrando en SACRE...");

    try {
      if (isEditing) {
        const updateData = {
          ...formData,
          nombreOriginal: ensurePdfExtension(customFileName)
        };
        const response = await archivosService.actualizarArchivo(archivoParaEditar.id, updateData);
        if (response.success) {
          toast.success("Expediente actualizado", { id: toastId });
          onClose();
        }
      } else {
        const data = new FormData();
        const finalName = ensurePdfExtension(customFileName);
        data.append('archivo', file, finalName);
        data.append('hash', hash);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        const response = await archivosService.subirArchivo(data);
        if (response.success) {
          toast.success("Oficio guardado", { id: toastId });
          onClose();
        }
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
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${isEditing ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {isEditing ? <FileText size={20} /> : <Upload size={20} />}
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isEditing ? 'Editar Expediente' : 'Registro de Documentación'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <InputGroup label="Quién recibe" name="quienRecibe" value={formData.quienRecibe} onChange={handleInputChange} placeholder="Nombre de quien recibe" />
              </div>

              <div className="md:col-span-2 space-y-6 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase ml-1">Asunto</label>
                  <textarea required name="asunto" value={formData.asunto} onChange={handleInputChange} rows="2" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all" 
                    placeholder="Descripción del trámite..." />
                </div>

                {!isEditing || file ? (
                  <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center 
                    ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className={`absolute inset-0 opacity-0 cursor-pointer ${file ? '-z-10' : 'z-10'}`} disabled={loading} />
                    {loading ? <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} /> : 
                     file ? <div className="bg-emerald-500 p-3 rounded-2xl text-white mb-2 shadow-lg"><FileText size={32} /></div> : 
                     <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 mb-2"><Upload size={32} /></div>}
                    <div className="text-center w-full max-w-sm z-20">
                      {file ? (
                        <div className="space-y-3">
                          <input type="text" value={customFileName} onChange={(e) => setCustomFileName(sanitizeFileName(e.target.value))} className="w-full text-center bg-white/80 border-2 border-emerald-500 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none shadow-sm" />
                          <div className="flex flex-wrap justify-center gap-2 mt-3">
                             <Badge color="bg-emerald-100 text-emerald-700"><Zap size={10} fill="currentColor" /> {stats.percent}% más ligero</Badge>
                             <button type="button" onClick={() => setFile(null)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"><RotateCcw size={12}/> Cambiar archivo</button>
                          </div>
                        </div>
                      ) : ( <p className="text-sm font-bold text-slate-600">Haz clic o arrastra el Oficio (PDF)</p> )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nombre del expediente en Drive</p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-indigo-600 shadow-sm"><FileText size={24} /></div>
                      <input type="text" value={customFileName} onChange={(e) => setCustomFileName(sanitizeFileName(e.target.value))} className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" />
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <InputGroup label="Observaciones" name="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Notas adicionales..." />
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-4">
             <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500">Cancelar</button>
             <button onClick={handleSubmit} disabled={loading || (!isEditing && !file)}
              className={`${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-indigo-600'} text-white px-10 py-3 rounded-2xl font-bold disabled:opacity-50 flex items-center gap-2 transition-all`}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Save size={18}/> : null}
              {isEditing ? 'Guardar Cambios' : 'Finalizar Registro'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadModal;