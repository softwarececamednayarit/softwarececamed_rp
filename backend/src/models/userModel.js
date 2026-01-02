class User {
  constructor(id, data) {
    this.id = id;
    this.email = data.email;
    this.password = data.password;
    this.nombre = data.nombre;
    this.role = data.role || 'admin';
    this.createdAt = data.createdAt || new Date();
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;