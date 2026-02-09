import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../services/authService';
import { Fingerprint, Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user); 
    } catch (error) {
      console.error("Error de autenticación", error);
      setError(error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal con el nuevo fondo llamativo pero formal
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900">
      
      {/* --- NUEVO FONDO --- */}
      {/* Capa 1: Patrón de cuadrícula sutil (Grid pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Capa 2: Degradado radial para dar profundidad y centrar la atención */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#1e293b,transparent)]"></div>
      
      {/* Capa 3: Toque de color institucional sutil en las esquinas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-800/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
      </div>
      {/* ------------------ */}


      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden border border-slate-100 relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Header con el Logo Oficial */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          
          {/* Decoración de huella */}
          <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none rotate-12">
            <Fingerprint size={240} color="white" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-4 rounded-[2rem] mb-6 shadow-2xl shadow-black/30">
              <img 
                src={logoCecamed} 
                alt="Logo CECAMED Nayarit"
                className="w-24 h-24 object-contain"
              />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">
              Bienvenido
            </h1>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={12} className="text-emerald-400" />
                <p className="text-slate-200 text-[10px] font-bold uppercase tracking-widest">
                Sistema de Administración de Casos y Reportes Estadísticos para Cecamed
                </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300 text-sm"
                  placeholder="usuario@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300 text-sm"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 group mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Validando...
                </>
              ) : (
                <>
                  Ingresar al Sistema 
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               Comisión Estatal de Conciliación y Arbitraje Médico
             </p>
             <p className="text-[10px] text-slate-300 mt-1">
               Nayarit, México
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;