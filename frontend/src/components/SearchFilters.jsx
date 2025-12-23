import { Search, Filter, ChevronDown } from 'lucide-react';

export const SearchFilters = ({ onSearchChange, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-end w-full lg:w-auto">
      {/* BUSCADOR POR TEXTO */}
      <div className="flex-1 w-full group">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
          Buscador Inteligente
        </label>
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" 
            size={18} 
          />
          <input
            type="text"
            placeholder="Nombre, apellido o palabra clave..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* FILTRO POR CATEGORÍA */}
      <div className="w-full md:w-64">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
          Categoría
        </label>
        <div className="relative">
          <Filter 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
            size={18} 
          />
          <select
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-10 py-3 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer appearance-none text-slate-700 font-bold transition-all"
          >
            <option value="">Todos los trámites</option>
            <option value="ASESORÍA">Asesoría</option>
            <option value="QUEJA">Queja</option>
            <option value="GESTIÓN">Gestión</option>
            <option value="ORIENTACIÓN">Orientación</option>
          </select>
          {/* Icono decorativo de flecha para el select */}
          <ChevronDown 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
            size={16} 
          />
        </div>
      </div>
    </div>
  );
};