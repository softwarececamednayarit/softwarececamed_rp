import React from 'react';
import { ExternalLink, Globe, FileSpreadsheet, Building2, ClipboardList, ArrowRight, Scale, Link2, Briefcase } from 'lucide-react';

const sitios = [
  {
    titulo: "Bitácora de Registro de Beneficiarios",
    descripcion: "Acceso directo a la hoja de cálculo de Google para el control interno de registros.",
    url: "https://docs.google.com/spreadsheets/d/1CxnNaIDN5lvRVExeCNlJmu8vOLmKvUOhgPi6gulLTPY/edit?usp=sharing",
    icon: <FileSpreadsheet size={24} className="text-white" />,
    color: "bg-emerald-500" 
  },
  {
    titulo: "Portal del Estado (SIREMED)",
    descripcion: "Sistema de Registro de Quejas Médicas y Gestión (Plataforma Estatal).",
    url: "https://comisionestatal.conamed.gob.mx/app/siremed/index.php?paginaDestino=login.php&paginaAlto=700px&paginaAncho=1400px",
    icon: <Building2 size={24} className="text-white" />,
    color: "bg-slate-700" 
  },
  {
    titulo: "CECAMED Nayarit",
    descripcion: "Página oficial de la Comisión Estatal de Conciliación y Arbitraje Médico de Nayarit.",
    url: "https://cecamed.nayarit.gob.mx/",
    icon: <Globe size={24} className="text-white" />,
    color: "bg-indigo-600" 
  },
  {
    titulo: "Encuesta de Inicio de Atención",
    descripcion: "Formulario para evaluar el área de atención que requiere el usuario.",
    url: "https://forms.gle/2L7mqJUaGWJV3wtf8",
    icon: <ClipboardList size={24} className="text-white" />,
    color: "bg-purple-500" 
  },
  // {
  //   titulo: "CONAMED Nacional",
  //   descripcion: "Comisión Nacional de Arbitraje Médico. Marco normativo federal.",
  //   url: "https://www.gob.mx/conamed",
  //   icon: <Scale size={24} className="text-white" />, 
  //   color: "bg-amber-600"
  // },
  {
    titulo: "Padrón de Beneficiarios",
    descripcion: "Acceso al padrón de beneficiarios trimestral del Programa de Atención Médica.",
    url: "https://docs.google.com/spreadsheets/d/1s-c5_tQp2R0bxxCbmGvMEXdDx0ci-4E-08sLa4Ln9Ko/edit?usp=drive_link",
    icon: <FileSpreadsheet size={24} className="text-white" />, 
    color: "bg-teal-500"
  },
  {
    titulo: "Registro Clásico de Beneficiarios",
    descripcion: "Acceso al registro clásico de beneficiarios del Programa de Atención Médica en el formato antiguo.",
    url: "https://docs.google.com/spreadsheets/d/1mc8Ad07ikytOBLyMC7HqIYS4sxM1s4WbCVBzch5Y8Q4/edit?usp=drive_link",
    icon: <Briefcase size={24} className="text-white" />, 
    color: "bg-rose-500"
  }
];

const SitiosInteres = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* --- HEADER TIPO TARJETA --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <Link2 size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Sitios de Interés
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              <p className="text-slate-500 font-medium text-sm">
                Accesos directos a plataformas de gestión y consulta.
              </p>
            </div>
          </div>
        </header>

        {/* --- GRID DE TARJETAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          {sitios.map((sitio, index) => (
            <a 
              key={index}
              href={sitio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 flex flex-col h-full"
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