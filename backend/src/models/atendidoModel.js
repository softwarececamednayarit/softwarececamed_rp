const db = require('../../config/firebase');

class AtendidoModel {
  // Traer todos los registros ordenados por fecha de recepción (descendente)
  static async getAll() {
    try {
      const snapshot = await db.collection('atendidos')
        .orderBy('fecha_recepcion', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener datos de Firestore: ' + error.message);
    }
  }

  // Buscar por un campo específico (ej: CURP o Nombre)
  static async findByField(field, value) {
    const snapshot = await db.collection('atendidos').where(field, '==', value).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = AtendidoModel;