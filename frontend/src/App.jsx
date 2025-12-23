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
  }, [filters]);

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

  const countByKeyword = (keyword) => 
    atendidos.filter(a => a.tipo?.toUpperCase().includes(keyword.toUpperCase())).length;

  return (
    <div className="flex min-h-screen bg-slate-100/50 font-sans text-slate-900">
      {/* SIDEBAR: Con ancho fijo y padding interno */}
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

      {/* ÁREA PRINCIPAL: Aquí aplicamos los márgenes de respiro */}
      <main className="flex-1 overflow-y-auto">
        {/* Contenedor Maestro con max-width y padding lateral generoso */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
          
          {/* HEADER: Con separación de la línea de fondo */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Panel de Atendidos
              </h1>
              <p className="text-slate-500 text-lg font-medium">
                Gestión y seguimiento de ciudadanos atendidos.
              </p>
            </div>
            
            <button 
              onClick={fetchData}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin text-indigo-500' : ''} />
              Actualizar Base de Datos
            </button>
          </header>

          {/* ESTADÍSTICAS: Gap aumentado para que no se amontonen */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              title="Total General" 
              count={atendidos.length} 
              icon={<Users size={24} />} 
              colorClass="bg-slate-900 shadow-xl shadow-slate-200" 
            />
            <StatCard 
              title="Asesorías" 
              count={countByKeyword('ASESORÍA')} 
              icon={<MessageSquare size={24} />} 
              colorClass="bg-blue-600 shadow-xl shadow-blue-100" 
            />
            <StatCard 
              title="Quejas/Gestión" 
              count={countByKeyword('QUEJA') + countByKeyword('GESTIÓN')} 
              icon={<AlertCircle size={24} />} 
              colorClass="bg-rose-600 shadow-xl shadow-rose-100" 
            />
            <StatCard 
              title="Orientaciones" 
              count={countByKeyword('ORIENTACIÓN')} 
              icon={<Compass size={24} />} 
              colorClass="bg-amber-500 shadow-xl shadow-amber-100" 
            />
          </section>

          {/* SECCIÓN DE DATOS: Envuelta en una tarjeta maestra con padding interno */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 md:p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-xl font-bold text-slate-800">Registros Recientes</h3>
                <SearchFilters 
                  onSearchChange={(val) => setFilters({...filters, nombre: val})} 
                  onFilterChange={(val) => setFilters({...filters, tipo: val})}
                />
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <RefreshCw size={48} className="animate-spin text-indigo-500 mb-4" />
                  <span className="text-slate-500 font-bold text-lg">Sincronizando con Firebase...</span>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                   <DataTable 
                    data={atendidos} 
                    onDetailClick={(item) => setSelectedItem(item)} 
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

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