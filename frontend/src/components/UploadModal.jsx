import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, FileText, Clock, 
  Loader2, Zap 
} from 'lucide-react';
import { optimizePDF, generateFileHash } from '../utils/pdfOptimizer';
import { toast } from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  
  // Estados para la comparativa de peso
  const [stats, setStats] = useState({ original: 0, optimized: 0, percent: 0 });

  const inputStyles = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium";

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
      
      // Cálculo de reducción
      const s1 = selectedFile.size;
      const s2 = optimized.size;
      const reduction = ((s1 - s2) / s1 * 100).toFixed(1);

      setStats({
        original: (s1 / 1024).toFixed(1),
        optimized: (s2 / 1024).toFixed(1),
        percent: reduction
      });

      setFile(optimized);
      setHash(fileHash);
      toast.success(`Reducción del ${reduction}% lograda`);
    } catch (error) {
      toast.error("Error al procesar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Debes seleccionar un archivo.");
    setLoading(true);
    const toastId = toast.loading("Registrando documento...");
    try {
      const payload = { ...formData, hash, fechaRegistroInterno: new Date().toISOString() };
      console.log("Enviando al SACRE:", payload);
      setTimeout(() => {
        toast.success("Oficio registrado correctamente", { id: toastId });
        onClose();
      }, 1500);
    } catch (error) {
      toast.error("Error en la subida.", { id: toastId });
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
          className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white"><Upload size={20} /></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Registro de Documentación</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* COLUMNA 1 */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">Información del Documento</h3>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">No. de Oficio</label>
                  <input required name="noOficio" value={formData.noOficio} onChange={handleInputChange} type="text" placeholder="Ej. CECAMED/JUR/2026-01" className={inputStyles} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Fecha Oficio</label>
                    <input required name="fechaDocumento" value={formData.fechaDocumento} onChange={handleInputChange} type="date" className={inputStyles} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Cargo Remitente</label>
                    <input name="cargo" value={formData.cargo} onChange={handleInputChange} type="text" placeholder="Puesto" className={inputStyles} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Origen / Institución</label>
                  <input required name="origen" value={formData.origen} onChange={handleInputChange} type="text" placeholder="Entidad que envía" className={inputStyles} />
                </div>
              </div>

              {/* COLUMNA 2 */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">Datos de Recepción</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Fecha Recibido</label>
                    <input name="fechaRecibido" value={formData.fechaRecibido} onChange={handleInputChange} type="date" className={inputStyles} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Hora Recibido</label>
                    <input name="horaRecibido" value={formData.horaRecibido} onChange={handleInputChange} type="time" className={inputStyles} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">A quién va dirigido</label>
                  <input required name="dirigidoA" value={formData.dirigidoA} onChange={handleInputChange} type="text" className={inputStyles} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Quién recibe</label>
                  <input name="quienRecibe" value={formData.quienRecibe} onChange={handleInputChange} type="text" className={inputStyles} />
                </div>
              </div>

              {/* SECCIÓN ASUNTO Y ARCHIVO */}
              <div className="md:col-span-2 space-y-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Asunto</label>
                  <textarea required name="asunto" value={formData.asunto} onChange={handleInputChange} rows="2" className={inputStyles} placeholder="Descripción del trámite..."></textarea>
                </div>

                <div className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  
                  {loading ? <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} /> : 
                   file ? <div className="bg-emerald-500 p-3 rounded-2xl text-white mb-2 shadow-lg shadow-emerald-200"><FileText size={32} /></div> : 
                   <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 mb-2"><Upload size={32} /></div>}
                  
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-600">{file ? file.name : "Adjuntar Oficio (PDF)"}</p>
                    
                    {/* VISUALIZACIÓN DE REDUCCIÓN */}
                    {file && (
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <Zap size={12} fill="currentColor" />
                          ¡Optimizado al {stats.percent}%!
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          De <span className="line-through">{stats.original} KB</span> a <span className="text-slate-600 font-bold">{stats.optimized} KB</span>
                        </p>
                        <p className="text-[8px] text-slate-300 font-mono mt-1">HASH: {hash.substring(0, 32)}...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Observaciones</label>
                  <input name="observaciones" value={formData.observaciones} onChange={handleInputChange} type="text" className={inputStyles} />
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase mr-auto ml-2">Registro: {new Date().toLocaleDateString()}</span>
            <button onClick={onClose} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading || !file}
              className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              Finalizar Registro
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadModal;