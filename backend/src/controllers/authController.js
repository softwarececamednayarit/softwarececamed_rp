const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Tu modelo vitaminado
const LoggerService = require('../services/loggerService');

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

// =============================================================================
// REGISTRO
// =============================================================================
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, role } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // 1. Usar Modelo para verificar
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar (Esto sí es lógica de negocio, se queda aquí)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Usar Modelo para crear
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nombre,
      role
    });

    // LOG
    if (req.user) {
      LoggerService.log(req.user, 'CREAR', 'USUARIOS', `Registró nuevo usuario: ${email}`, { nuevo_id: newUser.id });
    }

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: newUser.toSafeJSON() 
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// =============================================================================
// LOGIN
// =============================================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

    // 1. Buscar usuario
    const user = await User.findByEmail(email);
    const errorMsg = 'Credenciales inválidas'; 

    if (!user) return res.status(401).json({ message: errorMsg });

    // Validar Estatus
    if (!user.activo) {
      LoggerService.log(
        { id: user.id, nombre: user.nombre, role: user.role },
        'ACCESO_DENEGADO', 'SESION', `Login bloqueado (Usuario Inactivo): ${email}`
      );
      return res.status(403).json({ message: 'Acceso denegado. Cuenta inhabilitada.' });
    }

    // 2. Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: errorMsg });

    // 3. Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '12h' });

    LoggerService.log(
      { id: user.id, nombre: user.nombre, role: user.role },
      'LOGIN', 'SESION', `Inicio de sesión exitoso`
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: user.toSafeJSON()
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// =============================================================================
// CAMBIAR CONTRASEÑA (Usuario Propio)
// =============================================================================
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) return res.status(400).json({ message: 'Faltan datos.' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'La contraseña actual es incorrecta' });

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // Usar Modelo para actualizar
    await User.update(user.id, { 
        password: newHashedPassword, 
        mustChangePassword: false 
    });

    const logUser = req.user || { id: user.id, nombre: user.nombre, role: user.role };
    LoggerService.log(logUser, 'ACTUALIZAR', 'SEGURIDAD', 'Cambió su propia contraseña');

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error("Error password:", error);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
};

// =============================================================================
// ZONA DE ADMINISTRACIÓN
// =============================================================================

// 1. GET ALL
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll(); // El modelo ya devuelve el JSON limpio
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// 2. TOGGLE STATUS
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { activo } = req.body; 

    if (req.user && req.user.id === id) return res.status(400).json({ message: "No puedes desactivarte a ti mismo." });

    await User.update(id, { activo });

    LoggerService.log(
      req.user, 'ACTUALIZAR', 'USUARIOS', 
      `Cambió estatus usuario ${id} a: ${activo ? 'ACTIVO' : 'INACTIVO'}`, 
      { usuario_afectado: id }
    );

    res.json({ message: `Estatus actualizado a ${activo ? 'Activo' : 'Inactivo'}` });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estatus' });
  }
};

// 3. ADMIN RESET PASSWORD
exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params; 
    const { newPassword, requireChange } = req.body; 

    if (!newPassword) return res.status(400).json({ message: "Contraseña obligatoria" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await User.update(id, { 
        password: hash, 
        mustChangePassword: requireChange || false 
    });

    LoggerService.log(req.user, 'ACTUALIZAR', 'SEGURIDAD', `Admin reseteó contraseña usuario ${id}`, { usuario_afectado: id });

    res.json({ message: 'Contraseña restablecida.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
};

// 4. UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, role } = req.body;

    if (!nombre || !email || !role) return res.status(400).json({ message: 'Datos incompletos.' });

    await User.update(id, { nombre, email, role });

    LoggerService.log(
        req.user, 'EDITAR', 'USUARIOS', 
        `Actualizó perfil usuario ${id}`, 
        { usuario_afectado: id, cambios: { nombre, email, role } }
    );

    res.json({ message: 'Usuario actualizado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};