import { useEffect, useState } from 'react';
import { AtendidosService } from '../services/atendidosService';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { SearchFilters } from '../components/SearchFilters';

const Atendidos = () => {
  const [atendidos, setAtendidos] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, resStats] = await Promise.all([
        AtendidosService.getAll(),
        AtendidosService.getResumen()
      ]);
      setAtendidos(resData.data);
      setStats(resStats.resumen);
    } catch (err) {
      console.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de búsqueda local (para no saturar la API en cada tecla)
  const filteredData = atendidos.filter(item => 
    `${item.nombre} ${item.apellido_paterno}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Cargando datos del CECAMED...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Control de Atendidos</h1>
        <p className="text-gray-500">Gestión general de trámites y servicios</p>
      </header>

      {/* Fila de Estadísticas (StatCards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total" count={atendidos.length} colorClass="bg-gray-800" />
        <StatCard title="Quejas" count={atendidos.filter(a => a.tipo === 'QUEJA').length} colorClass="bg-red-500" />
        <StatCard title="Asesorías" count={atendidos.filter(a => a.tipo === 'ASESORÍA').length} colorClass="bg-blue-500" />
        <StatCard title="Gestiones" count={atendidos.filter(a => a.tipo === 'GESTIÓN').length} colorClass="bg-emerald-500" />
      </div>

      <SearchFilters onSearchChange={setSearchTerm} />

      <DataTable 
        data={filteredData} 
        onDetailClick={(item) => console.log("Detalles de:", item)} 
      />
    </div>
  );
};

export default Atendidos;