import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, Fingerprint, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal con el fondo oscuro, grid y degradado radial (Colores de antes)
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Capa 1: Patrón de cuadrícula sutil (Grid pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Capa 2: Degradado radial para dar profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#1e293b,transparent)]"></div>
      
      {/* Capa 3: Toque de color institucional sutil en las esquinas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-800/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Tarjeta dividida en 2 columnas (Estructura Nueva) */}
      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-black/40 flex flex-col md:flex-row overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Sección Izquierda - Branding Institucional (Recuperando el fondo oscuro y la huella) */}
        <div className="w-full md:w-1/2 bg-slate-900 p-12 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[400px]">
          
          {/* Decoración de huella */}
          <div className="absolute -left-16 -bottom-16 opacity-5 pointer-events-none rotate-12">
            <Fingerprint size={350} color="white" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-black/40 mb-8">
            <img src={logoCecamed} alt="Logo CECAMED" className="w-28 h-28 object-contain" />
          </div>
          
          <h1 className="relative z-10 text-4xl font-black text-white tracking-tight mb-4">
            CECA<span className="text-indigo-400">MED</span>
          </h1>
          
          <div className="relative z-10 flex items-center gap-2 mt-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-emerald-400" />
            <p className="text-slate-200 text-[10px] font-bold uppercase tracking-widest text-center leading-tight">
              Sistema Centralizado de Administración
            </p>
          </div>
        </div>

        {/* Sección Derecha - Formulario de Acceso (Estructura Limpia) */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium mb-8">Ingresa tus credenciales para continuar.</p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="text-rose-500" size={24} />
                <p className="text-sm font-bold text-rose-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Correo Electrónico</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="usuario@cecamed.gob.mx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Botón con el estilo oscuro de antes */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 mt-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Validando...
                  </>
                ) : (
                  <>
                    Ingresar al Sistema
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;