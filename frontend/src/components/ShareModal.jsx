// frontend/src/components/ShareModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

// 1. Importación nombrada (como en tu página de Usuarios)
import { getAllUsersRequest } from '../services/authService';
import archivosService from '../services/archivosService';

const ShareModal = ({ isOpen, onClose, archivo }) => {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Cargar usuarios y permisos actuales al abrir
  useEffect(() => {
    if (isOpen && archivo) {
      fetchUsers();
      // Cargamos los IDs que ya tienen acceso
      setSelectedIds(archivo.permisos || []);
    }
  }, [isOpen, archivo]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Usamos la misma función que en Usuarios.jsx
      const data = await getAllUsersRequest();
      
      // Filtramos para no mostrar al dueño del archivo en la lista de compartir
      // (El dueño siempre tiene acceso implícito o por su ID fijo)
      setUsers(data.filter(u => u.id !== archivo.propietarioId));
    } catch (error) {
      toast.error("Error al cargar la lista de usuarios");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Actualizando accesos...");
    try {
      // Enviamos el arreglo actualizado de IDs al backend
      const response = await archivosService.actualizarPermisos(archivo.id, selectedIds);
      if (response.success) {
        toast.success("Permisos actualizados", { id: toastId });
        onClose();
      }
    } catch (error) {
      toast.error("No se pudieron guardar los cambios", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Filtrado idéntico al de tu página de Usuarios
  const filteredUsers = users.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] font-sans">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200"><UserPlus size={20} /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Compartir Archivo</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestionar accesos individuales</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          {/* Buscador de usuarios */}
          <div className="p-4 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-10 gap-3">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando personal...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-medium">No se encontraron usuarios.</div>
            ) : filteredUsers.map(user => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <button 
                  key={user.id} 
                  onClick={() => toggleUser(user.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isSelected ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.nombre?.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{user.nombre}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.role || 'General'}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;