const db = require('../../config/firebase');
const admin = require('firebase-admin'); // Necesario para borrar campos (FieldValue.delete)

const COL_PENDIENTES = 'solicitudes_pendientes';

class SolicitudModel {

  /**
   * Obtiene solicitudes filtrando por una lista de estados.
   * Ejemplo: statusArray = ['pendiente', 'no_contesto']
   */
  static async obtenerPorStatus(statusArray) {
    try {
      const snapshot = await db.collection(COL_PENDIENTES)
        .where('status', 'in', statusArray)
        .orderBy('fecha_recepcion', 'desc')
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error en DB (obtenerPorStatus): ${error.message}`);
    }
  }

  /**
   * Busca una solicitud por ID
   */
  static async obtenerPorId(id) {
    const doc = await db.collection(COL_PENDIENTES).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Actualización genérica (usada para seguimiento de llamadas)
   */
  static async actualizar(id, datos) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).update({
        ...datos,
        fecha_ultima_gestion: new Date()
      });
    } catch (error) {
      throw new Error(`Error actualizando solicitud: ${error.message}`);
    }
  }

  /**
   * Finaliza el proceso: Cambia status a 'agendado'
   */
  static async marcarComoAgendado(id, datosExtra) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).update({
        status: 'agendado',
        ...datosExtra, // tipo_asignado, cita_programada, notas
        fecha_agendado: new Date()
      });
    } catch (error) {
      throw new Error(`Error agendando solicitud: ${error.message}`);
    }
  }

  /**
   * Soft Delete: Marca como descartado y guarda motivo
   */
  static async softDelete(id, motivo) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).update({
        status: 'descartado',
        fecha_descarte: new Date(),
        motivo_descarte: motivo || 'Sin especificar'
      });
    } catch (error) {
      throw new Error(`Error descartando solicitud: ${error.message}`);
    }
  }

  /**
   * Restaurar: Quita el descarte y devuelve a pendiente
   */
  static async restaurar(id) {
    try {
      await db.collection(COL_PENDIENTES).doc(id).update({
        status: 'pendiente',
        // Borramos físicamente los campos de descarte para limpiar el registro
        motivo_descarte: admin.firestore.FieldValue.delete(),
        fecha_descarte: admin.firestore.FieldValue.delete()
      });
    } catch (error) {
      throw new Error(`Error restaurando solicitud: ${error.message}`);
    }
  }
}

module.exports = SolicitudModel;