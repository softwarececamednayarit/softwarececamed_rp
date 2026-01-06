import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// 1. IMPORTAMOS EL SERVICIO
import { loginRequest } from '../services/authService';
import { Fingerprint, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import logoCecamed from '../assets/images/logoCecamed.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 2. USAMOS EL SERVICIO EN LUGAR DEL FETCH DIRECTO
      const data = await loginRequest(email, password);

      // Si no lanza error, el login fue exitoso
      login(data.token, data.user); 
      
    } catch (error) {
      // 3. CAPTURAMOS EL ERROR DEL SERVICIO
      console.error("Error de autenticación", error);
      // error.message viene del throw new Error(...) del servicio
      setError(error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header con el Logo Oficial */}
        <div className="bg-slate-900 p-8 pt-10 text-center relative overflow-hidden">
          
          <div className="absolute top-0 right-0 opacity-5 translate-x-1/3 -translate-y-1/3 pointer-events-none">
            <Fingerprint size={200} color="white" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-full mb-5 shadow-xl shadow-slate-900/20">
              <img 
                src={logoCecamed} 
                alt="Logo CECAMED Nayarit"
                className="w-28 h-28 object-contain"
              />
            </div>

            <h1 className="text-xl font-black text-white tracking-tight">
              Sistema de Gestión
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Acceso Administrativo
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-10 pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-rose-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  placeholder="usuario@cecamed.gob.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Autenticando...
                </>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-400 font-medium">
               Comisión Estatal de Conciliación y Arbitraje Médico
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;