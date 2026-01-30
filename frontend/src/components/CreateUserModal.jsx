import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

// Ahora recibimos "userToEdit"
const UserModal = ({ isOpen, onClose, onSubmit, userToEdit = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'operativo'
  });

  // EFECTO MAGICO: Cuando el modal se abre...
  useEffect(() => {
    if (userToEdit) {
      // Si estamos editando, llenamos el formulario con los datos del usuario
      setFormData({
        nombre: userToEdit.nombre,
        email: userToEdit.email,
        role: userToEdit.role,
        password: '' // El password no se edita aquí, así que lo dejamos vacío
      });
    } else {
      // Si estamos creando, limpiamos todo
      setFormData({
        nombre: '',
        email: '',
        password: '',
        role: 'operativo'
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enviamos los datos al padre
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Título dinámico
  const isEditing = !!userToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre"
              required
              value={formData.nombre}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* OJO AQUÍ: El campo Password solo se muestra si NO estamos editando */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Inicial</label>
              <input 
                type="text" 
                name="password"
                required
                placeholder="Ej: Cecamed2026"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol de Usuario</label>
            <select 
              name="role" 
              value={formData.role}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              onChange={handleChange}
            >
              <option value="operativo">Operativo</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
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