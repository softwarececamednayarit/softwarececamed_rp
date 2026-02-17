import React, { useEffect, useState } from 'react';
import solicitudesService from '../services/solicitudesService'; 
import GestionarSolicitudModal from '../components/GestionarSolicitudModal';
import { Phone, Trash2, RefreshCw, User, ArchiveRestore, CheckCircle, Calendar, AlertCircle, BookOpen, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Recepcion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pendiente'); 
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await solicitudesService.getPorStatus(activeTab);
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las solicitudes. Revisa tu conexión."); // <--- AVISO VISUAL
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const handleDescartar = async (id) => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      title: '¿Descartar solicitud?',
      text: "Ingresa el motivo del descarte (opcional):",
      input: 'text',
      inputPlaceholder: 'Ej: Datos incompletos, duplicado...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar descarte',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      inputAttributes: {
        autocapitalize: 'off'
      },
      customClass: {
        popup: 'rounded-3xl'
      }
    });

    // Si el usuario canceló, no hacemos nada
    if (!isConfirmed) return; 

    try {
      await solicitudesService.descartarSolicitud(id, motivo);
      toast.success("Solicitud enviada a la papelera."); // Mejoramos el mensaje
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      toast.error("Error al descartar la solicitud.");
    }
  };

  const handleRecuperar = async (id) => {
    // 1. Sustituimos el confirm nativo por Swal
    const result = await Swal.fire({
      title: '¿Recuperar solicitud?',
      text: "¿Deseas enviar esta solicitud de vuelta a la bandeja de entrada?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5', // Indigo
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, recuperar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl'
      }
    });

    // 2. Si no confirma, detenemos
    if (!result.isConfirmed) return;

    try {
      await solicitudesService.recuperarSolicitud(id);
      
      // Añadimos un toast de éxito para confirmar la acción
      toast.success("Solicitud recuperada correctamente.");
      
      cargarDatos();
    } catch (error) {
      console.error("Error al recuperar:", error);
      toast.error("Error al intentar recuperar la solicitud.");
    }
  };

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
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* --- HEADER TIPO TARJETA --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Inbox size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Recepción y Triaje
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-indigo-500'}`}></span>
              <p className="text-slate-500 font-medium text-sm">
                Gestión de solicitudes web y asignación de citas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={cargarDatos} 
              disabled={loading} 
              className="group flex items-center justify-center gap-2.5 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw 
                size={18} 
                className={`transition-transform group-hover:rotate-180 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} 
              />
              <span className="hidden sm:inline">{loading ? 'Cargando...' : 'Actualizar'}</span>
            </button>
          </div>
        </header>

        {/* --- PESTAÑAS DE NAVEGACIÓN --- */}
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl w-full sm:w-fit shadow-sm overflow-x-auto">
          {[
            { id: 'pendiente', label: '📥 Pendientes' },
            { id: 'agendado', label: '✅ En Excel / Agendados' },
            { id: 'descartado', label: '🗑️ Papelera' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 sm:flex-none
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- GRID DE TARJETAS --- */}
        {solicitudes.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Inbox size={40} className="opacity-50" />
            </div>
            <p className="font-bold text-lg">No hay solicitudes en esta sección</p>
            <p className="text-sm">Las nuevas solicitudes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {solicitudes.map((sol) => (
              <div 
                key={sol.id} 
                className={`
                  bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col relative transition-all group
                  ${sol.status === 'descartado' ? 'opacity-70 bg-slate-50 grayscale-[0.8]' : 'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-indigo-100'}
                `}
              >
                
                {/* Header Card */}
                <div className="flex justify-between items-start mb-5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                    <Calendar size={12} />
                    {new Date(sol.fecha_recepcion).toLocaleDateString()}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getBadgeStyle(sol.status === 'pendiente' ? sol.status_llamada : sol.status)}`}>
                    {sol.status === 'pendiente' ? (sol.status_llamada?.replace('_', ' ') || 'NUEVO') : sol.status}
                  </span>
                </div>

                {/* Info Personal */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     <User size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1 truncate" title={`${sol.nombre} ${sol.apellido_paterno} ${sol.apellido_materno}`}>
                      {sol.nombre} {sol.apellido_paterno} {sol.apellido_materno}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                        {sol.sexo}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mt-2">
                      <Phone size={12} className="text-indigo-500" /> {sol.telefonoCel}
                    </div>
                  </div>
                </div>

                {/* Cuerpo (Hechos o Motivo) */}
                <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 text-sm">
                  {sol.status === 'descartado' ? (
                     <div className="flex flex-col h-full justify-center">
                        <span className="text-[10px] font-black text-rose-400 uppercase mb-1">Motivo de descarte</span>
                        <p className="text-rose-700 font-medium italic">"{sol.motivo_descarte || 'Sin especificar'}"</p>
                     </div>
                  ) : sol.status === 'agendado' ? (
                     <div className="space-y-2">
                       <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">Cita Programada</p>
                           <p className="font-bold text-slate-700">{sol.cita_programada}</p>
                       </div>
                       <div className="pt-2 border-t border-slate-200/60">
                           <p className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                <CheckCircle size={12}/> {sol.tipo_asignado}
                           </p>
                       </div>
                     </div>
                  ) : (
                     <p className="text-slate-600 italic line-clamp-3 text-xs leading-relaxed">
                        "{sol.descripcion_hechos || 'Sin descripción capturada'}"
                     </p>
                  )}
                </div>

                {/* Alerta Intentos (Solo en pendientes) */}
                {activeTab === 'pendiente' && sol.intentos_llamada > 0 && (
                  <div className="mb-5 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                    <AlertCircle size={14} />
                    {sol.intentos_llamada} intento(s) sin éxito.
                  </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-auto flex gap-3">
                  
                  {activeTab === 'pendiente' && (
                    <>
                      <button 
                        onClick={() => handleDescartar(sol.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                        title="Descartar a papelera"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={() => setSolicitudSeleccionada(sol)}
                        className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
                      >
                        Gestionar Solicitud
                      </button>
                    </>
                  )}

                  {activeTab === 'descartado' && (
                    <button 
                      onClick={() => handleRecuperar(sol.id)}
                      className="w-full flex justify-center items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
                    >
                      <ArchiveRestore size={18} /> Restaurar a Pendientes
                    </button>
                  )}

                  {activeTab === 'agendado' && (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold text-center border border-emerald-100 flex items-center justify-center gap-2">
                      <CheckCircle size={16} /> Procesado Correctamente
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
    </div>
  );
};

export default Recepcion;