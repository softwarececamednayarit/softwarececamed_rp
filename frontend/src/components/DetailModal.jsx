import { X, User, FileText, ClipboardList, MapPin, Calendar, Info } from 'lucide-react';

export const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  // Componente interno para cada sección del expediente
  const Section = ({ title, icon, children }) => (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
        <span className="text-indigo-600">{icon}</span>
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );

  // Componente interno para cada campo de dato
  const DataField = ({ label, value, fullWidth = false }) => (
    <div className={`flex flex-col space-y-1 ${fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
      <div className="text-sm font-semibold text-slate-700 bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-colors">
        {value || <span className="text-slate-300 font-normal">No registrado</span>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* HEADER: Identificación rápida */}
        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">
                {item.nombre} {item.apellido_paterno} {item.apellido_materno}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md uppercase">
                  {item.tipo}
                </span>
                <span className="text-xs text-slate-400">ID: {item.id}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* CUERPO: Scrollable con los 35 campos agrupados */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-4">
          
          <Section title="Información Personal" icon={<User size={18} />}>
            <DataField label="Sexo" value={item.sexo} />
            <DataField label="Edad" value={item.edad} />
            <DataField label="Nacionalidad" value={item.nacionalidad} />
            <DataField label="CURP" value={item.curp} />
            <DataField label="Ocupación" value={item.ocupacion} />
            <DataField label="Escolaridad" value={item.escolaridad} />
          </Section>

          <Section title="Ubicación y Contacto" icon={<MapPin size={18} />}>
            <DataField label="Municipio" value={item.municipio} />
            <DataField label="Localidad" value={item.localidad} />
            <DataField label="Teléfono" value={item.telefono} />
            <DataField label="Correo Electrónico" value={item.correo} />
            <DataField label="Domicilio" value={item.domicilio} fullWidth />
          </Section>

          <Section title="Detalles del Trámite" icon={<ClipboardList size={18} />}>
            <DataField label="Fecha de Recepción" value={item.fecha_recepcion} />
            <DataField label="Autoridad Responsable" value={item.autoridad_responsable} />
            <DataField label="Motivo Principal" value={item.motivo_principal} />
            <DataField label="Submotivo" value={item.submotivo} />
            <DataField label="Criterio Médico" value={item.criterio_medico} />
            <DataField label="Estatus Actual" value={item.estatus} />
          </Section>

          <Section title="Hechos y Observaciones" icon={<FileText size={18} />}>
            <DataField 
              label="Descripción de los Hechos" 
              value={item.descripcion_hechos} 
              fullWidth 
            />
            <DataField 
              label="Pretensión del Ciudadano" 
              value={item.pretension} 
              fullWidth 
            />
            <DataField 
              label="Observaciones Internas" 
              value={item.observaciones} 
              fullWidth 
            />
          </Section>

        </div>

        {/* FOOTER: Acciones */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button 
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            onClick={() => window.print()}
          >
            Imprimir Expediente
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};