import React, { useState } from 'react';
import { GestionTable } from '../components/GestionTable'; 
import { AtendidosService } from '../services/atendidosService'; 
import { ShieldCheck, FileSpreadsheet, Loader2, Briefcase } from 'lucide-react';
import { DetailModal } from '../components/DetailModal'; // <--- 1. IMPORTAR MODAL

export const Gestion = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [selectedItem, setSelectedItem] = useState(null); // <--- 2. ESTADO DEL MODAL

  // --- FUNCIÓN DE SINCRONIZACIÓN ---
  const handleSincronizar = async () => {
    const confirmado = window.confirm(
      "¿Generar el Registro Clásico en Google Sheets?\n\n" +
      "⚠️ ESTO SOBRESCRIBIRÁ EL ARCHIVO.\n" +
      "Se ordenarán los expedientes por fecha y se asignarán folios consecutivos automáticamente (G-XX, Q-XX)."
    );

    if (!confirmado) return;

    try {
      setIsSyncing(true);
      
      const resultado = await AtendidosService.generarReporteClasico(); 

      if (resultado.ok && resultado.url) {
        window.open(resultado.url, '_blank');
        window.alert(`¡Éxito!\nSe generó el registro con ${resultado.count} expedientes y folios asignados.`);
        setRefreshKey(prev => prev + 1); 
      } else {
        window.alert(resultado.message || "No se pudo generar el reporte.");
      }

    } catch (error) {
      console.error("Error sync:", error);
      window.alert("Error.\nHubo un problema al conectar con el servidor.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 3. CERRAR MODAL Y REFRESCAR ---
  const handleCloseModal = () => {
    setSelectedItem(null);
    setRefreshKey(prev => prev + 1); // Refresca la tabla por si editaste algo en el modal
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Briefcase size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Gestión y Quejas
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <p className="text-slate-500 font-medium text-sm">
                Clasificación técnica y seguimiento.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
            <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold select-none">
                <ShieldCheck size={14} className="text-indigo-500"/>
                <span>Conexión Segura</span>
            </div>

            <button 
                onClick={handleSincronizar}
                disabled={isSyncing}
                className={`
                    group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none
                    ${isSyncing 
                        ? 'bg-slate-400 shadow-slate-200' 
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}
                `}
            >
                {isSyncing ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <FileSpreadsheet size={18} className="transition-transform group-hover:-translate-y-0.5" />
                )}
                <span>{isSyncing ? 'Generando Excel...' : 'Generar Registro'}</span>
            </button>
          </div>
        </header>

        <div className="h-[calc(100vh-18rem)] w-full relative z-0">
          {/* 4. PASAR EL HANDLER A LA TABLA */}
          <GestionTable 
            key={refreshKey} 
            onViewDetails={setSelectedItem} 
          />
        </div>

      </div>

      {/* 5. MODAL FUERA DE LA ESTRUCTURA DE LA TABLA (Arregla el z-index) */}
      {selectedItem && (
        <DetailModal 
            item={selectedItem} 
            onClose={handleCloseModal} 
            initialTab="padron" // Abre directo en la pestaña de edición
        />
      )}
    </div>
  );
};

export default Gestion;