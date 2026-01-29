import React, { useState } from 'react';
import { PadronTable } from '../components/PadronTable'; 
import { AtendidosService } from '../services/atendidosService'; 
import { ShieldCheck, FileSpreadsheet, Loader2, Database } from 'lucide-react';
import { DetailModal } from '../components/DetailModal'; // <--- 1. IMPORTAR MODAL

export const Padron = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 
  const [selectedItem, setSelectedItem] = useState(null); // <--- 2. ESTADO DEL MODAL

  const handleGenerarReporte = async () => {
    const confirmado = window.confirm(
      "¿Generar reporte actualizado en Google Sheets?\n\n" +
      "⚠️ IMPORTANTE: Esto borrará el contenido actual del archivo Excel y escribirá toda la base de datos fresca."
    );

    if (!confirmado) return;

    try {
      setIsSyncing(true);
      
      const resultado = await AtendidosService.generarReporte(); 

      if (resultado.ok && resultado.url) {
        window.open(resultado.url, '_blank');
        window.alert(`¡Reporte Generado!\nSe exportaron ${resultado.total || 'todos los'} registros correctamente.`);
        setRefreshKey(prev => prev + 1); 
      } else {
        window.alert(resultado.message || "No se pudo generar el reporte.");
      }

    } catch (error) {
      console.error("Error reporte:", error);
      window.alert("Error.\nHubo un problema al generar el archivo. Intenta de nuevo.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 3. CERRAR MODAL Y REFRESCAR ---
  const handleCloseModal = () => {
    setSelectedItem(null);
    setRefreshKey(prev => prev + 1); // Refresca por si hubo cambios en el modal
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* HEADER */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

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

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
            
            <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold select-none">
                <ShieldCheck size={14} className="text-emerald-500"/>
                <span>Conexión Segura</span>
            </div>

            <button 
                onClick={handleGenerarReporte}
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
                <span>{isSyncing ? 'Generando Excel...' : 'Generar Reporte Padrón'}</span>
            </button>
          </div>
        </header>

        <div className="h-[calc(100vh-18rem)] w-full relative z-0">
          {/* 4. PASAR EL HANDLER A LA TABLA */}
          <PadronTable 
             key={refreshKey} 
             onViewDetails={setSelectedItem} 
          />
        </div>

      </div>

      {/* 5. MODAL FUERA DE LA ESTRUCTURA (Para arreglar z-index) */}
      {selectedItem && (
        <DetailModal 
            item={selectedItem} 
            onClose={handleCloseModal} 
            initialTab="padron" 
        />
      )}
    </div>
  );
};

export default Padron;