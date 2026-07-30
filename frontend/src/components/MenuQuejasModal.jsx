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

// 1. Agregamos la prop 'onOpenNoSujecion'
const MenuQuejasModal = ({ isOpen, onClose, item, onOpenDocumentos, onOpenAudiencia, onOpenRecepcion, onOpenNoSujecion, onOpenDeclaracionVoluntad, onOpenAudienciaConciliacion, onOpenAcuerdoSenalamiento, onOpenAudienciaNoConciliada }) => {
  if (!isOpen) return null;

  const handleAction = (action) => {
    action(item);
    onClose(); 
  };

  // 2. Quitamos el ID 2 de este arreglo
  const botonesExtra = [
    { 
      id: 7, 
      label: 'Diferimiento de Audiencia', 
      desc: 'Se establece una nueva fecha para que las partes reconsideren propuestas.',
      icon: <FileClock size={26} />, 
      status: 'En proceso' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
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
            
            {/* 🟢 BOTÓN 1: Acta de Queja */}
            <button 
              onClick={() => handleAction(onOpenDocumentos)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <FileText size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <FileText size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Acta de Queja</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Documento principal que formaliza el inicio del procedimiento ante la comisión.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 2: Notificación Audiencia */}
            <button 
              onClick={() => handleAction(onOpenAudiencia)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <Scale size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <Scale size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Notificación Audiencia</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Oficio que invita al prestador médico a conocer la queja y decidir su participación.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 3: Auto de Recepción de Contestación */}
            <button 
              onClick={() => handleAction(onOpenRecepcion)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <Inbox size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <Inbox size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Recepción Contestación</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Acuerdo que hace constar la entrada oficial del escrito de defensa a oficialía.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 4: No Sujeción al Procedimiento (NUEVO) */}
            <button 
              onClick={() => handleAction(onOpenNoSujecion)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <FileX size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <FileX size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">No Sujeción</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  El prestador rechaza el arbitraje. Se dejan a salvo los derechos del quejoso.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 5: Declaración de Voluntad (NUEVO) */}
            <button 
              onClick={() => handleAction(onOpenDeclaracionVoluntad)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <FileCheck size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <FileCheck size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Declaración de Voluntad</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  El médico acepta el arbitraje, asume confidencialidad y se fija plazo para expediente.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 6: Audiencia de Conciliación */}
            <button 
              onClick={() => handleAction(onOpenAudienciaConciliacion)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <Scale size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <Scale size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Audiencia de Conciliación</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Sesión donde las partes intentan llegar a un acuerdo fuera del tribunal.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 7: Acuerdo y Señalamiento */}
            <button 
              onClick={() => handleAction(onOpenAcuerdoSenalamiento)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <CalendarDays size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <CalendarDays size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Acuerdo y Señalamiento</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Acusa de recibido el expediente y cita formalmente a la audiencia de conciliación.
                </p>
              </div>
            </button>

            {/* 🟢 BOTÓN 8: Audiencia No Conciliada */}
            <button 
              onClick={() => handleAction(onOpenAudienciaNoConciliada)}
              className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-600 hover:border-rose-600 group transition-all shadow-sm hover:shadow-xl hover:shadow-rose-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-rose-50 opacity-50 group-hover:text-rose-500/20 transition-colors">
                 <ShieldAlert size={100} />
              </div>
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-fit group-hover:bg-white/20 group-hover:text-white transition-colors relative z-10">
                <ShieldAlert size={28} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 group-hover:text-white mb-1">Audiencia No Conciliada</h3>
                <p className="text-xs text-slate-500 group-hover:text-rose-100 line-clamp-2">
                  Cierre de queja sin acuerdo. Se archiva el caso y se notifican derechos a salvo.
                </p>
              </div>
            </button>

            {/* 🔴 BOTONES RESTANTES (En proceso) */}
            {botonesExtra.map((btn) => (
              <button 
                key={btn.id}
                disabled
                className="relative flex flex-col text-left p-6 gap-4 rounded-2xl border-2 border-slate-100 bg-white opacity-70 cursor-not-allowed"
              >
                <div className="flex items-start justify-between w-full">
                   <div className="p-3 bg-slate-100 text-slate-400 rounded-xl w-fit">
                     {btn.icon}
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                     {btn.status}
                   </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-600 mb-1 leading-tight">{btn.label}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {btn.desc}
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