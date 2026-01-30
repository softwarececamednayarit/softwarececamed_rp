const db = require('../../config/firebase'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 🔒 CLAVE SECRETA
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

// =============================================================================
// REGISTRO (Crear nuevos usuarios)
// =============================================================================
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, role } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // 1. Verificar duplicados
    const userQuery = await db.collection('usuarios')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!userQuery.empty) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Objeto para guardar
    const newUserRaw = {
      email,
      password: hashedPassword,
      nombre,
      role: role || 'admin', 
      createdAt: new Date().toISOString(),
      // [NUEVO] Campos por defecto para el control de acceso
      activo: true, 
      mustChangePassword: true // Por seguridad, usuarios nuevos deberían cambiar su clave (opcional)
    };

    // 4. Guardar en Firestore
    const docRef = await db.collection('usuarios').add(newUserRaw);

    // 5. Responder
    const userModel = new User(docRef.id, newUserRaw);

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: userModel.toSafeJSON() 
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// =============================================================================
// LOGIN (Generar Token JWT) - AQUI ESTÁ LA SEGURIDAD
// =============================================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    // 1. Buscar usuario
    const userQuery = await db.collection('usuarios')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    const errorMsg = 'Credenciales inválidas'; 

    if (userQuery.empty) {
      return res.status(401).json({ message: errorMsg });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // [NUEVO] VALIDACIÓN DE ACCESO: ¿El usuario está activo?
    // Verificamos explícitamente si es false. Si es undefined (usuarios viejos), los dejamos pasar.
    if (userData.activo === false) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Tu cuenta ha sido inhabilitada por el administrador.' 
      });
    }

    // 2. Comparar contraseña
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: errorMsg });
    }

    // 3. Modelo limpio
    const currentUser = new User(userDoc.id, userData);

    // 4. Generar Token
    const tokenPayload = { 
        id: currentUser.id, 
        email: currentUser.email, 
        role: currentUser.role 
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '12h' });

    // 5. Responder
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        ...currentUser.toSafeJSON(),
        // [NUEVO] Enviamos esta bandera para que el Frontend sepa si sugerir cambio de contraseña
        mustChangePassword: userData.mustChangePassword || false
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// =============================================================================
// CAMBIAR CONTRASEÑA (El usuario cambia SU propia contraseña)
// =============================================================================
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validación básica
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan datos.' });
    }

    const userQuery = await db.collection('usuarios').where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // 1. Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    // 2. Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Actualizar
    await db.collection('usuarios').doc(userDoc.id).update({
      password: newHashedPassword,
      // [NUEVO] Si el usuario la cambia voluntariamente, quitamos la bandera de obligatoriedad
      mustChangePassword: false 
    });

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error("Error cambiando password:", error);
    res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};

// =============================================================================
// ZONA DE ADMINISTRACIÓN (Funciones exclusivas para el Admin)
// =============================================================================

// 1. OBTENER TODOS LOS USUARIOS (Para llenar tu tabla en React)
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    
    const users = snapshot.docs.map(doc => {
      const d = doc.data();
      return { 
        id: doc.id, 
        nombre: d.nombre, 
        email: d.email, 
        role: d.role, 
        // Si 'activo' no existe (usuarios viejos), asumimos que es true
        activo: d.activo !== false, 
        createdAt: d.createdAt 
        // ⚠️ IMPORTANTE: Nunca devolvemos el password aquí
      };
    });

    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// 2. INTERRUPTOR DE ACCESO (Banear / Activar)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario a modificar
    const { activo } = req.body; // true o false

    // SEGURIDAD: Evitar que el admin se bloquee a sí mismo por error
    // (req.user viene del token decodificado en el middleware)
    if (req.user && req.user.id === id) {
        return res.status(400).json({ message: "No puedes desactivar tu propia cuenta." });
    }

    await db.collection('usuarios').doc(id).update({ 
      activo: activo 
    });

    res.json({ message: `Usuario ${activo ? 'activado' : 'inhabilitado'} correctamente` });
  } catch (error) {
    console.error("Error cambiando estatus:", error);
    res.status(500).json({ message: 'Error al actualizar estatus' });
  }
};

// 3. RESET DE CONTRASEÑA POR ADMIN (Cuando alguien la olvida)
exports.adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario objetivo
    const { newPassword, requireChange } = req.body; 

    if (!newPassword) {
        return res.status(400).json({ message: "La nueva contraseña es obligatoria" });
    }

    // Encriptar la nueva
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.collection('usuarios').doc(id).update({
      password: hash,
      mustChangePassword: requireChange || false // ¿Obligarlo a cambiarla al entrar?
    });

    res.json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    console.error("Error admin reset:", error);
    res.status(500).json({ message: 'Error al resetear contraseña' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, role } = req.body;

    // Validación básica
    if (!nombre || !email || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Actualizamos solo los campos permitidos
    await db.collection('usuarios').doc(id).update({
      nombre,
      email,
      role
    });

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};