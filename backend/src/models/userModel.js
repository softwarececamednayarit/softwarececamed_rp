const db = require('../../config/firebase');

class User {
  constructor(id, data) {
    this.id = id;
    this.email = data.email;
    this.password = data.password; // Hash
    this.nombre = data.nombre;
    this.role = data.role || 'admin';
    this.activo = data.activo !== false; // Default true
    this.mustChangePassword = data.mustChangePassword || false;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // --- MÉTODOS ESTÁTICOS (Operaciones de BD) ---

  // 1. Buscar por Email
  static async findByEmail(email) {
    const query = await db.collection('usuarios')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (query.empty) return null;
    
    const doc = query.docs[0];
    return new User(doc.id, doc.data());
  }

  // 2. Buscar por ID
  static async findById(id) {
    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) return null;
    return new User(doc.id, doc.data());
  }

  // 3. Crear Usuario
  static async create(userData) {
    // Aseguramos valores por defecto
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

  // 4. Obtener Todos (Para Admin)
  static async getAll() {
    const snapshot = await db.collection('usuarios').get();
    return snapshot.docs.map(doc => new User(doc.id, doc.data()).toSafeJSON());
  }

  // 5. Actualizar (Genérico)
  static async update(id, data) {
    // Filtramos undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    await db.collection('usuarios').doc(id).update(data);
  }

  // --- MÉTODOS DE INSTANCIA (Formato) ---

  // JSON seguro para enviar al frontend (sin password)
  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      role: this.role,
      activo: this.activo,
      mustChangePassword: this.mustChangePassword,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;