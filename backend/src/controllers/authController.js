const db = require('../../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // <-- IMPORTAMOS EL MODELO

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

// REGISTRO
exports.register = async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    // Validación básica (Podrías mover esto al modelo también)
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    // Verificar duplicados
    const userQuery = await db.collection('usuarios').where('email', '==', email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear objeto para guardar
    const newUserRaw = {
      email,
      password: hashedPassword,
      nombre,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    // Guardar en Firestore
    const docRef = await db.collection('usuarios').add(newUserRaw);

    // Usar el Modelo para responder bonito
    const userModel = new User(docRef.id, newUserRaw);

    res.status(201).json({ 
      message: 'Usuario creado', 
      user: userModel.toSafeJSON() // <-- Enviamos sin password
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await db.collection('usuarios').where('email', '==', email).get();
    
    if (userQuery.empty) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Instanciamos el modelo con los datos de la DB
    const currentUser = new User(userDoc.id, userData);

    // Comparar password usando el dato del modelo
    const validPassword = await bcrypt.compare(password, currentUser.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Token
    const token = jwt.sign(
      { id: currentUser.id, email: currentUser.email, role: currentUser.role },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Bienvenido',
      token,
      user: currentUser.toSafeJSON()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FORZAR CAMBIO DE CONTRASEÑA
exports.forceResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validación simple
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Se requiere email y newPassword' });
    }

    // 1. Buscar al usuario por email
    const userQuery = await db.collection('usuarios').where('email', '==', email).get();

    if (userQuery.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtenemos la referencia al documento (ID)
    const userDoc = userQuery.docs[0];
    
    // 2. Hashear la NUEVA contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Actualizar solo el campo password en Firestore
    await db.collection('usuarios').doc(userDoc.id).update({
      password: hashedPassword
    });

    res.json({ 
      message: `Contraseña actualizada exitosamente para: ${email}` 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};