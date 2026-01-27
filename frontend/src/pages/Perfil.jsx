import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest } from '../services/authService'; 
import { Mail, Shield, Key, Clock, Fingerprint, X, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, UserCog, User, Lock } from 'lucide-react';

const Perfil = () => {
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // --- HELPERS ---
  const getInitials = (name) => {
    if (!name) return "US";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: '' });
  };

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
      await changePasswordRequest(
        user.email,
        formData.currentPassword,
        formData.newPassword
      );

      setStatus({ loading: false, error: '', success: '¡Contraseña actualizada correctamente!' });
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPassword({ current: false, new: false, confirm: false });
        setStatus({ loading: false, error: '', success: '' });
      }, 2000);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: '' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-8">
        
        {/* --- HEADER TIPO TARJETA (Idéntico al de Sitios de Interés) --- */}
        <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
                <UserCog size={24} /> 
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Mi Perfil
              </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <p className="text-slate-500 font-medium text-sm">
                Información de la cuenta y credenciales de acceso.
              </p>
            </div>
          </div>
        </header>

        {/* --- GRID DE CONTENIDO (Adaptado para llenar el ancho) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* COLUMNA 1: IDENTIDAD (Tarjeta Vertical) */}
            <div className="xl:col-span-1 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
                <div className="h-32 bg-slate-900 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-slate-900"></div>
                    <div className="absolute right-0 top-0 opacity-10 p-4"><Fingerprint size={120} color="white"/></div>
                </div>
                
                <div className="px-8 pb-8 flex-1 flex flex-col items-center -mt-16 relative z-10">
                    <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-2xl shadow-slate-900/10 mb-4">
                        <div className="h-full w-full rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-4xl tracking-wider">
                            {getInitials(user?.nombre)}
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 text-center leading-tight mb-1">{user?.nombre || "Usuario"}</h2>
                    <p className="text-slate-500 font-medium text-sm mb-4">{user?.email}</p>

                    <div className="flex gap-2 mb-8">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-lg border border-indigo-100">
                            {user?.role || "Admin"}
                        </span>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-lg border border-emerald-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                        </span>
                    </div>

                    <div className="w-full border-t border-slate-100 pt-6 mt-auto">
                        <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-slate-400 font-medium flex items-center gap-2"><Fingerprint size={16}/> ID Usuario</span>
                            <span className="font-mono text-slate-700 font-bold bg-slate-50 px-2 py-1 rounded">{user?.id || "UID-000"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium flex items-center gap-2"><Clock size={16}/> Sesión</span>
                            <span className="text-emerald-600 font-bold">En línea</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA 2: DETALLES Y ACCIONES (Ocupa 2/3 del ancho) */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Sección de Datos Personales */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><User size={18} /></div>
                        Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nombre Completo</label>
                            <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm">
                                {user?.nombre || "No registrado"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Correo Electrónico</label>
                            <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-3">
                                <Mail size={16} className="text-slate-400"/>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Seguridad */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Lock size={18} /></div>
                                Seguridad y Contraseña
                            </h3>
                            <p className="text-slate-500 text-sm max-w-md">
                                Para mantener su cuenta segura, recomendamos actualizar su contraseña periódicamente.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Key size={16} /> Cambiar Contraseña
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* --- MODAL (Diseño Limpio) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-xl text-slate-900">Seguridad</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Actualizar Credenciales</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <X size={18} />
                </button>
            </div>

            <div className="p-8">
                {status.error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100">
                        <AlertCircle size={16} /> {status.error}
                    </div>
                )}
                {status.success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100">
                        <CheckCircle size={16} /> {status.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {['currentPassword', 'newPassword', 'confirmPassword'].map((field, idx) => (
                        <div key={field}>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                                {idx === 0 ? 'Contraseña Actual' : idx === 1 ? 'Nueva Contraseña' : 'Confirmar Nueva'}
                            </label>
                            <div className="relative group">
                                <input 
                                    type={showPassword[field.replace('Password', '') || 'current'] ? "text" : "password"} 
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all group-hover:border-slate-300"
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button type="button" onClick={() => toggleVisibility(field.replace('Password', '') || 'current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    {showPassword[field.replace('Password', '') || 'current'] ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" disabled={status.loading || status.success} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 transition-all">
                            {status.loading ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;