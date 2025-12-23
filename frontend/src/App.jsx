import { useEffect, useState } from 'react';
import { AtendidosService } from './services/atendidosService';
import { StatCard } from './components/StatCard';
import { DataTable } from './components/DataTable';
import { SearchFilters } from './components/SearchFilters';
import { DetailModal } from './components/DetailModal';
import { Users, MessageSquare, AlertCircle, Compass, RefreshCw } from 'lucide-react';

function App() {
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

  // --- LÓGICA DE NORMALIZACIÓN Y FILTRADO ---
  
  const normalizeText = (text) => 
    text?.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() || "";

  const dataFiltrada = atendidos.filter(item => {
    const busquedaNombre = normalizeText(filters.nombre);
    const nombreCompleto = normalizeText(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`);
    
    const filtroTipo = normalizeText(filters.tipo);
    const itemTipo = normalizeText(item.tipo);

    const coincideNombre = nombreCompleto.includes(busquedaNombre);
    
    // LÓGICA UNIFICADA: 
    // Si el filtro es "asesoria", permitimos cualquier tipo que CONTENGA "asesoria" (ej. Inmediata)
    // Para lo demás, buscamos coincidencia exacta normalizada.
    const coincideTipo = filters.tipo === "" || 
      (filtroTipo === "asesoria" 
        ? itemTipo.includes("asesoria") 
        : itemTipo === filtroTipo);

    return coincideNombre && coincideTipo;
  });

  // Contador inteligente que también unifica criterios para las StatCards
  const countByKeyword = (keyword) => 
    atendidos.filter(a => normalizeText(a.tipo).includes(normalizeText(keyword))).length;

  return (
    <div className="flex min-h-screen bg-slate-100/50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-slate-900 flex-col p-8 text-white sticky top-0 h-screen">
        <div className="mb-12">
          <div className="text-2xl font-black tracking-tighter text-white">
            CECA<span className="text-indigo-400">MED</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">Panel de Control</p>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-3 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-900/20 transition-all">
            <Users size={20} /> 
            <span className="font-semibold">Atendidos</span>
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Panel de Atendidos</h1>
              <p className="text-slate-500 text-lg font-medium">
                {dataFiltrada.length} registros filtrados de un total de {atendidos.length}.
              </p>
            </div>
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-500' : ''} />
              Actualizar Base de Datos
            </button>
          </header>

          {/* ESTADÍSTICAS UNIFICADAS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Total General" count={atendidos.length} icon={<Users size={24} />} colorClass="bg-slate-900 shadow-xl shadow-slate-200" />
            <StatCard title="Asesorías" count={countByKeyword('ASESORIA')} icon={<MessageSquare size={24} />} colorClass="bg-blue-600 shadow-xl shadow-blue-100" />
            <StatCard title="Quejas / Gestión" count={countByKeyword('QUEJA') + countByKeyword('GESTION')} icon={<AlertCircle size={24} />} colorClass="bg-rose-600 shadow-xl shadow-rose-100" />
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
                  <span className="text-slate-500 font-bold text-lg">Sincronizando registros...</span>
                </div>
              ) : (
                <DataTable 
                  data={dataFiltrada} 
                  onDetailClick={(item) => setSelectedItem(item)} 
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* MODAL DE DETALLE */}
      {selectedItem && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}

export default App;