/**
 * Modelo `User` - capa mínima sobre Firestore para usuarios.
 * Métodos estáticos para operaciones de BD
 * y método de instancia para serializar sin la contraseña.
 */
const db = require('../../config/firebase');

class User {
  constructor(id, data) {
    this.id = id;
    this.email = data.email;
    this.password = data.password; // hash
    this.nombre = data.nombre;
    this.role = data.role || 'admin';
    this.activo = data.activo !== false; // por defecto true
    this.mustChangePassword = data.mustChangePassword || false;
    this.permises = data.permises || []; // array de permisos
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // --- MÉTODOS ESTÁTICOS (Operaciones de BD) ---

  // Buscar usuario por email. Devuelve instancia o null.
  static async findByEmail(email) {
    const query = await db.collection('usuarios')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (query.empty) return null;

    const doc = query.docs[0];
    return new User(doc.id, doc.data());
  }

  // Buscar por ID. Devuelve instancia o null.
  static async findById(id) {
    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) return null;
    return new User(doc.id, doc.data());
  }

  // Crear usuario (aplica valores por defecto mínimos).
  static async create(userData) {
    const dataToSave = {
      ...userData,
      createdAt: new Date().toISOString(),
      activo: true,
      mustChangePassword: true,
      role: userData.role || 'admin'
    };

    const docRef = await db.collection('usuarios').add(dataToSave);
    return new User(docRef.id, dataToSave);
  }

  // Obtener todos (usar con cuidado en producción).
  static async getAll() {
    const snapshot = await db.collection('usuarios').get();
    return snapshot.docs.map(doc => new User(doc.id, doc.data()).toSafeJSON());
  }

  // Actualización genérica: elimina keys undefined antes de actualizar.
  static async update(id, data) {
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    await db.collection('usuarios').doc(id).update(data);
  }

  // --- MÉTODOS DE INSTANCIA (Formato) ---

  // Devuelve JSON seguro para el frontend (sin `password`).
  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      role: this.role,
      permises: this.permises || [],
      activo: this.activo,
      mustChangePassword: this.mustChangePassword,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;