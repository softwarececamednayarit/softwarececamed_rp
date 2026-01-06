import React from 'react';
import { ExternalLink, Globe, FileSpreadsheet, Building2, ClipboardList, ArrowRight, Scale } from 'lucide-react';

const sitios = [
  {
    titulo: "Bitácora de Registro",
    descripcion: "Acceso directo a la hoja de cálculo de Google para el control interno de registros.",
    url: "https://docs.google.com/spreadsheets/d/1CxnNaIDN5lvRVExeCNlJmu8vOLmKvUOhgPi6gulLTPY/edit?usp=sharing",
    icon: <FileSpreadsheet size={24} className="text-white" />,
    color: "bg-emerald-500" // Verde estilo Excel/Sheets
  },
  {
    titulo: "Portal del Estado (SIREMED)",
    descripcion: "Sistema de Registro de Quejas Médicas y Gestión (Plataforma Estatal).",
    url: "https://comisionestatal.conamed.gob.mx/app/siremed/index.php?paginaDestino=login.php&paginaAlto=700px&paginaAncho=1400px",
    icon: <Building2 size={24} className="text-white" />,
    color: "bg-slate-700" // Gris serio institucional
  },
  {
    titulo: "CECAMED Nayarit",
    descripcion: "Página oficial de la Comisión Estatal de Conciliación y Arbitraje Médico de Nayarit.",
    url: "https://cecamed.nayarit.gob.mx/",
    icon: <Globe size={24} className="text-white" />,
    color: "bg-indigo-600" // Azul institucional
  },
  {
    titulo: "Encuesta de Inicio de Atención",
    descripcion: "Formulario para evaluar el área de atención que requiere el usuario.",
    url: "https://forms.gle/2L7mqJUaGWJV3wtf8",
    icon: <ClipboardList size={24} className="text-white" />,
    color: "bg-purple-500" // Morado estilo Google Forms
  },
  {
    titulo: "CONAMED Nacional",
    descripcion: "Comisión Nacional de Arbitraje Médico. Marco normativo federal.",
    url: "https://www.gob.mx/conamed",
    icon: <Scale size={24} className="text-white" />, // Balanza para arbitraje/justicia
    color: "bg-amber-600"
  },
];

const SitiosInteres = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">
        
        {/* Encabezado */}
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Sitios de Interés
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Accesos directos a plataformas de gestión y consulta.
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitios.map((sitio, index) => (
            <a 
              key={index}
              href={sitio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl shadow-lg ${sitio.color} shadow-current/20 transition-transform group-hover:scale-110 duration-300`}>
                  {sitio.icon}
                </div>
                <ExternalLink className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {sitio.titulo}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                {sitio.descripcion}
              </p>
              
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Ir al sitio <ArrowRight size={14} />
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SitiosInteres;