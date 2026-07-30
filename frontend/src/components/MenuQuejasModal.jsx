import React from 'react';
import { 
  X, 
  FileText, 
  Scale, 
  FileCheck, 
  FileX, 
  Inbox, 
  Handshake, 
  ShieldAlert, 
  FileClock, 
  CalendarDays 
} from 'lucide-react';

const MenuQuejasModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onOpenDocumentos, 
  onOpenAudiencia, 
  onOpenRecepcion, 
  onOpenNoSujecion, 
  onOpenDeclaracionVoluntad, 
  onOpenAudienciaConciliacion, 
  onOpenAcuerdoSenalamiento, 
  onOpenAudienciaNoConciliada, 
  onOpenDiferimientoAudiencia 
}) => {
  if (!isOpen) return null;

  const handleAction = (action) => {
    action(item);
    onClose(); 
  };

  // 1. Arreglo de configuración (Fácil de mantener y escalar)
  const menuOptions = [
    {
      id: 1,
      title: 'Acta de Queja',
      description: 'Documento principal que formaliza el inicio del procedimiento ante la comisión.',
      icon: FileText,
      action: onOpenDocumentos
    },
    {
      id: 2,
      title: 'Notificación Audiencia',
      description: 'Oficio que invita al prestador médico a conocer la queja y decidir su participación.',
      icon: Scale,
      action: onOpenAudiencia
    },
    {
      id: 3,
      title: 'Recepción Contestación',
      description: 'Acuerdo que hace constar la entrada oficial del escrito de defensa a oficialía.',
      icon: Inbox,
      action: onOpenRecepcion
    },
    {
      id: 4,
      title: 'No Sujeción',
      description: 'El prestador rechaza el arbitraje. Se dejan a salvo los derechos del quejoso.',
      icon: FileX,
      action: onOpenNoSujecion
    },
    {
      id: 5,
      title: 'Declaración de Voluntad',
      description: 'El médico acepta el arbitraje, asume confidencialidad y se fija plazo para expediente.',
      icon: FileCheck,
      action: onOpenDeclaracionVoluntad
    },
    {
      id: 6,
      title: 'Audiencia de Conciliación',
      description: 'Sesión donde las partes intentan llegar a un acuerdo fuera del tribunal.',
      icon: Handshake, // Corregido: Ahora usa Handshake
      action: onOpenAudienciaConciliacion
    },
    {
      id: 7,
      title: 'Acuerdo y Señalamiento',
      description: 'Acusa de recibido el expediente y cita formalmente a la audiencia de conciliación.',
      icon: CalendarDays,
      action: onOpenAcuerdoSenalamiento
    },
    {
      id: 8,
      title: 'Audiencia No Conciliada',
      description: 'Cierre de queja sin acuerdo. Se archiva el caso y se notifican derechos a salvo.',
      icon: ShieldAlert,
      action: onOpenAudienciaNoConciliada
    },
    {
      id: 9,
      title: 'Diferimiento de Audiencia',
      description: 'Se establece una nueva fecha para que las partes reconsideren propuestas.',
      icon: FileClock,
      action: onOpenDiferimientoAudiencia
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose} // 2. Cierra al dar clic afuera
    >
      <div 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Evita que los clics adentro cierren el modal
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-rose-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <span className="bg-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                 Expediente de Queja
               </span>
            </div>
            <h2 className="text-2xl font-black text-slate-800">Generación de Documentos</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Seleccione el acto jurídico a generar para: <span className="font-bold text-slate-700">{item?.nombre} {item?.apellido_paterno} {item?.apellido_materno}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-3 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Contenedor scrolleable para los botones */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 3. Renderizado Dinámico (DRY) */}
            {menuOptions.map((option) => (
              <button 
                key={option.id}
                onClick={() => handleAction(option.action)}
                className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                   <option.icon size={100} />
                </div>
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                  <option.icon size={28} />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">{option.title}</h3>
                  <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuQuejasModal;