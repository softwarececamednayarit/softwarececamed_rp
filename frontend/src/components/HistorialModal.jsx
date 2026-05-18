import { useState, useEffect } from 'react';
import { getHistorialArchivo, agregarHistorialManual } from '../services/archivosService';
import { Clock, Plus, X } from 'lucide-react';

export default function HistorialModal({ isOpen, onClose, archivoId, nombreArchivo }) {
  const [historial, setHistorial] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Controlar la animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setMostrarModal(true);
      if (archivoId) cargarHistorial();
    } else {
      setTimeout(() => setMostrarModal(false), 300); // Dar tiempo a la animación de salida
    }
  }, [isOpen, archivoId]);

  const cargarHistorial = async () => {
    try {
      const res = await getHistorialArchivo(archivoId);
      if (res.success) setHistorial(res.data);
    } catch (error) {
      console.error("Error al cargar historial", error);
    }
  };

  const handleAgregarManual = async (e) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim()) return;

    setCargando(true);
    try {
      const res = await agregarHistorialManual(archivoId, nuevaDescripcion);
      if (res.success) {
        setNuevaDescripcion('');
        await cargarHistorial();
      }
    } catch (error) {
      console.error("Error al agregar registro", error);
    } finally {
      setCargando(false);
    }
  };

  if (!mostrarModal && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-slate-900/20 backdrop-blur-md opacity-100' : 'bg-transparent backdrop-blur-none opacity-0 pointer-events-none'}`}>
      
      <div className={`bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 w-full max-w-2xl flex flex-col max-h-[85vh] transition-all duration-300 transform border border-slate-100 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        
        {/* Encabezado */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-[2.5rem]">
          <div>
            <div className="flex items-center gap-3 text-indigo-600 mb-1">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-50">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Línea de Tiempo</h2>
            </div>
            <p className="text-sm font-medium text-slate-500 truncate max-w-md">{nombreArchivo}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Lista de Historial tipo Timeline */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white">
          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <Clock size={40} className="opacity-20" />
              <p className="text-sm font-medium">No hay registros previos en este archivo.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-2">
              {historial.map((item, index) => {
                const esManual = item.accion === 'REGISTRO_MANUAL';
                return (
                  <div key={item.id || index} className="relative pl-6 group">
                    {/* Punto en la línea */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors duration-300 ${esManual ? 'bg-indigo-400 group-hover:bg-indigo-600' : 'bg-emerald-400 group-hover:bg-emerald-600'}`} />
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${esManual ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {item.accion.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(item.fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 inline-block w-full">
                      {item.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-[2.5rem]">
          <form onSubmit={handleAgregarManual} className="flex gap-3">
            <input
              type="text"
              placeholder="Añadir una nota al historial..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-400"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              disabled={cargando}
            />
            <button
              type="submit"
              disabled={cargando || !nuevaDescripcion.trim()}
              className="px-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{cargando ? 'Guardando...' : 'Añadir'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}