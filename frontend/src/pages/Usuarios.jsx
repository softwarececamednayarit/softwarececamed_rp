import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  Loader,
  Edit2
} from 'lucide-react';
import { 
  getAllUsersRequest, 
  toggleUserStatusRequest, 
  registerUserRequest, 
  updateUserRequest,
  adminResetPasswordRequest 
} from '../services/authService';

const MODULOS_SISTEMA = [
  { id: 'recepcion', label: 'Recepción' },
  { id: 'padron', label: 'Padrón' },
  { id: 'gestion', label: 'Gestión' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'bitacora', label: 'Bitácora' },
  { id: 'usuarios', label: 'Usuarios' }
];

// Asegúrate de que tu modal acepte la prop 'userToEdit' como vimos en el paso anterior
import CreateUserModal from '../components/CreateUserModal'; 
import AdminResetPasswordModal from '../components/AdminResetPasswordModal';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para los Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null); // Para el Reset Password
  const [editingUser, setEditingUser] = useState(null);   // <--- AGREGADO: Para saber a quién editamos

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsersRequest();
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Manejar Switch de Activo/Inactivo
  const handleToggleStatus = async (user) => {
    const nuevoEstado = !user.activo;
    const oldUsers = [...users];
    setUsers(users.map(u => u.id === user.id ? { ...u, activo: nuevoEstado } : u));

    try {
      await toggleUserStatusRequest(user.id, nuevoEstado);
    } catch (error) {
      toast.error('Error al cambiar estatus: ' + error.message);
      setUsers(oldUsers);
    }
  };

  // --- LÓGICA DE CREACIÓN / EDICIÓN ---

  // A. Abrir modal para CREAR
  const openCreateModal = () => {
    setEditingUser(null); // Limpiamos para que el modal sepa que es NUEVO
    setIsCreateModalOpen(true);
  };

  // B. Abrir modal para EDITAR
  const openEditModal = (user) => {
    setEditingUser(user); // Pasamos los datos actuales
    setIsCreateModalOpen(true);
  };

  // C. Guardar (Decide si crea o edita)
  const handleSaveUser = async (formData) => {
    try {
      if (editingUser) {
        // MODO EDICIÓN
        await updateUserRequest(editingUser.id, formData);
        toast('Usuario actualizado correctamente');
      } else {
        // MODO CREACIÓN
        await registerUserRequest(formData);
        toast('Usuario creado exitosamente');
      }
      
      await fetchUsers(); // Recargar tabla
      setIsCreateModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast(error.message);
    }
  };

  // 3. Manejar Reset de Contraseña
  const openResetModal = (user) => {
    setSelectedUser(user);
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (newPassword, requireChange) => {
    try {
      await adminResetPasswordRequest(selectedUser.id, newPassword, requireChange);
      setIsResetModalOpen(false);
      toast('Contraseña actualizada correctamente');
    } catch (error) {
      toast(error.message);
    }
  };

  // Filtrado
  const filteredUsers = users.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* --- HEADER TIPO TARJETA --- */}
      <header className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden mb-8">
        {/* Decoración de fondo (Degradado) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
              <Shield size={24} /> 
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Gestión de Usuarios
            </h1>
          </div>
          <div className="flex items-center gap-2 pl-1">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            <p className="text-slate-500 font-medium text-sm">
              Administra el acceso y roles del sistema CECAMED.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2.5 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </header>

      {/* FILTROS Y TABLA */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="pl-12 w-full bg-white border border-slate-200 rounded-xl py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4 text-center">Estatus</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-slate-800">{user.nombre}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  {/* En el tbody, dentro del map de usuarios */}
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${
                        user.role === 'Desarrollador' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role || 'Sin Puesto'}
                      </span>
                      {/* PEQUEÑO INDICADOR DE PERMISOS */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.permises?.map(p => (
                          <span key={p} className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded uppercase font-bold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`flex items-center gap-1 mx-auto px-3 py-1 rounded-full text-xs font-bold transition ${
                        user.activo 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.activo ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                      {user.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {/* BOTÓN DE EDITAR (AGREGADO) */}
                      <button 
                        onClick={() => openEditModal(user)}
                        title="Editar Usuario"
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* BOTÓN DE RESET PASSWORD */}
                      <button 
                        onClick={() => openResetModal(user)}
                        title="Restablecer Contraseña"
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Key size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron usuarios.
            </div>
          )}
        </div>
      </div>

      {/* MODAL UNIFICADO (CREAR / EDITAR) */}
      {isCreateModalOpen && (
        <CreateUserModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleSaveUser} // <--- Pasamos la función inteligente
          userToEdit={editingUser}  // <--- Pasamos el usuario a editar (o null)
        />
      )}

      {isResetModalOpen && selectedUser && (
        <AdminResetPasswordModal
          isOpen={isResetModalOpen}
          user={selectedUser}
          onClose={() => setIsResetModalOpen(false)}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
};

export default Usuarios;