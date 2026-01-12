import React, { useState } from 'react';
import { X, Phone, Save, CheckCircle, Clock } from 'lucide-react';
import solicitudesService from '../services/solicitudesService';

const GestionarSolicitudModal = ({ solicitud, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [statusLlamada, setStatusLlamada] = useState(solicitud.status_llamada || 'pendiente');
  const [notas, setNotas] = useState('');
  
  // Estado para agendar (solo si contestó)
  const [tipoAsignado, setTipoAsignado] = useState('');
  // Eliminamos fechaCita del estado
  const [instrucciones, setInstrucciones] = useState('Favor de presentarse con identificación oficial (INE) y resumen clínico.');

  if (!solicitud) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (statusLlamada === 'contactado') {
        // CASO A: SI CONTESTÓ -> AGENDAMOS
        // VALIDACIÓN: Solo exigimos el TIPO, la fecha ya no importa.
        if (!tipoAsignado) {
          alert("Debes asignar un TIPO DE ATENCIÓN para finalizar.");
          setLoading(false);
          return;
        }

        await solicitudesService.agendarCita(solicitud.id, {
          tipo_asignado: tipoAsignado,
          fecha_cita: 'POR DEFINIR', // Enviamos valor por defecto o vacío al backend
          instrucciones: instrucciones,
          datos_completos: solicitud 
        });
        
        alert("✅ Solicitud procesada y enviada a Excel.");
        onRefresh(); 
        onClose();   

      } else {
        // CASO B: NO CONTESTÓ -> SOLO REGISTRAMOS INTENTO
        await solicitudesService.registrarIntentoLlamada(
            solicitud.id, 
            statusLlamada, 
            notas
        );
        
        alert("⚠️ Seguimiento actualizado.");
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("❌ ERROR:", error);
      if (error.response) {
        alert(`Error del Servidor: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN (Solo Lectura) */}
        <div className="bg-slate-50 p-6 md:w-1/3 border-r border-slate-200">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Datos del Solicitante</h3>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">{solicitud.nombre} {solicitud.apellido_paterno} {solicitud.apellido_materno}</h2>
            <div className="flex items-center gap-2 mt-2 text-indigo-700 font-mono text-lg font-bold bg-indigo-50 p-2 rounded-lg border border-indigo-100">
              <Phone size={20} /> {solicitud.telefono}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-400 text-xs font-bold">Hechos Reportados</label>
              <div className="bg-white p-3 rounded border border-slate-200 text-slate-600 italic max-h-40 overflow-y-auto">
                {solicitud.descripcion_hechos}
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 text-xs font-bold">Contra quién</label>
              <p className="text-slate-700 font-medium">{solicitud.medico_nombre || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: GESTIÓN (Formulario) */}
        <div className="p-6 md:w-2/3 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Phone className="text-indigo-600" /> Gestión Telefónica
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
          </div>

          {/* 1. ¿Qué pasó con la llamada? */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Resultado de la llamada</label>
            <div className="grid grid-cols-3 gap-3">
              {['pendiente', 'no_contesto', 'contactado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setStatusLlamada(estado)}
                  className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                    statusLlamada === estado 
                      ? estado === 'contactado' 
                        ? 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-500/20' 
                        : 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {estado.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* LÓGICA CONDICIONAL: SI CONTESTÓ, MOSTRAMOS LA AGENDA */}
          {statusLlamada === 'contactado' ? (
            <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <h4 className="text-green-800 font-bold flex items-center gap-2 mb-3">
                  <CheckCircle size={18} /> Asignar y Finalizar
                </h4>
                
                {/* AHORA ES SOLO UNA COLUMNA GRANDE */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-green-700">Tipo de Atención Asignada</label>
                  <select 
                    className="w-full mt-1 p-3 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    value={tipoAsignado}
                    onChange={(e) => setTipoAsignado(e.target.value)}
                  >
                    <option value="">-- Seleccionar Tipo --</option>
                    <option value="ASESORIA INMEDIATA">🔴 ASESORÍA INMEDIATA</option>
                    <option value="ORIENTACION">🟠 ORIENTACIÓN</option>
                    <option value="ASESORIA">🟡 ASESORÍA</option>
                    <option value="GESTION">🟢 GESTIÓN</option>
                    <option value="QUEJA">🔴 QUEJA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-green-700">Instrucciones / Notas para Empleado</label>
                  <textarea 
                    className="w-full mt-1 p-3 rounded border border-green-300 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej. Se le pidió traer resumen clínico. Atenderá el Lic. Pérez."
                    value={instrucciones}
                    onChange={(e) => setInstrucciones(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            // SI NO CONTESTÓ, SOLO NOTAS
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Notas del intento (Opcional)</label>
              <textarea 
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej. Buzón de voz, número equivocado..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          )}

          {/* FOOTER BOTONES */}
          <div className="mt-6 pt-4 border-t flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium">
              Cancelar
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-bold flex items-center gap-2 shadow-lg transition-all ${
                statusLlamada === 'contactado' 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'
              }`}
            >
              {loading ? <Clock className="animate-spin" /> : <Save size={18} />}
              {statusLlamada === 'contactado' ? 'Finalizar y Enviar' : 'Guardar Intento'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GestionarSolicitudModal;