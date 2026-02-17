import { Search, Filter, ChevronDown, Calendar, ArrowUpDown, X } from 'lucide-react';

export const SearchFilters = ({ filters, onFilterChange, onReset }) => {
  
  // Helper para actualizar un solo campo manteniendo los demás
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = filters.nombre || filters.tipo || filters.orden !== 'desc' || filters.fechaInicio || filters.fechaFin;

  return (
    <div className="w-full bg-slate-50/80 border border-slate-100 p-2 md:p-3 rounded-3xl flex flex-col xl:flex-row gap-3">
      
      {/* --- SECCIÓN 1: BUSCADOR PRINCIPAL --- */}
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          value={filters.nombre}
          placeholder="Buscar por nombre, folio o institución..."
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full bg-white border-none shadow-sm pl-12 pr-10 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-700 font-bold placeholder:text-slate-400 text-sm h-full"
        />
        {filters.nombre && (
            <button 
                onClick={() => handleChange('nombre', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
                <X size={16} />
            </button>
        )}
      </div>

      {/* --- SECCIÓN 2: FILTROS RÁPIDOS --- */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        
        {/* Filtro: TIPO */}
        <div className="relative flex-1 md:w-36">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none">
                <Filter size={14} />
            </div>
            <select
                value={filters.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full bg-white border-none shadow-sm pl-8 pr-8 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer h-full"
            >
                <option value="">Todos los Tipos</option>
                <option value="ASESORÍA">Asesoría</option>
                <option value="QUEJA">Queja</option>
                <option value="GESTIÓN">Gestión</option>
                <option value="ORIENTACIÓN">Orientación</option>
                <option value="DICTAMEN">Dictamen</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        {/* Filtro: ORDEN */}
        <div className="relative flex-1 md:w-40">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ArrowUpDown size={14} />
            </div>
            <select
                value={filters.orden}
                onChange={(e) => handleChange('orden', e.target.value)}
                className="w-full bg-white border-none shadow-sm pl-8 pr-8 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer h-full"
            >
                <option value="desc">Más Recientes</option>
                <option value="asc">Más Antiguos</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        {/* Fechas Group */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm h-full w-full md:w-auto flex-1 md:flex-none">
            {/* Filtro: DESDE */}
            <div className="relative flex-1">
                <input 
                    type="date" 
                    value={filters.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    className="w-full bg-transparent border-none py-2.5 pl-3 pr-2 focus:ring-0 outline-none text-[11px] font-bold text-slate-600 uppercase cursor-pointer"
                    title="Fecha Inicial"
                />
            </div>
            
            <span className="text-slate-200">-</span>
            
            {/* Filtro: HASTA */}
            <div className="relative flex-1">
                <input 
                    type="date" 
                    value={filters.fechaFin}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    className="w-full bg-transparent border-none py-2.5 pl-2 pr-3 focus:ring-0 outline-none text-[11px] font-bold text-slate-600 uppercase cursor-pointer"
                    title="Fecha Final"
                />
            </div>
        </div>

        {/* Botón Limpiar (Solo aparece si hay filtros activos) */}
        {hasActiveFilters && (
            <button 
                onClick={onReset}
                className="flex items-center justify-center p-3.5 md:p-0 md:w-12 h-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 md:hover:bg-transparent rounded-2xl md:rounded-full transition-all shrink-0 w-full"
                title="Limpiar todos los filtros"
            >
                <span className="md:hidden text-xs font-bold mr-2">Limpiar Filtros</span>
                <X size={18} />
            </button>
        )}
      </div>

    </div>
  );
};