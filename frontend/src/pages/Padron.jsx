import React, { useState } from 'react';
import { PadronTable } from '../components/PadronTable'; 
import { AtendidosService } from '../services/atendidosService'; 
import { ShieldCheck, FileSpreadsheet, Loader2, Database } from 'lucide-react';

export const Padron = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const handleSincronizar = async () => {
    const confirmado = window.confirm(
      "¿Estás seguro de sincronizar con Google Sheets?\n\n" +
      "Se buscarán expedientes PENDIENTES que tengan la información completa y se subirán a la nube."
    );

    if (!confirmado) return;

    try {
      setIsSyncing(true);
      const resultado = await AtendidosService.exportarPadron();

      if (resultado.processed_count > 0) {
        window.alert(`¡Éxito!\nSe subieron ${resultado.processed_count} expedientes nuevos.`);
        setRefreshKey(prev => prev + 1);
      } else {
        window.alert("Sin cambios.\nNo se encontraron expedientes pendientes que estuvieran completos.");
      }

    } catch (error) {
      console.error("Error sync:", error);
      window.alert("Error.\nHubo un problema al conectar con el servidor. Revisa la consola.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* --- HEADER TIPO TARJETA (Consistente con el anterior) --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Decoración de fondo (Esmeralda para diferenciar esta sección) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          {/* Título e Icono */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Database size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Padrón de Beneficiarios
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <p className="text-slate-500 font-medium text-sm">
                Gestión y validación para exportación.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
            
            {/* Badge de Seguridad */}
            <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold select-none">
                <ShieldCheck size={14} className="text-emerald-500"/>
                <span>Conexión Segura</span>
            </div>

            {/* Botón Principal */}
            <button 
                onClick={handleSincronizar}
                disabled={isSyncing}
                className={`
                    group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none
                    ${isSyncing 
                        ? 'bg-slate-400 shadow-slate-200' 
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}
                `}
            >
                {isSyncing ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={18} className="transition-transform group-hover:-translate-y-0.5" />
                )}
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Sheets'}</span>
            </button>
          </div>
        </header>

        <div className="h-[calc(100vh-18rem)] w-full relative z-0">
          <PadronTable key={refreshKey} />
        </div>

      </div>
    </div>
  );
};

export default Padron;