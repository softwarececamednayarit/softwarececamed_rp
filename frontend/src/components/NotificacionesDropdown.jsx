import { useState, useEffect, useRef } from 'react';
import { getNotificacionesNoLeidas, marcarComoLeida } from '../services/notificacionesService';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificacionesDropdown() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    cargarNotificaciones();
    
    // Cerrar al hacer clic fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const res = await getNotificacionesNoLeidas();
      if (res.success) setNotificaciones(res.data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarComoLeida(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error al marcar notificación:", error);
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      
      {/* Botón de la campana */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
      >
        <Bell size={20} className={notificaciones.length > 0 ? 'animate-pulse text-indigo-400' : ''} />
        
        {/* Badge del contador */}
        {notificaciones.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full border-2 border-slate-900">
            {notificaciones.length}
          </span>
        )}
      </button>

      {/* Menú desplegable flotante (Fixed para evitar recortes del Sidebar) */}
      <div 
        className={`fixed left-72 bottom-8 w-80 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl shadow-indigo-900/10 z-[100] transition-all duration-300 origin-bottom-left
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-[1.5rem]">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell size={16} className="text-indigo-500" />
            Notificaciones
          </h3>
        </div>
        
        <div className="max-h-72 overflow-y-auto custom-scrollbar p-2">
          {notificaciones.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
              <CheckCircle size={32} className="text-emerald-400 opacity-50" />
              <p className="text-sm text-slate-500 font-medium">Todo al día</p>
            </div>
          ) : (
            notificaciones.map(notif => (
              <div key={notif.id} className="p-3 mb-2 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all group">
                <div className="text-sm text-slate-700 leading-tight font-medium mb-2">
                  {notif.mensaje}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleMarcarLeida(notif.id)}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                  >
                    Marcar como leída
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}