import React, { useState } from 'react';
import { PadronTable } from '../components/PadronTable'; 
import { AtendidosService } from '../services/atendidosService'; 
import { ShieldCheck, FileSpreadsheet, Loader2 } from 'lucide-react';

export const Padron = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const handleSincronizar = async () => {
    // 1. Confirmación nativa (window.confirm)
    // Devuelve true si le dan a "Aceptar", false si le dan a "Cancelar"
    const confirmado = window.confirm(
      "¿Estás seguro de sincronizar con Google Sheets?\n\n" +
      "Se buscarán expedientes PENDIENTES que tengan la información completa y se subirán a la nube."
    );

    // Si le dio cancelar, nos salimos
    if (!confirmado) return;

    try {
      setIsSyncing(true);

      const resultado = await AtendidosService.exportarPadron();

      if (resultado.processed_count > 0) {
        // 2. Alerta de Éxito nativa
        window.alert(`¡Éxito!\nSe subieron ${resultado.processed_count} expedientes nuevos.`);
        setRefreshKey(prev => prev + 1);
      } else {
        // 3. Alerta de Info nativa
        window.alert("Sin cambios.\nNo se encontraron expedientes pendientes que estuvieran completos.");
      }

    } catch (error) {
      console.error("Error sync:", error);
      // 4. Alerta de Error nativa
      window.alert("Error.\nHubo un problema al conectar con el servidor. Revisa la consola.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 fade-in animate-in">
      
      {/* --- ENCABEZADO --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Padrón de Beneficiarios
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Gestión y consulta de los beneficiarios registrados en el sistema.
          </p>
        </div>

        {/* --- BOTONES --- */}
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            
            <button 
                onClick={handleSincronizar}
                disabled={isSyncing}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all
                    ${isSyncing 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95'}
                `}
            >
                {isSyncing ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={20} />
                )}
                {isSyncing ? 'Procesando...' : 'Sincronizar Sheets'}
            </button>

            <div className="hidden md:block h-full">
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500 shadow-sm h-full">
                    <ShieldCheck size={16} className="text-emerald-500"/>
                    Acceso Seguro
                </div>
            </div>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="h-[calc(100vh-12rem)] w-full">
        <PadronTable key={refreshKey} />
      </div>

    </div>
  );
};

export default Padron;