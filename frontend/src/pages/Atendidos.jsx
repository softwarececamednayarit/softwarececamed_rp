import { useEffect, useState } from 'react';
import { AtendidosService } from '../services/atendidosService'; // Ajusta la ruta si es necesario (../ o ./)
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { SearchFilters } from '../components/SearchFilters';
import { DetailModal } from '../components/DetailModal';
import { normalizeText } from '../utils/formatters';
import { Users, MessageSquare, AlertCircle, Compass, RefreshCw, Briefcase } from 'lucide-react';

const Atendidos = () => {
  const [atendidos, setAtendidos] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nombre: '', tipo: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await AtendidosService.getAll();
      setAtendidos(res.data || []);
    } catch (err) {
      console.error("Error al obtener datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const dataFiltrada = atendidos.filter(item => {
    const busquedaNombre = normalizeText(filters.nombre);
    const nombreCompleto = normalizeText(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`);
    const filtroTipo = normalizeText(filters.tipo);
    const itemTipo = normalizeText(item.tipo);

    const coincideNombre = nombreCompleto.includes(busquedaNombre);
    const coincideTipo = filters.tipo === "" || 
      (filtroTipo === "asesoria" ? itemTipo.includes("asesoria") : itemTipo === filtroTipo);

    return coincideNombre && coincideTipo;
  });

  // Helper para contar palabras clave
  const countByKeyword = (keyword) => 
    atendidos.filter(a => normalizeText(a.tipo).includes(normalizeText(keyword))).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
        
        {/* Header de la página */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Panel de Atendidos</h1>
            <p className="text-slate-500 text-lg font-medium">
              {dataFiltrada.length} registros encontrados.
            </p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50">
            <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-500' : ''} />
            Actualizar Datos
          </button>
        </header>

        {/* SECCIÓN DE ESTADÍSTICAS (5 CARDS SEPARADAS) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total" count={atendidos.length} icon={<Users size={24} />} colorClass="bg-slate-900 shadow-xl shadow-slate-200" />
          
          <StatCard title="Quejas" count={countByKeyword('QUEJA')} icon={<AlertCircle size={24} />} colorClass="bg-rose-600 shadow-xl shadow-rose-100" />
          
          <StatCard title="Gestiones" count={countByKeyword('GESTION')} icon={<Briefcase size={24} />} colorClass="bg-emerald-600 shadow-xl shadow-emerald-100" />
          
          <StatCard title="Asesorías" count={countByKeyword('ASESORIA')} icon={<MessageSquare size={24} />} colorClass="bg-blue-600 shadow-xl shadow-blue-100" />
          
          <StatCard title="Orientaciones" count={countByKeyword('ORIENTACION')} icon={<Compass size={24} />} colorClass="bg-amber-500 shadow-xl shadow-amber-100" />
        </section>

        {/* TABLA Y FILTROS */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <h3 className="text-xl font-bold text-slate-800">Listado de Seguimiento</h3>
              <SearchFilters 
                onSearchChange={(val) => setFilters(f => ({...f, nombre: val}))} 
                onFilterChange={(val) => setFilters(f => ({...f, tipo: val}))}
              />
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                <RefreshCw size={48} className="animate-spin text-indigo-500 mb-4" />
                <span className="text-slate-500 font-bold text-lg">Sincronizando...</span>
              </div>
            ) : (
              <DataTable data={dataFiltrada} onDetailClick={setSelectedItem} />
            )}
          </div>
        </section>
      </div>

      {/* MODAL */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default Atendidos;