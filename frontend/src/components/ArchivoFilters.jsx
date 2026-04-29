import React from 'react';
import { Search, Calendar, ArrowUpDown, X, ChevronDown, Filter } from 'lucide-react';

const ArchivoFilters = ({ filters, onFilterChange, onReset }) => {
  
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = filters.search || filters.tipo || filters.orden !== 'fechaDesc' || filters.fechaInicio || filters.fechaFin;

  return (
    <div className="w-full bg-slate-50/80 border border-slate-100 p-2 md:p-3 rounded-3xl flex flex-col xl:flex-row gap-3">
      
      {/* BÚSQUEDA POR TEXTO */}
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          value={filters.search}
          placeholder="Buscar por nombre, oficio o asunto..."
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full bg-white border-none shadow-sm pl-12 pr-10 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-700 font-bold placeholder:text-slate-400 text-sm h-full"
        />
        {filters.search && (
            <button onClick={() => handleChange('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={16} />
            </button>
        )}
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
        
        {/* FILTRO: TIPO (ENVIADO/RECIBIDO) */}
        <div className="relative flex-1 md:w-40">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter size={14} />
            </div>
            <select
                value={filters.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full bg-white border-none shadow-sm pl-8 pr-8 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer h-full"
            >
                <option value="">Todos los Flujos</option>
                <option value="Recibido">📥 Recibidos</option>
                <option value="Enviado">📤 Enviados</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        {/* ORDENAMIENTO */}
        <div className="relative flex-1 md:w-44">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ArrowUpDown size={14} />
            </div>
            <select
                value={filters.orden}
                onChange={(e) => handleChange('orden', e.target.value)}
                className="w-full bg-white border-none shadow-sm pl-8 pr-8 py-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer h-full"
            >
                <option value="fechaDesc">📅 Más Recientes</option>
                <option value="fechaAsc">📅 Más Antiguos</option>
                <option value="alfabeticoAsc">🔤 Nombre (A-Z)</option>
                <option value="alfabeticoDesc">🔤 Nombre (Z-A)</option>
                <option value="tamanioDesc">⚖️ Mayor Tamaño</option>
                <option value="tamanioAsc">⚖️ Menor Tamaño</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        {/* RANGO DE FECHAS (DEL OFICIO) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm h-full flex-1 md:flex-none border border-transparent focus-within:border-indigo-500/20 transition-all">
            <input 
                type="date" 
                value={filters.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                className="bg-transparent border-none py-2 px-2 focus:ring-0 outline-none text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
                title="Fecha Inicial"
            />
            <span className="text-slate-200">-</span>
            <input 
                type="date" 
                value={filters.fechaFin}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                className="bg-transparent border-none py-2 px-2 focus:ring-0 outline-none text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
                title="Fecha Final"
            />
        </div>

        {/* BOTÓN RESET */}
        {hasActiveFilters && (
            <button 
                onClick={onReset}
                className="flex items-center justify-center p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                title="Limpiar filtros"
            >
                <X size={18} />
            </button>
        )}
      </div>
    </div>
  );
};

export default ArchivoFilters;