import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, ShieldCheck } from 'lucide-react';

// Modal para crear/editar usuarios desde el panel de administración.
// Props:
// - isOpen: boolean para mostrar/ocultar
// - onClose: función para cerrar el modal
// - onSubmit: callback con los datos del formulario
// - userToEdit: objeto opcional para edición (si se pasa, el modal está en modo editar)
// Nota: usa `permises` (como en backend) para gestionar accesos por módulo.

// 1. Módulos disponibles que coinciden con tu Sidebar
const MODULOS_SISTEMA = [
  { id: 'atendidos', label: 'Atendidos' },
  { id: 'recepcion', label: 'Recepción' },
  { id: 'padron', label: 'Padrón' },
  { id: 'gestion', label: 'Gestión' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'bitacora', label: 'Bitácora' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'sitios', label: 'Sitios' }
];

const UserModal = ({ isOpen, onClose, onSubmit, userToEdit = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: '',
    permises: [] // Nomenclatura en inglés para tu backend
  });

  // Efecto para cargar datos al editar o limpiar al crear
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          nombre: userToEdit.nombre || '',
          email: userToEdit.email || '',
          role: userToEdit.role || '',
          password: '', // Password siempre vacío en edición
          permises: Array.isArray(userToEdit.permises) ? userToEdit.permises : []
        });
      } else {
        setFormData({
          nombre: '',
          email: '',
          password: '',
          role: 'Operativo',
          permises: ['atendidos', 'sitios'] // Permisos base por defecto
        });
      }
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador de selección de permisos
  const handlePermissionChange = (moduloId) => {
    setFormData(prev => {
      const nuevosPermisos = prev.permises.includes(moduloId)
        ? prev.permises.filter(p => p !== moduloId)
        : [...prev.permises, moduloId];
      
      return { ...prev, permises: nuevosPermisos };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isEditing = !!userToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER DEL MODAL */}
        <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-800 tracking-tight">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Fila 1: Nombre y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nombre Completo</label>
              <input 
                type="text" name="nombre" required value={formData.nombre}
                className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none border transition-all"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Correo Electrónico</label>
              <input 
                type="email" name="email" required value={formData.email}
                className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none border transition-all"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Fila 2: Password (Solo creación) y Rol (Siempre visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isEditing && (
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Contraseña Inicial</label>
                <input 
                  type="text" name="password" required placeholder="Ej: Cecamed2026"
                  className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none border transition-all"
                  onChange={handleChange}
                />
              </div>
            )}
            
            {/* El Puesto/Rol ocupa todo el ancho si estamos editando */}
            <div className={isEditing ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Puesto / Rol Personalizado</label>
              <input 
                type="text" 
                name="role" 
                required 
                placeholder="Ej: Administrador, Jefe de Área..."
                value={formData.role} 
                onChange={handleChange}
                className="w-full border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none border transition-all bg-white font-bold text-slate-700"
              />
            </div>
          </div>

          {/* SECCIÓN DE PERMISOS DINÁMICOS */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase mb-3 ml-1">
              <ShieldCheck size={16} className="text-indigo-500" />
              Módulos Permitidos (Accesos)
            </label>
            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              {MODULOS_SISTEMA.map((mod) => (
                <label 
                  key={mod.id} 
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                    formData.permises.includes(mod.id) 
                      ? 'bg-white border-indigo-200 shadow-sm' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={formData.permises.includes(mod.id)}
                    onChange={() => handlePermissionChange(mod.id)}
                  />
                  <span className={`text-[11px] font-bold ${formData.permises.includes(mod.id) ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {mod.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 font-bold text-sm flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              {isEditing ? <Save size={18}/> : <UserPlus size={18}/>}
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;