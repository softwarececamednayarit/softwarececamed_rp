import { useState, useEffect } from 'react';
import { AtendidosService } from '../services/atendidosService';
import { generarPDFActa, generarPDFCarnet } from '../utils/pdfGenerator';
import { X, FileText, CreditCard, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const DocumentosModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const [tipoDoc, setTipoDoc] = useState('acta'); // 'acta' | 'carnet'
  const [modoSeguimiento, setModoSeguimiento] = useState('existente'); // 'existente' | 'nuevo'
  const [nuevaNota, setNuevaNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Limpiar estados al cambiar de tipo de documento o cerrar
  useEffect(() => {
    setError('');
    setNuevaNota('');
  }, [tipoDoc, isOpen]);

  const handleProcesarYDescargar = async (e) => {
    e.preventDefault();
    setError('');

    if (tipoDoc === 'acta') {
      // --- FLUJO ACTA ---
      generarPDFActa(item);
      onClose();
    } else {
      // --- FLUJO CARNET DE SEGUIMIENTO ---
      if (modoSeguimiento === 'existente') {
        // Validación técnica: verificar si existe una nota en la raíz del expediente
        const notaExistente = item.notas_seguimiento || item.seguimiento || '';
        
        if (!notaExistente.trim()) {
          setError('¡Error! No existe ninguna nota registrada en el campo "NOTAS SEGUIMIENTO" de este expediente. Selecciona "Nuevo Seguimiento" para redactar una.');
          return;
        }

        // Descargar pasándole la nota que ya existía
        generarPDFCarnet(item, notaExistente);
        onClose();
      } else {
        // Validación técnica: el usuario quiere registrar una nota nueva en la subcolección
        if (!nuevaNota.trim()) {
          setError('Por favor, redacte el contenido del nuevo seguimiento antes de continuar.');
          return;
        }

        try {
          setLoading(true);
          
          // 1. Guardar en la subcolección de Firestore mediante el servicio del backend
          await AtendidosService.addSeguimiento(item.id, nuevaNota);
          
          // 2. Disparar el generador de PDF inyectando la nueva nota
          generarPDFCarnet(item, nuevaNota);
          
          onClose();
        } catch (err) {
          console.error(err);
          setError('Ocurrió un error al intentar guardar el nuevo seguimiento en el servidor.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Generar Documentación</h3>
            <p className="text-xs text-slate-500 mt-0.5">Expediente: <span className="font-bold text-slate-700">{item.nombre_completo || item.nombre}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <form onSubmit={handleProcesarYDescargar} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* SELECCIÓN DE TIPO DE DOCUMENTO */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">1. Tipo de Documento</label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Opción Acta */}
              <button
                type="button"
                onClick={() => setTipoDoc('acta')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all group ${
                  tipoDoc === 'acta' 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <FileText size={28} className={`mb-2 ${tipoDoc === 'acta' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className="text-sm">Acta de {item.tipo || 'Atención'}</span>
              </button>

              {/* Opción Carnet */}
              <button
                type="button"
                onClick={() => setTipoDoc('carnet')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all group ${
                  tipoDoc === 'carnet' 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold' 
                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                }`}
              >
                <CreditCard size={28} className={`mb-2 ${tipoDoc === 'carnet' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className="text-sm">Carnet de Seguimiento</span>
              </button>

            </div>
          </div>

          {/* MENSAJES DE ERROR */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-shake">
              <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* LÓGICA CONDICIONAL: SEGUIMIENTOS PARA EL CARNET */}
          {tipoDoc === 'carnet' && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">2. Origen del Seguimiento</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="modoSeguimiento" 
                      value="existente"
                      checked={modoSeguimiento === 'existente'}
                      onChange={() => setModoSeguimiento('existente')}
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Usar Nota Existente
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="modoSeguimiento" 
                      value="nuevo"
                      checked={modoSeguimiento === 'nuevo'}
                      onChange={() => setModoSeguimiento('nuevo')}
                      className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Nuevo Seguimiento (Crear Historial)
                  </label>
                </div>
              </div>

              {/* Textarea si decide redactar una nueva nota */}
              {modoSeguimiento === 'nuevo' && (
                <div className="space-y-2 animate-slide-down">
                  <label className="text-xs font-bold text-slate-600">Redactar Nota de Seguimiento Histórico:</label>
                  <textarea
                    rows={4}
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Escriba aquí las notas de evolución o acuerdos de la fecha de hoy..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              {loading ? 'Guardando...' : 'Generar PDF'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DocumentosModal;