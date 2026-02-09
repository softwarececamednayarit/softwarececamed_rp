import { Search, Filter, ChevronDown, Calendar, ArrowUpDown, XCircle } from 'lucide-react';

export const SearchFilters = ({ filters, onFilterChange, onReset }) => {
  
  // Helper para actualizar un solo campo manteniendo los demás
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="w-full space-y-4">
      
      {/* --- FILA 1: BUSCADOR PRINCIPAL + RESET --- */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        
        {/* Input de Texto */}
        <div className="flex-1 w-full group">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
            Buscador Inteligente
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              value={filters.nombre}
              placeholder="Buscar por nombre"
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-bold placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Botón Limpiar (Reset) */}
        <button 
            onClick={onReset}
            className="hidden md:flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-xs shrink-0"
            title="Restablecer todos los filtros"
        >
            <XCircle size={18} /> Limpiar
        </button>
      </div>

      {/* --- FILA 2: FILTROS AVANZADOS (Grid) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* 1. TIPO DE TRÁMITE */}
        <div className="relative group">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Tipo</label>
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                    value={filters.tipo}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-8 py-2.5 rounded-xl focus:border-indigo-500 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer shadow-sm transition-all hover:border-indigo-200"
                >
                    <option value="">Todos</option>
                    <option value="ASESORÍA">Asesoría</option>
                    <option value="QUEJA">Queja</option>
                    <option value="GESTIÓN">Gestión</option>
                    <option value="ORIENTACIÓN">Orientación</option>
                    <option value="DICTAMEN">Dictamen</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>
        </div>

        {/* 2. ORDENAMIENTO */}
        <div className="relative group">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Orden</label>
            <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                    value={filters.orden}
                    onChange={(e) => handleChange('orden', e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-8 py-2.5 rounded-xl focus:border-indigo-500 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer shadow-sm transition-all hover:border-indigo-200"
                >
                    <option value="desc">Más Recientes</option>
                    <option value="asc">Más Antiguos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>
        </div>

        {/* 3. FECHA INICIO */}
        <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Desde</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="date" 
                    value={filters.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-2 py-2.5 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-sm uppercase cursor-pointer hover:border-indigo-200"
                />
            </div>
        </div>

        {/* 4. FECHA FIN */}
        <div>
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Hasta</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="date" 
                    value={filters.fechaFin}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-9 pr-2 py-2.5 rounded-xl focus:border-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-sm uppercase cursor-pointer hover:border-indigo-200"
                />
            </div>
        </div>

      </div>
    </div>
  );
};