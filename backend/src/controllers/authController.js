const db = require('../../config/firebase'); // Ajusta según tu estructura de carpetas
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 🔒 CLAVE SECRETA: En producción, asegúrate de que venga del .env
// Si process.env.JWT_SECRET falla, el sistema avisa o usa un fallback solo en desarrollo.
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

// =============================================================================
// REGISTRO (Crear nuevos usuarios)
// =============================================================================
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, role } = req.body; // Agregué 'role' opcional

    if (!email || !password || !nombre) {
      return res.status(400).json({ message: 'Faltan datos obligatorios (email, password, nombre)' });
    }

    // 1. Verificar duplicados (Optimizada con limit(1))
    const userQuery = await db.collection('usuarios')
      .where('email', '==', email)
      .limit(1) // <-- IMPORTANTE: Detener búsqueda al encontrar uno
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
      password: hashedPassword, // Guardamos hash, nunca texto plano
      nombre,
      role: role || 'admin', // Por defecto admin, o lo que envíes
      createdAt: new Date().toISOString()
    };

    // 4. Guardar en Firestore
    const docRef = await db.collection('usuarios').add(newUserRaw);

    // 5. Responder (Usando el Modelo para limpiar datos sensibles)
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
// LOGIN (Generar Token JWT) - EL CORAZÓN DE LA SEGURIDAD
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
    
    // 🛡️ SEGURIDAD: Mensaje genérico para no revelar si el email existe o no
    const errorMsg = 'Credenciales inválidas'; 

    if (userQuery.empty) {
      return res.status(401).json({ message: errorMsg });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // 2. Comparar contraseña (Hash vs Texto plano)
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(401).json({ message: errorMsg });
    }

    // 3. Crear Instancia del Modelo (Para tener los datos limpios y el ID)
    const currentUser = new User(userDoc.id, userData);

    // 4. Generar el JWT
    // Payload: Qué datos viajan encriptados dentro del token
    const tokenPayload = { 
        id: currentUser.id, 
        email: currentUser.email, 
        role: currentUser.role 
    };

    const token = jwt.sign(
      tokenPayload,
      SECRET_KEY,
      { expiresIn: '12h' } // Duración de la sesión (ajustable)
    );

    // 5. Responder al Frontend
    res.json({
      message: 'Inicio de sesión exitoso',
      token, // <--- Este es el "pase" que Axios guardará
      user: currentUser.toSafeJSON() // Datos para mostrar en el perfil del front
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// =============================================================================
// CAMBIAR CONTRASEÑA (Protegido)
// =============================================================================
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

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
      password: newHashedPassword
    });

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error("Error cambiando password:", error);
    res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};