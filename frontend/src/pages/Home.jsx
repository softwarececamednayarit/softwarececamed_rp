import React from 'react';
import { useAuth } from '../context/AuthContext';
import logoCecamed from '../assets/images/logoCecamed.png';
import { ShieldCheck, Navigation } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500 h-full flex flex-col justify-center min-h-[calc(100vh-6rem)]">
      
      {/* Gran Banner de Bienvenida Estilo Login */}
      <div className="w-full bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-900/10 overflow-hidden relative border border-slate-800 flex flex-col items-center justify-center text-center p-10 md:p-16">
        
        {/* Capa 1: Patrón de cuadrícula (Mismo del Login) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Capa 2: Degradado radial central (Mismo del Login) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#1e293b,transparent)]"></div>
        
        {/* Capa 3: Brillos en las esquinas */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-800/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
          
          {/* Logo en contenedor blanco idéntico al Login */}
          <div className="bg-white p-5 rounded-[2rem] shadow-2xl shadow-black/30 mb-8 transform transition-transform hover:scale-105 duration-500">
            <img 
              src={logoCecamed} 
              alt="Logo CECAMED" 
              className="w-28 h-28 object-contain" 
            />
          </div>

          <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-emerald-400" />
            <p className="text-slate-200 text-xs font-bold uppercase tracking-widest">
              Sistema Centralizado
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}
          </h1>
          
          <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed mb-10">
            Bienvenido al Sistema de Administración de Casos y Reportes Estadísticos de la Comisión Estatal de Conciliación y Arbitraje Médico.
          </p>

          {/* Indicador de navegación universal */}
          <div className="inline-flex items-center gap-3 text-indigo-300 bg-indigo-500/10 px-6 py-4 rounded-2xl border border-indigo-500/20">
            <Navigation size={20} className="animate-pulse" />
            <span className="font-semibold text-sm">
              Utiliza el menú lateral para acceder a los módulos de tu perfil.
            </span>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Home;