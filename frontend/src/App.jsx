import { useEffect, useState } from 'react';
import { AtendidosService } from './services/atendidosService';
import { StatCard } from './components/StatCard';
import { DataTable } from './components/DataTable';
import { SearchFilters } from './components/SearchFilters';
import { DetailModal } from './components/DetailModal';
import { Users, MessageSquare, AlertCircle, Compass, RefreshCw } from 'lucide-react';

function App() {
  const [atendidos, setAtendidos] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Para el Modal
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nombre: '', tipo: '' });

  useEffect(() => {
    fetchData();
  }, [filters]); // Se recarga cuando cambias el filtro de tipo o nombre

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await AtendidosService.getAll(filters);
      setAtendidos(res.data);
    } catch (err) {
      console.error("Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de conteo inteligente para las StatCards
  const countByKeyword = (keyword) => 
    atendidos.filter(a => a.tipo?.toUpperCase().includes(keyword.toUpperCase())).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Puedes crear un componente aparte luego */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col p-6 text-white">
        <div className="mb-10 font-bold text-xl tracking-wider text-indigo-400">CECAMED</div>
        <nav className="space-y-4">
          <a href="#" className="flex items-center space-x-3 bg-indigo-600 p-3 rounded-xl">
            <Users size={20} /> <span>Atendidos</span>
          </a>
          {/* Otros enlaces aquí */}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* CONTENEDOR MAESTRO: Aquí es donde se centra todo */}
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER SECCIÓN */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Panel de Atendidos</h1>
              <p className="text-slate-500 font-medium mt-2">Monitoreo de trámites y servicios institucionales</p>
            </div>
            <button 
              onClick={fetchData}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Actualizar Datos
            </button>
          </header>

          {/* FILA DE ESTADÍSTICAS: Alineadas y con degradados */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total General" 
              count={atendidos.length} 
              icon={<Users size={24} />} 
              colorClass="bg-gradient-to-br from-slate-700 to-slate-900" 
            />
            <StatCard 
              title="Asesorías" 
              count={countByKeyword('ASESORÍA')} 
              icon={<MessageSquare size={24} />} 
              colorClass="bg-gradient-to-br from-blue-600 to-blue-800" 
            />
            <StatCard 
              title="Quejas/Gestión" 
              count={countByKeyword('QUEJA') + countByKeyword('GESTIÓN')} 
              icon={<AlertCircle size={24} />} 
              colorClass="bg-gradient-to-br from-rose-500 to-rose-700" 
            />
            <StatCard 
              title="Orientaciones" 
              count={countByKeyword('ORIENTACIÓN')} 
              icon={<Compass size={24} />} 
              colorClass="bg-gradient-to-br from-amber-400 to-amber-600" 
            />
          </section>

          {/* FILTROS Y TABLA */}
          <section className="space-y-6">
            <SearchFilters 
              onSearchChange={(val) => setFilters({...filters, nombre: val})} 
              onFilterChange={(val) => setFilters({...filters, tipo: val})}
            />

            {loading ? (
              <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RefreshCw size={40} className="animate-spin" />
                  <span className="font-medium">Cargando base de datos...</span>
                </div>
              </div>
            ) : (
              <DataTable 
                data={atendidos} 
                onDetailClick={(item) => setSelectedItem(item)} 
              />
            )}
          </section>
        </div>
      </main>

      {/* MODAL DE DETALLE (Se activa al picarle a "Ver Ficha") */}
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