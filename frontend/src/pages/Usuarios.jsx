import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  Loader,
  Edit2 // <--- AGREGADO: El ícono del lápiz
} from 'lucide-react';
import { 
  getAllUsersRequest, 
  toggleUserStatusRequest, 
  registerUserRequest, 
  updateUserRequest, // <--- AGREGADO: La función para guardar cambios
  adminResetPasswordRequest 
} from '../services/authService';

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
      alert('Error al cargar usuarios: ' + error.message);
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
      alert('Error al cambiar estatus: ' + error.message);
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
        alert('Usuario actualizado correctamente');
      } else {
        // MODO CREACIÓN
        await registerUserRequest(formData);
        alert('Usuario creado exitosamente');
      }
      
      await fetchUsers(); // Recargar tabla
      setIsCreateModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      alert(error.message);
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
      alert('Contraseña actualizada correctamente');
    } catch (error) {
      alert(error.message);
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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-slate-500">Administra el acceso al sistema CECAMED</p>
        </div>
        <button 
          onClick={openCreateModal} // <--- CAMBIADO: Usamos la función auxiliar
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <UserPlus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* FILTROS Y TABLA */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="pl-10 w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Operativo'}
                    </span>
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