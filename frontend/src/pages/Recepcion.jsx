import React, { useEffect, useState } from 'react';
import solicitudesService from '../services/solicitudesService'; // Usamos el servicio
import GestionarSolicitudModal from '../components/GestionarSolicitudModal';
import { Phone, Trash2, RefreshCw, User, ArchiveRestore, CheckCircle, Calendar, AlertCircle } from 'lucide-react';

const Recepcion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pendiente'); // 'pendiente' | 'agendado' | 'descartado'
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Cargar datos usando el servicio
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await solicitudesService.getPorStatus(activeTab);
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      // alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  // Manejadores de acciones
  const handleDescartar = async (id) => {
    const motivo = prompt("¿Por qué deseas descartar esta solicitud? (Opcional):");
    if (motivo === null) return; 

    try {
      await solicitudesService.descartarSolicitud(id, motivo);
      cargarDatos(); 
    } catch (error) {
      alert("Error al descartar");
    }
  };

  const handleRecuperar = async (id) => {
    if (!confirm("¿Recuperar esta solicitud a la bandeja de entrada?")) return;
    try {
      await solicitudesService.recuperarSolicitud(id);
      cargarDatos();
    } catch (error) {
      alert("Error al recuperar");
    }
  };

  // Helper para estilos de badges
  const getBadgeStyle = (status) => {
    const styles = {
      'no_contesto': 'bg-amber-100 text-amber-700',
      'contactado': 'bg-emerald-100 text-emerald-700',
      'pendiente': 'bg-blue-100 text-blue-700',
      'descartado': 'bg-rose-100 text-rose-700',
      'agendado': 'bg-purple-100 text-purple-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      
      {/* --- HEADER (Tu diseño original mantenido) --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
             Recepción y Triaje
          </h1>
          <p className="text-slate-500 text-lg font-medium">
             Gestión de solicitudes web y asignación de citas.
          </p>
        </div>
        
        {/* Botón refrescar */}
        <button onClick={cargarDatos} className="p-2 bg-white border rounded-full hover:bg-slate-100 text-slate-500 shadow-sm">
           <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- PESTAÑAS DE NAVEGACIÓN --- */}
      <div className="flex gap-1 mb-8 bg-slate-200/50 p-1 rounded-xl w-fit">
        {['pendiente', 'agendado', 'descartado'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === tab 
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {tab === 'pendiente' && '📥 Pendientes'}
            {tab === 'agendado' && '✅ En Excel'}
            {tab === 'descartado' && '🗑️ Papelera'}
          </button>
        ))}
      </div>

      {/* --- GRID DE TARJETAS --- */}
      {solicitudes.length === 0 && !loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 font-medium">No hay solicitudes en esta sección 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {solicitudes.map((sol) => (
            <div 
              key={sol.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col relative transition-all ${
                sol.status === 'descartado' ? 'opacity-80 bg-slate-50/50 grayscale-[0.5]' : 'hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(sol.fecha_recepcion).toLocaleDateString()}
                </span>
                
                {/* Status Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getBadgeStyle(sol.status === 'pendiente' ? sol.status_llamada : sol.status)}`}>
                  {sol.status === 'pendiente' ? (sol.status_llamada?.replace('_', ' ') || 'NUEVO') : sol.status}
                </span>
              </div>

              {/* Info Personal */}
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-500">
                   <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-none mb-1.5">
                    {sol.nombre} {sol.apellido_paterno} {sol.apellido_materno}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">
                    <Phone size={12} className="text-indigo-500" /> {sol.telefono}
                  </div>
                </div>
              </div>

              {/* Cuerpo (Hechos o Motivo) */}
              <div className="flex-1 bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-sm">
                {sol.status === 'descartado' ? (
                   <p className="text-rose-600 font-medium italic">
                     <span className="font-bold not-italic text-xs block text-rose-400 uppercase mb-1">Motivo de descarte:</span> 
                     {sol.motivo_descarte || 'Sin especificar'}
                   </p>
                ) : sol.status === 'agendado' ? (
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-400 uppercase">Cita Programada:</p>
                     <p className="font-medium text-slate-700">{sol.cita_programada}</p>
                     <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded w-fit mt-2">{sol.tipo_asignado}</p>
                   </div>
                ) : (
                   <p className="text-slate-600 italic line-clamp-3">"{sol.descripcion_hechos}"</p>
                )}
              </div>

              {/* Alerta Intentos (Solo en pendientes) */}
              {activeTab === 'pendiente' && sol.intentos_llamada > 0 && (
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <AlertCircle size={14} />
                  {sol.intentos_llamada} intento(s) sin éxito.
                </div>
              )}

              {/* BOTONES DE ACCIÓN */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                
                {/* CASO: PENDIENTE */}
                {activeTab === 'pendiente' && (
                  <>
                    <button 
                      onClick={() => handleDescartar(sol.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Descartar a papelera"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => setSolicitudSeleccionada(sol)}
                      className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-600 transition-all shadow-md shadow-slate-200"
                    >
                      Gestionar
                    </button>
                  </>
                )}

                {/* CASO: DESCARTADO */}
                {activeTab === 'descartado' && (
                  <button 
                    onClick={() => handleRecuperar(sol.id)}
                    className="w-full flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    <ArchiveRestore size={16} /> Restaurar a Pendientes
                  </button>
                )}

                {/* CASO: AGENDADO */}
                {activeTab === 'agendado' && (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold text-center border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Sincronizado con Excel
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {solicitudSeleccionada && (
        <GestionarSolicitudModal 
          solicitud={solicitudSeleccionada}
          onClose={() => setSolicitudSeleccionada(null)}
          onRefresh={cargarDatos}
        />
      )}

    </div>
  );
};

export default Recepcion;