export const StatCard = ({ title, count, icon, colorClass }) => (
  <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6 group hover:scale-[1.02] transition-transform duration-300">
    {/* Contenedor del Icono con efecto de profundidad */}
    <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-lg transition-all duration-300 group-hover:rotate-3`}>
      {icon}
    </div>

    {/* Información */}
    <div className="space-y-0.5">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
        {title}
      </p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">
        {count.toLocaleString()} 
      </h3>
    </div>
  </div>
);