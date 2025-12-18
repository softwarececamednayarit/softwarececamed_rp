export const SearchFilters = ({ onSearchChange, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Buscar por nombre</label>
        <input
          type="text"
          placeholder="Ej. Juan Pérez..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>
      <div className="w-full md:w-48">
        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tipo de Trámite</label>
        <select
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        >
          <option value="">Todos</option>
          <option value="ASESORÍA">Asesoría</option>
          <option value="QUEJA">Queja</option>
          <option value="GESTIÓN">Gestión</option>
          <option value="ORIENTACIÓN">Orientación</option>
        </select>
      </div>
    </div>
  );
};