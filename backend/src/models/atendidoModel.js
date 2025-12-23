const db = require('../../config/firebase');

class AtendidoModel {
  // 1. Obtener todos (Ya lo tenías bien, agregamos un try/catch robusto)
  static async getAll() {
    try {
      const snapshot = await db.collection('atendidos')
        .orderBy('fecha_recepcion', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.getAll: ' + error.message);
    }
  }

  // 2. Filtrado con Ordenamiento (Vital para gráficas de tiempo)
  static async getFiltered({ fechaInicio, fechaFin, tipo }) {
    try {
      let query = db.collection('atendidos');

      if (fechaInicio && fechaFin) {
        query = query.where('fecha_recepcion', '>=', fechaInicio)
                     .where('fecha_recepcion', '<=', fechaFin);
      }

      if (tipo) {
        query = query.where('tipo', '==', tipo);
      }

      // IMPORTANTE: Siempre ordenar para que el Frontend no tenga que hacerlo
      // Nota: Si usas filtros de rango y orderBy en campos distintos, 
      // Firebase te pedirá crear un "Índice Compuesto" (te dará el link en consola).
      query = query.orderBy('fecha_recepcion', 'desc');

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.getFiltered: ' + error.message);
    }
  }

  // 3. Búsqueda por ID Único (Necesario para la página de "Detalles")
  static async getById(id) {
    try {
      const doc = await db.collection('atendidos').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error en AtendidoModel.getById: ' + error.message);
    }
  }

  // 4. Búsqueda por Nombre (Simulación de búsqueda parcial)
  // Como Firestore no tiene "LIKE %text%", traemos por rango de texto
  static async searchByName(nombreBusqueda) {
    try {
      const str = nombreBusqueda.toUpperCase();
      const snapshot = await db.collection('atendidos')
        .where('nombre', '>=', str)
        .where('nombre', '<=', str + '\uf8ff')
        .limit(20) // Limitar para no saturar
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Error en AtendidoModel.searchByName: ' + error.message);
    }
  }
}

module.exports = AtendidoModel;