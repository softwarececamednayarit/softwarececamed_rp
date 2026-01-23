import React from 'react';
import { PadronTable } from '../components/PadronTable'; // <-- Ajusta la ruta según donde guardaste el componente anterior
import { Database, ShieldCheck } from 'lucide-react';

export const Padron = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 fade-in animate-in">
      
      {/* --- ENCABEZADO DE LA PÁGINA --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Padrón de Beneficiarios
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Gestión y consulta de los beneficiarios registrados en el sistema.
          </p>
        </div>

        {/* Puedes agregar botones de acción global aquí si los necesitas en el futuro (ej. Exportar Excel) */}
        <div className="hidden md:block">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-500"/>
                Acceso Seguro: Edición Habilitada
            </div>
        </div>
      </div>
      {/* --- CONTENEDOR DE LA TABLA --- */}
      {/* Usamos h-[calc(100vh-theme(spacing.48))] para que la tabla ocupe 
          el resto de la altura de la pantalla y el scroll esté DENTRO de la tabla,
          no en toda la página.
      */}
      <div className="h-[calc(100vh-12rem)] w-full">
        <PadronTable />
      </div>

    </div>
  );
};

export default Padron;