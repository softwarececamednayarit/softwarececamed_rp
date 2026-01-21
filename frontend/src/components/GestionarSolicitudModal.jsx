import React, { useState } from 'react';
import { 
  X, Phone, Save, CheckCircle, Clock, History, FileText, 
  MapPin, Mail, Calendar, User, Hash, Building
} from 'lucide-react';

// 1. IMPORTAMOS EL HOOK DE AUTENTICACIÓN
import { useAuth } from '../context/AuthContext'; 
import solicitudesService from '../services/solicitudesService';

const GestionarSolicitudModal = ({ solicitud, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  
  // 2. OBTENEMOS EL USUARIO ACTUAL
  const { user } = useAuth(); 

  // Estado del formulario
  const [statusLlamada, setStatusLlamada] = useState(solicitud.status_llamada || 'pendiente');
  const [notas, setNotas] = useState('');
  
  // Estado para desplegar el historial
  const [showHistory, setShowHistory] = useState(false);
  
  // Estado para instrucciones
  const [instrucciones, setInstrucciones] = useState('Favor de presentarse con identificación oficial (INE) y resumen clínico.');

  if (!solicitud) return null;

  // Helper para formatear fecha en el historial
  const formatFechaHora = (fechaIso) => {
    if (!fechaIso) return 'S/F';
    return new Date(fechaIso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleSubmit = async () => {
    // Validación: Obligar a elegir un estado válido
    if (statusLlamada === 'pendiente') {
      alert("Por favor selecciona el resultado de la llamada (No Contestó o Contactado).");
      return;
    }

    setLoading(true);
    try {
      if (statusLlamada === 'contactado') {
        // CASO A: CONTACTADO -> AGENDAMOS COMO "ASESORIA" FIJO
        await solicitudesService.agendarCita(solicitud.id, {
          tipo_asignado: 'ASESORIA',
          fecha_cita: 'POR DEFINIR',
          instrucciones: instrucciones,
          datos_completos: solicitud 
        });
        
        alert("✅ Solicitud procesada como ASESORÍA.");
        onRefresh(); 
        onClose();   

      } else {
        // CASO B: NO CONTESTÓ -> REGISTRAMOS INTENTO
        
        // Obtenemos nombre del usuario (ajusta según tu objeto user)
        const nombreUsuario = user?.nombre || user?.email || 'Usuario Desconocido';

        await solicitudesService.registrarIntentoLlamada(
            solicitud.id, 
            statusLlamada, 
            notas,
            nombreUsuario // <--- ENVIAMOS EL USUARIO AL BACKEND
        );
        
        alert("⚠️ Seguimiento actualizado.");
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col md:flex-row">
        
        {/* === COLUMNA IZQUIERDA: INFORMACIÓN COMPLETA === */}
        <div className="bg-slate-50 p-6 md:w-1/2 border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          
          {/* 1. Encabezado Personal */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Datos Personales</h3>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              {solicitud.nombre} {solicitud.apellido_paterno} {solicitud.apellido_materno}
            </h2>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {solicitud.edad && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600">
                  <User size={12} /> {solicitud.edad} años
                </span>
              )}
              {solicitud.sexo && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  {solicitud.sexo}
                </span>
              )}
              {solicitud.curp && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 font-mono">
                  <Hash size={12} /> {solicitud.curp}
                </span>
              )}
            </div>
          </div>

          {/* 2. Datos de Contacto */}
          <div className="mb-6 space-y-3">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Contacto</h3>
             
             {/* Teléfonos */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-3">
                  <div className="bg-indigo-100 p-1.5 rounded text-indigo-600"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Celular</p>
                    <p className="font-bold text-slate-700">{solicitud.telefonoCel || solicitud.telefono || '---'}</p>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-3">
                  <div className="bg-slate-100 p-1.5 rounded text-slate-500"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Fijo</p>
                    <p className="font-bold text-slate-700">{solicitud.telefonoFijo || '---'}</p>
                  </div>
                </div>
             </div>

             {/* Correo */}
             <div className="flex items-start gap-3 text-sm text-slate-600">
                <Mail size={16} className="mt-0.5 text-slate-400" />
                <span className="break-all">{solicitud.correoElectronico || 'Sin correo registrado'}</span>
             </div>

             {/* Domicilio */}
             <div className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin size={16} className="mt-0.5 text-slate-400" />
                <span>{solicitud.domicilio || 'Sin domicilio registrado'}</span>
             </div>
          </div>

          {/* 3. Detalles del Incidente */}
          <div className="mb-6 space-y-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider border-t border-slate-200 pt-4 mb-2">
              Detalles del Incidente
            </h3>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Calendar size={16} className="text-red-500" />
              <span>Fecha del incidente: {solicitud.fecha_incidente || 'No especificada'}</span>
            </div>

            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
               <div className="flex items-start gap-2 mb-2">
                  <Building size={16} className="text-slate-500 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Lugar de Atención / Médico</p>
                    <p className="font-bold text-slate-800">{solicitud.medico_nombre || 'No especificado'}</p>
                  </div>
               </div>
               {solicitud.medico_domicilio && (
                 <p className="text-xs text-slate-500 ml-6 pl-1 border-l-2 border-slate-300">
                   {solicitud.medico_domicilio}
                 </p>
               )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">Descripción de los hechos</p>
              <div className="bg-white p-3 rounded border border-slate-200 text-slate-600 italic text-sm max-h-32 overflow-y-auto">
                {solicitud.descripcion_hechos || 'Sin descripción'}
              </div>
            </div>
          </div>

          {/* 4. Historial de Intentos (Dinámico y Desplegable) */}
          <div className="mt-auto pt-4 border-t border-slate-200">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-3 group"
            >
              <div className="flex items-center gap-2">
                <History size={14} className="group-hover:rotate-45 transition-transform"/> 
                {showHistory ? 'Ocultar Historial' : 'Ver Historial de Intentos'} 
                <span className="bg-slate-100 text-slate-500 px-1.5 rounded-full text-[10px]">
                  {solicitud.intentos?.length || 0}
                </span>
              </div>
            </button>

            {/* Lista Desplegable */}
            {showHistory && (
              <div className="space-y-3 pr-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                
                {(!solicitud.intentos || solicitud.intentos.length === 0) && (
                  <p className="text-center text-slate-400 text-xs italic py-2">
                    Aún no hay intentos registrados.
                  </p>
                )}

                {solicitud.intentos?.map((intento, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    {/* Header de la tarjeta */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {formatFechaHora(intento.fecha)}
                        </span>
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                          <User size={10} className="text-indigo-400"/>
                          {intento.usuario || 'Usuario desconocido'}
                        </span>
                      </div>
                      
                      {/* Badge del resultado */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        intento.status === 'contactado' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {intento.status === 'no_contesto' ? 'No Contestó' : intento.status}
                      </span>
                    </div>

                    {/* Nota del intento */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{intento.notas || 'Sin notas'}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === COLUMNA DERECHA: GESTIÓN === */}
        <div className="p-6 md:w-1/2 flex flex-col bg-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Phone className="text-indigo-600" /> Gestión Telefónica
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
          </div>

          {/* BOTONES DE ESTATUS (Sin 'Pendiente') */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3">¿Se logró contactar al ciudadano?</label>
            <div className="grid grid-cols-2 gap-4">
              {['no_contesto', 'contactado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setStatusLlamada(estado)}
                  className={`py-4 px-4 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                    statusLlamada === estado 
                      ? estado === 'contactado' 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                   {estado === 'contactado' ? <CheckCircle size={24}/> : <Phone size={24} className="rotate-135"/>}
                   {estado === 'no_contesto' ? 'NO CONTESTÓ' : 'CONTACTADO'}
                </button>
              ))}
            </div>
          </div>

          {/* LÓGICA CONDICIONAL */}
          {statusLlamada === 'contactado' ? (
            <div className="flex-1 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-green-50 border border-green-200 p-5 rounded-2xl shadow-sm">
                <h4 className="text-green-800 font-bold flex items-center gap-2 mb-4 border-b border-green-200 pb-2">
                  <CheckCircle size={18} /> Asignar Cita
                </h4>
                
                {/* TIPO AUTOMÁTICO */}
                <div className="mb-4 flex items-center justify-between bg-white/80 p-3 rounded-lg border border-green-100">
                  <div>
                    <label className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Tipo de Atención</label>
                    <span className="font-black text-green-900 text-lg">ASESORÍA</span>
                  </div>
                  <span className="bg-green-200 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold">AUTOMÁTICO</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-green-700 mb-1 block">Instrucciones para el ciudadano</label>
                  <textarea 
                    className="w-full p-3 rounded-lg border border-green-300 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    value={instrucciones}
                    onChange={(e) => setInstrucciones(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            // SI NO CONTESTÓ (O ESTÁ EN BLANCO AÚN), SOLO NOTAS
            <div className={`flex-1 transition-opacity ${statusLlamada === 'pendiente' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                 <span className="flex items-center gap-2"><FileText size={16}/> Nota del intento</span>
              </label>
              <textarea 
                className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-40 resize-none text-slate-700"
                placeholder={statusLlamada === 'pendiente' ? 'Selecciona una opción arriba primero...' : "Ej. Buzón de voz, número equivocado, línea ocupada..."}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                disabled={statusLlamada === 'pendiente'}
              />
            </div>
          )}

          {/* FOOTER BOTONES */}
          <div className="mt-6 pt-4 border-t flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors">
              Cancelar
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={loading || statusLlamada === 'pendiente'}
              className={`px-8 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg transition-all ${
                statusLlamada === 'contactado' 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-200 hover:shadow-green-300' 
                  : statusLlamada === 'no_contesto'
                    ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'
                    : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {loading ? <Clock className="animate-spin" size={18}/> : <Save size={18} />}
              {statusLlamada === 'contactado' ? 'Finalizar Solicitud' : 'Guardar Intento'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GestionarSolicitudModal;