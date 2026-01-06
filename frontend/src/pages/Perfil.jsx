import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// 1. IMPORTAR EL SERVICIO
import { changePasswordRequest } from '../services/authService'; 
import { Mail, Shield, Key, Clock, Fingerprint, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  
  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  // Helpers
  const getInitials = (name) => {
    if (!name) return "US";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: '' });
  };

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ loading: false, error: 'Las nuevas contraseñas no coinciden', success: '' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setStatus({ loading: false, error: 'Mínimo 6 caracteres', success: '' });
      return;
    }

    try {
      // Usamos el servicio externo
      await changePasswordRequest(
        user.email,
        formData.currentPassword,
        formData.newPassword
      );

      setStatus({ loading: false, error: '', success: '¡Contraseña actualizada correctamente!' });
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setStatus({ loading: false, error: '', success: '' });
      }, 2000);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: '' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 space-y-8">
        
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Mi Perfil
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Información de la cuenta y credenciales.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
          <div className="h-32 bg-slate-900 w-full relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 translate-x-10 -translate-y-10">
                <Fingerprint size={200} color="white" />
             </div>
          </div>

          <div className="px-8 pb-8 relative z-10 bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
              <div className="h-24 w-24 rounded-full bg-white p-1.5 shadow-lg">
                <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-2xl tracking-wider">
                  {getInitials(user?.nombre)}
                </div>
              </div>
              <div className="flex-1 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{user?.nombre || "Usuario"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-200">
                    {user?.role || "Administrador"}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                    <Clock size={12} /> Activo ahora
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-slate-100 pt-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Datos de Contacto</h3>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Mail size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Correo Institucional</p>
                    <p className="text-slate-900 font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Shield size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">ID de Usuario</p>
                    <p className="text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{user?.id || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Seguridad</h3>
                
                <div 
                  onClick={() => setIsModalOpen(true)}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-100 transition-all group cursor-pointer active:scale-95"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><Key size={18} /></div>
                        <span className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Contraseña</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">Cambiar</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-12">
                    Haga clic aquí para actualizar su contraseña de forma segura.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900">Cambiar Contraseña</h3>
              <p className="text-slate-500 text-sm">Ingrese su contraseña actual para validar.</p>
            </div>

            {status.error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100">
                <AlertCircle size={16} /> {status.error}
              </div>
            )}
            {status.success && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100">
                <CheckCircle size={16} /> {status.success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Contraseña Actual</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Confirmar Nueva</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={status.loading || status.success}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status.loading ? <Loader2 className="animate-spin" size={18} /> : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;