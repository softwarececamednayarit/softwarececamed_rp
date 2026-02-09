import React, { useEffect, useState } from 'react';
import { getBitacoraRequest } from '../services/bitacoraService';
import { Shield, RefreshCw, Clock, User, Search, Database, AlertCircle, FileText } from 'lucide-react';

const Bitacora = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Estado para animación del botón
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos
  const fetchLogs = async () => {
    setIsRefreshing(true); // Activa spinner del botón
    if (logs.length === 0) setLoading(true); // Solo pantalla de carga si no hay datos previos
    
    try {
      const data = await getBitacoraRequest();
      setLogs(data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrado simple en cliente
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.usuario_nombre || '').toLowerCase().includes(term) ||
      (log.accion || '').toLowerCase().includes(term) ||
      (log.modulo || '').toLowerCase().includes(term) ||
      (log.descripcion || '').toLowerCase().includes(term)
    );
  });

  // Helper de Colores según la acción
  const getActionStyle = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    if (act.includes('CREAR')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100';
    if (act.includes('EDITAR') || act.includes('ACTUALIZAR')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100';
    if (act.includes('ELIMINAR') || act.includes('BORRAR') || act.includes('DESCARTAR')) return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
    if (act.includes('ERROR') || act.includes('DENEGADO')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
    if (act.includes('EXPORTAR') || act.includes('MIGRAR')) return 'bg-violet-50 text-violet-700 border-violet-200 ring-violet-100';
    
    return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100';
  };

  // Helper para formatear fecha
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* --- 1. HEADER MODERNO (Igual a Gestión) --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Shield size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Bitácora de Sistema
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-slate-500 font-medium text-sm">
                Registro de auditoría y seguridad en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
             {/* Buscador Integrado en Header (Opcional, o lo dejamos abajo) */}
             
             <button 
                onClick={fetchLogs} 
                disabled={isRefreshing}
                className={`
                    group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-70
                `}
            >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
                <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Tabla'}</span>
            </button>
          </div>
        </header>

        {/* --- 2. BUSCADOR FLOTANTE --- */}
        <div className="relative max-w-lg group mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Buscar por usuario, acción, módulo o detalle..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 transition-all placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* --- 3. TABLA CON ESTILO --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                            {['Fecha / Hora', 'Usuario', 'Acción', 'Módulo', 'Descripción'].map((h, i) => (
                                <th key={i} className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 first:pl-10 last:pr-10 bg-slate-50/80">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold animate-pulse">Cargando registros...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <div className="p-5 bg-slate-100 rounded-full text-slate-400">
                                            <Database size={40} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-900 font-bold text-lg">Sin resultados</p>
                                            <p className="text-slate-500 text-sm">No se encontraron registros con ese criterio.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => {
                                const badgeStyle = getActionStyle(log.accion);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                                        
                                        {/* FECHA */}
                                        <td className="px-8 py-5 whitespace-nowrap first:pl-10 align-top">
                                            <div className="flex items-center gap-3 text-slate-500 mt-1">
                                                <Clock size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-xs font-bold font-mono text-slate-600">
                                                    {formatDate(log.fecha)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* USUARIO */}
                                        <td className="px-8 py-5 whitespace-nowrap align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold shrink-0 mt-0.5">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700">{log.usuario_nombre}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{log.usuario_rol}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ACCIÓN */}
                                        <td className="px-8 py-5 whitespace-nowrap align-top">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-wide border ring-1 ring-inset ${badgeStyle}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.split(' ')[0].replace('bg-', 'bg-current ')} opacity-50`}></span>
                                                {log.accion}
                                            </span>
                                        </td>

                                        {/* MÓDULO */}
                                        <td className="px-8 py-5 whitespace-nowrap align-top">
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                                    {log.modulo}
                                                </span>
                                            </div>
                                        </td>

                                        {/* DESCRIPCIÓN */}
                                        <td className="px-8 py-5 last:pr-10 align-top">
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed max-w-md">
                                                {log.descripcion}
                                            </p>
                                            
                                            {/* Detalles Técnicos */}
                                            {log.detalles && Object.keys(log.detalles).length > 0 && (
                                                <div className="mt-2.5">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-md group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                                        <FileText size={10} className="text-slate-400" />
                                                        <code className="text-[9px] text-slate-500 font-mono truncate max-w-xs block">
                                                            {JSON.stringify(log.detalles).replace(/"/g, '').replace(/{|}/g, '')}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Bitacora;