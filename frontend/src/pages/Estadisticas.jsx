import React, { useEffect, useState, useMemo } from 'react';
import { AtendidosService } from '../services/atendidosService'; 
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Loader2, Activity, Calendar, MapPin, Building2, 
  Stethoscope, AlertCircle, Filter, X, Users, Briefcase, UserCheck, HeartHandshake, Tag 
} from 'lucide-react';

// --- PALETAS DE COLORES ---
const COLORS_PADRON = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669']; // Verdes
const COLORS_GESTION = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#4f46e5']; // Azules
const COLORS_DEMO = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#d97706']; // Amarillos/Naranjas

export const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState([]); 
  
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const response = await AtendidosService.getPadronReport();
        setRawData(response.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // --- 2. PROCESAMIENTO MATEMÁTICO ---
  const metrics = useMemo(() => {
    // A. Filtro de Fechas
    const filteredData = rawData.filter(item => {
      if (!item.fecha_recepcion) return false;
      const itemDate = new Date(item.fecha_recepcion + 'T00:00:00'); 
      const start = dateRange.start ? new Date(dateRange.start + 'T00:00:00') : null;
      const end = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });

    // B. Helper Genérico de Agrupación
    const groupBy = (field, top = 5) => {
      const map = filteredData.reduce((acc, item) => {
        let key = item[field];
        if (!key || key === 'undefined' || String(key).trim() === '') key = 'NO ESPECIFICADO';
        key = String(key).toUpperCase().trim();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      return Object.keys(map)
        .map(k => ({ name: k, value: map[k] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, top);
    };

    // --- C. PROCESAMIENTO DEMOGRÁFICO ---
    
    // 1. Rangos de Edad (Limpieza inteligente)
    const edadMap = { '0-17 (Menores)': 0, '18-29 (Jóvenes)': 0, '30-59 (Adultos)': 0, '60+ (Mayores)': 0, 'No Especificado': 0 };
    
    filteredData.forEach(item => {
        let edadRaw = item.edad || item.edad_o_nacimiento;
        if (!edadRaw) {
            edadMap['No Especificado']++;
            return;
        }
        const numero = parseInt(String(edadRaw).replace(/\D/g, '')); // Quita "años"
        
        if (isNaN(numero)) {
            edadMap['No Especificado']++;
        } else if (numero < 18) {
            edadMap['0-17 (Menores)']++;
        } else if (numero < 30) {
            edadMap['18-29 (Jóvenes)']++;
        } else if (numero < 60) {
            edadMap['30-59 (Adultos)']++;
        } else {
            edadMap['60+ (Mayores)']++;
        }
    });
    const porRangoEdad = Object.keys(edadMap).map(k => ({ name: k, value: edadMap[k] }));

    // 2. Sexo / Género
    const porSexo = groupBy('sexo', 10);

    // 3. Estado Civil
    const porEstadoCivil = groupBy('estado_civil', 6);

    // --- D. MÉTRICAS PADRÓN ---
    const porMunicipio = groupBy('municipio', 5);
    const porBeneficiario = groupBy('tipo_beneficiario', 5);
    
    // CAMBIO AQUÍ: Usamos 'tipo' en lugar de 'tipo_apoyo' o 'tipo_asunto'
    const porTipoGeneral = groupBy('tipo', 6); 

    // --- E. MÉTRICAS GESTIÓN ---
    const porActividad = groupBy('actividad_apoyo', 5); 
    const porEspecialidad = groupBy('especialidad', 5);
    const porInstitucion = groupBy('prestador_nombre', 5);
    const porMotivo = groupBy('motivo', 5); 

    // --- F. TENDENCIA SEMANAL ---
    const semanaMap = filteredData.reduce((acc, item) => {
        if (!item.fecha_recepcion) return acc;
        const d = new Date(item.fecha_recepcion);
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        const year = date.getFullYear();
        const key = `${year}-${String(weekNumber).padStart(2, '0')}`;
        const label = `SEM ${weekNumber}`;
        if (!acc[key]) acc[key] = { date: key, name: label, total: 0 };
        acc[key].total += 1;
        return acc;
    }, {});
    const porSemana = Object.values(semanaMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: filteredData.length,
      porRangoEdad,
      porSexo,
      porEstadoCivil,
      porMunicipio,
      porBeneficiario,
      porTipoGeneral, // <--- Nueva métrica
      porActividad,  
      porEspecialidad,
      porInstitucion,
      porMotivo,
      porSemana
    };

  }, [rawData, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-indigo-600">
        <Loader2 size={48} className="animate-spin mb-4"/>
        <p className="font-bold text-sm tracking-widest uppercase">Procesando Datos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
        
        {/* --- HEADER ACTUALIZADO (ESTILO GESTIÓN) --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Efecto de gradiente decorativo de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Activity size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Tablero de Control
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <p className="text-slate-500 font-medium text-sm">
                Análisis estratégico de <span className="font-bold text-indigo-600">{metrics.total}</span> registros.
              </p>
            </div>
          </div>

          {/* Filtros de Fecha */}
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mr-2">
                <Filter size={14} /> Periodo
              </div>
              <div className="flex items-center gap-2 flex-1">
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} 
                  className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none focus:ring-0 w-full"
                />
                <span className="text-slate-300 font-bold">-</span>
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} 
                  className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none focus:ring-0 w-full"
                />
              </div>
              {(dateRange.start || dateRange.end) && (
                <button 
                  onClick={() => setDateRange({ start: '', end: '' })} 
                  className="ml-2 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* =================================================================================
            SECCIÓN 1: PERFIL DEMOGRÁFICO
           ================================================================================= */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><UserCheck size={20}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Perfil Demográfico</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Género (Pie Chart) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-amber-900/5">
                    <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} className="text-amber-500"/> Distribución por Sexo
                    </h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={metrics.porSexo} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {metrics.porSexo.map((entry, index) => {
                                        let color = COLORS_DEMO[index % COLORS_DEMO.length];
                                        if (entry.name.includes('MASCULINO') || entry.name.includes('HOMBRE')) color = '#3b82f6'; // Azul
                                        if (entry.name.includes('FEMENINO') || entry.name.includes('MUJER')) color = '#ec4899'; // Rosa
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px'}} />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Rangos de Edad (Bar Chart) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-amber-900/5 lg:col-span-2">
                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={16} className="text-amber-500"/> Rangos de Edad
                    </h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porRangoEdad} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill:'#92400e', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={50} label={{ position: 'top', fill: '#92400e', fontSize: 12, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Estado Civil (Bar Chart Horizontal) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-amber-900/5 lg:col-span-3">
                    <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
                        <HeartHandshake size={16} className="text-amber-500"/> Estado Civil
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porEstadoCivil} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fff7ed" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10, fontWeight: 700, fill:'#78350f'}} />
                                <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={20} label={{ position: 'right', fill: '#78350f', fontSize: 11, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>

        {/* --- SECCIÓN 2: PADRÓN --- */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Users size={20}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Padrón y Beneficiarios</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Municipios */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-emerald-900/5 lg:col-span-2">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <MapPin size={16} className="text-emerald-500"/> Top Municipios
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porMunicipio} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 700, fill:'#64748b'}} />
                                <Tooltip cursor={{fill: '#ecfdf5'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} label={{ position: 'right', fill: '#059669', fontSize: 11, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clasificación General (Antes Tipo Apoyo) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-emerald-900/5 flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Tag size={16} className="text-emerald-500"/> Clasificación General
                    </h3>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={metrics.porTipoGeneral} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {metrics.porTipoGeneral.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PADRON[index % COLORS_PADRON.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px'}} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>

        {/* --- SECCIÓN 3: GESTIÓN TÉCNICA --- */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Briefcase size={20}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Gestión Técnica</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Actividad de Apoyo */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-indigo-900/5 lg:col-span-2">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Activity size={16} className="text-indigo-500"/> Desglose por Actividad (Gestión/Queja/Orientación)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porActividad} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill:'#4f46e5', fontWeight:'bold'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#eef2ff'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={60} label={{ position: 'top', fill: '#4338ca', fontSize: 12, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Instituciones */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-indigo-900/5">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Building2 size={16} className="text-indigo-500"/> Instituciones
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porInstitucion} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e7ff" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={130} tick={{fontSize: 9, fontWeight: 700, fill:'#64748b'}} />
                                <Tooltip cursor={{fill: '#eef2ff'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={20} label={{ position: 'right', fill: '#4f46e5', fontSize: 10, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Especialidades */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-indigo-900/5">
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Stethoscope size={16} className="text-indigo-500"/> Especialidades
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.porEspecialidad} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e7ff" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={130} tick={{fontSize: 9, fontWeight: 700, fill:'#64748b'}} />
                                <Tooltip cursor={{fill: '#eef2ff'}} contentStyle={{borderRadius: '12px'}} />
                                <Bar dataKey="value" fill="#a5b4fc" radius={[0, 6, 6, 0]} barSize={20} label={{ position: 'right', fill: '#4f46e5', fontSize: 10, fontWeight: 'bold' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>

        {/* --- SECCIÓN 4: TENDENCIA SEMANAL --- */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Calendar size={20}/></div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Afluencia Semanal</h2>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.porSemana}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:11, fontWeight:'bold'}} interval="preserveStartEnd" />
                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:12}} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{borderRadius: '12px'}} />
                        <Area type="monotone" dataKey="total" stroke="#475569" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Estadisticas;