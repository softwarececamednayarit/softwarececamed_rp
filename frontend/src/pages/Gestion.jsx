import React, { useState } from 'react';
import { GestionTable } from '../components/GestionTable'; // Asegúrate de tener este archivo creado
import { AtendidosService } from '../services/atendidosService'; 
import { ShieldCheck, FileSpreadsheet, Loader2, Briefcase } from 'lucide-react';

export const Gestion = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const handleSincronizar = async () => {
    // 1. Confirmación
    const confirmado = window.confirm(
      "¿Estás seguro de sincronizar los expedientes de GESTIÓN con Google Sheets?\n\n" +
      "Se subirán los registros pendientes a la base de datos en la nube."
    );

    if (!confirmado) return;

    try {
      setIsSyncing(true);

      // NOTA: Aquí asumo que usas el mismo servicio de exportación. 
      // Si creas uno específico para Gestión (ej. exportarGestion), cámbialo aquí.
      const resultado = await AtendidosService.exportarPadron(); 

      if (resultado.processed_count > 0) {
        window.alert(`¡Éxito!\nSe actualizaron ${resultado.processed_count} registros de gestión.`);
        setRefreshKey(prev => prev + 1); // Recarga la tabla
      } else {
        window.alert("Sin cambios.\nNo hay expedientes nuevos pendientes de sincronizar.");
      }

    } catch (error) {
      console.error("Error sync:", error);
      window.alert("Error.\nHubo un problema al conectar con el servidor.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 fade-in animate-in">
      
      {/* --- ENCABEZADO --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 hidden sm:block">
                <Briefcase size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Gestión y Quejas
            </h1>
          </div>
          <p className="text-slate-500 text-lg font-medium pl-1 sm:pl-14">
            Clasificación técnica, seguimiento y registro administrativo.
          </p>
        </div>

        {/* --- BOTONES --- */}
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            
            <button 
                onClick={handleSincronizar}
                disabled={isSyncing}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all
                    ${isSyncing 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95'}
                `}
            >
                {isSyncing ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={20} />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Sheets'}
            </button>

            <div className="hidden md:block h-full">
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500 shadow-sm h-full">
                    <ShieldCheck size={16} className="text-indigo-500"/>
                    Acceso Seguro
                </div>
            </div>
        </div>
      </div>

      <div className="h-[calc(100vh-14rem)] w-full">
        <GestionTable key={refreshKey} />
      </div>

    </div>
  );
};

export default Gestion;