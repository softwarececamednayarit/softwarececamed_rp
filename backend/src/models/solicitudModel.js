const db = require('../../config/firebase');

// Nombres de colecciones como constantes para evitar errores de dedo
const COL_PENDIENTES = 'solicitudes_pendientes';
const COL_HISTORIAL = 'citas_historial';

class SolicitudModel {

  /**
   * Obtiene todas las solicitudes pendientes ordenadas por fecha
   */
  static async obtenerTodas() {
    try {
      const snapshot = await db.collection(COL_PENDIENTES)
        .orderBy('fecha_recepcion', 'desc')
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error obteniendo solicitudes: ${error.message}`);
    }
  }

  /**
   * Busca una solicitud por su ID
   */
  static async obtenerPorId(id) {
    const doc = await db.collection(COL_PENDIENTES).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Actualiza los datos de seguimiento (status, notas, intentos)
   */
  static async actualizarSeguimiento(id, datosActualizados) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).update({
        ...datosActualizados,
        fecha_ultima_gestion: new Date()
      });
      return true;
    } catch (error) {
      throw new Error(`Error actualizando seguimiento: ${error.message}`);
    }
  }

  /**
   * Mueve los datos a la colección de historial (cuando ya se agendó)
   */
  static async crearEntradaHistorial(datos) {
    try {
      const docRef = await db.collection(COL_HISTORIAL).add({
        ...datos,
        fecha_archivado: new Date()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Error creando historial: ${error.message}`);
    }
  }

  /**
   * Elimina permanentemente una solicitud de pendientes
   */
  static async eliminar(id) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error eliminando solicitud: ${error.message}`);
    }
  }
}

module.exports = SolicitudModel;