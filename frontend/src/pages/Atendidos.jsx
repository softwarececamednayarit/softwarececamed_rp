import { useEffect, useState, useMemo } from 'react';
import { AtendidosService } from '../services/atendidosService'; 
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { SearchFilters } from '../components/SearchFilters';
import { DetailModal } from '../components/DetailModal';
import { normalizeText } from '../utils/formatters';
import { Users, MessageSquare, AlertCircle, Compass, RefreshCw, Briefcase, Zap, FileText, Scale } from 'lucide-react';

const Atendidos = () => {
  const [atendidos, setAtendidos] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. ESTADO DE FILTROS ACTUALIZADO (Con valores por defecto)
  const [filters, setFilters] = useState({ 
    nombre: '', 
    tipo: '', 
    orden: 'desc', // 'desc' = Más recientes primero
    fechaInicio: '',
    fechaFin: ''
  });

  // 2. FUNCIÓN PARA RESETEAR
  const resetFilters = () => setFilters({ 
    nombre: '', 
    tipo: '', 
    orden: 'desc', 
    fechaInicio: '', 
    fechaFin: '' 
  });

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

  // ========================================================================
  // 3. LÓGICA DE FILTRADO Y ORDENAMIENTO
  // ========================================================================
  const dataFiltrada = useMemo(() => {
    // A. FILTRADO
    let filtered = atendidos.filter(item => {
      // --- Texto (Busca en nombre, apellidos e institución) ---
      const busqueda = normalizeText(filters.nombre);
      const textoCompleto = normalizeText(`${item.nombre} ${item.apellido_paterno} ${item.apellido_materno} ${item.institucion || ''} ${item.autoridad_responsable || ''}`);
      const coincideTexto = textoCompleto.includes(busqueda);
      
      // --- Tipo ---
      const filtroTipo = normalizeText(filters.tipo);
      const itemTipo = normalizeText(item.tipo);
      let coincideTipo = true;
      
      if (filters.tipo !== "") {
          if (filtroTipo === "asesoria") {
             coincideTipo = itemTipo.includes("asesoria");
          } else {
             coincideTipo = itemTipo === filtroTipo;
          }
      }

      // --- Fechas ---
      let coincideFecha = true;
      if (item.fecha_recepcion) {
          // Convertimos la fecha del registro a objeto Date (sin hora para evitar problemas de zona horaria si es string)
          const fechaItem = new Date(item.fecha_recepcion); 
          
          if (filters.fechaInicio) {
              const inicio = new Date(filters.fechaInicio);
              // Resetear horas para comparar solo fechas
              inicio.setHours(0, 0, 0, 0); 
              if (fechaItem < inicio) coincideFecha = false;
          }
          
          if (filters.fechaFin && coincideFecha) {
              const fin = new Date(filters.fechaFin);
              // Ajustar fin al final del día (23:59:59)
              fin.setHours(23, 59, 59, 999); 
              if (fechaItem > fin) coincideFecha = false;
          }
      }

      return coincideTexto && coincideTipo && coincideFecha;
    });

    // B. ORDENAMIENTO
    return filtered.sort((a, b) => {
        const fechaA = new Date(a.fecha_recepcion || 0).getTime();
        const fechaB = new Date(b.fecha_recepcion || 0).getTime();
        
        if (filters.orden === 'asc') {
            return fechaA - fechaB; // Antiguo -> Reciente
        } else {
            return fechaB - fechaA; // Reciente -> Antiguo (Default)
        }
    });

  }, [atendidos, filters]);

  // ========================================================================
  // 4. ESTADÍSTICAS (Sobre el total global, no el filtrado)
  // ========================================================================
  const stats = useMemo(() => {
    const countByKeyword = (keyword) => 
      atendidos.filter(a => normalizeText(a.tipo).includes(normalizeText(keyword))).length;

    const totalAsesorias = countByKeyword('ASESORIA');
    const asesoriaInmediata = countByKeyword('INMEDIATA');
    
    return {
      total: atendidos.length,
      quejas: countByKeyword('QUEJA'),
      gestiones: countByKeyword('GESTION'),
      dictamenes: countByKeyword('DICTAMEN'),
      orientaciones: countByKeyword('ORIENTACION'),
      totalAsesorias,
      asesoriaInmediata,
      asesoriaGeneral: totalAsesorias - asesoriaInmediata
    };
  }, [atendidos]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
        
        {/* HEADER */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Users size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Panel de Atendidos
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-slate-500 font-medium text-sm">
                Mostrando <span className="text-slate-900 font-bold">{dataFiltrada.length}</span> registros.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={fetchData} 
              disabled={loading} 
              className="group flex items-center justify-center gap-2.5 bg-white border border-slate-200 px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw size={18} className={`transition-transform group-hover:rotate-180 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
              <span>{loading ? 'Actualizando...' : 'Actualizar Datos'}</span>
            </button>
          </div>
        </header>

        {/* ESTADÍSTICAS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard title="Total" count={stats.total} icon={<Users size={24} />} colorClass="bg-slate-900 shadow-xl shadow-slate-200" />
          <StatCard title="Quejas" count={stats.quejas} icon={<AlertCircle size={24} />} colorClass="bg-rose-600 shadow-xl shadow-rose-100" />
          <StatCard title="Gestiones" count={stats.gestiones} icon={<Briefcase size={24} />} colorClass="bg-emerald-600 shadow-xl shadow-emerald-100" />
          <StatCard title="Dictámenes" count={stats.dictamenes} icon={<Scale size={24} />} colorClass="bg-purple-600 shadow-xl shadow-purple-100" />

          {/* Tarjeta Asesorías */}
          <div className="group relative bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-blue-200 hover:border-blue-100 cursor-default">
            <div className="flex items-center gap-4 transition-all duration-300 group-hover:opacity-0 group-hover:scale-95">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100 shrink-0">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asesorías</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.totalAsesorias}</h3>
                </div>
            </div>
            <div className="absolute inset-0 bg-blue-600 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center">
               <div className="flex h-full divide-x divide-white/20 relative z-20">
                  <div className="flex-1 flex flex-col items-center justify-center p-2 text-center group/item">
                      <div className="mb-1 text-blue-200 group-hover/item:text-white transition-colors"><Zap size={20} /></div>
                      <span className="text-2xl font-black text-white">{stats.asesoriaInmediata}</span>
                      <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Inmediata</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-2 text-center group/item">
                      <div className="mb-1 text-blue-200 group-hover/item:text-white transition-colors"><FileText size={20} /></div>
                      <span className="text-2xl font-black text-white">{stats.asesoriaGeneral}</span>
                      <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">General</span>
                  </div>
               </div>
            </div>
          </div>

          <StatCard title="Orientaciones" count={stats.orientaciones} icon={<Compass size={24} />} colorClass="bg-amber-500 shadow-xl shadow-amber-100" />
        </section>

        {/* TABLA Y FILTROS */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="mb-4 xl:mb-0">
                  <h3 className="text-xl font-bold text-slate-800">Listado de Seguimiento</h3>
                  <p className="text-xs text-slate-400 mt-1">Gestione y filtre los expedientes</p>
              </div>
              
              {/* 5. PASAMOS LAS PROPS CORRECTAS AL NUEVO FILTRO */}
              <div className="flex-1 max-w-4xl">
                  <SearchFilters 
                    filters={filters} 
                    onFilterChange={setFilters} 
                    onReset={resetFilters}
                  />
              </div>
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

      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default Atendidos;