import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const AdminResetPasswordModal = ({ isOpen, user, onClose, onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');
  const [requireChange, setRequireChange] = useState(true); // Marcado por defecto

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword, requireChange);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-amber-800">Restablecer Contraseña</h3>
          <button onClick={onClose} className="text-amber-800/50 hover:text-amber-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg flex gap-3 text-sm text-amber-800 mb-4">
            <AlertTriangle className="shrink-0" size={20} />
            <p>Estás cambiando la contraseña para <strong>{user.nombre}</strong>.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
            <input 
              type="text" 
              required
              placeholder="Nueva contraseña..."
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input 
              type="checkbox" 
              id="requireChange"
              className="mt-1 w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
              checked={requireChange}
              onChange={(e) => setRequireChange(e.target.checked)}
            />
            <label htmlFor="requireChange" className="text-sm text-slate-600 cursor-pointer select-none">
              Obligar al usuario a cambiar esta contraseña en su próximo inicio de sesión.
            </label>
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
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPasswordModal;