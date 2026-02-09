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

  static async agregarSeguimiento(id, { status_llamada, notas_nuevas, usuarioNombre }) {
    try {
      // 1. Necesitamos el documento actual para obtener el historial previo
      const docRef = db.collection(COL_PENDIENTES).doc(id);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) throw new Error("Solicitud no encontrada");

      const data = docSnap.data();
      let historial = data.intentos || [];

      // 2. Creamos el nuevo intento
      const nuevoIntento = {
        fecha: new Date().toISOString(),
        usuario: usuarioNombre || 'Sistema',
        status: status_llamada,
        notas: notas_nuevas || ''
      };

      // 3. Lo ponemos al principio
      historial.unshift(nuevoIntento);

      // 4. Actualizamos todo de una vez
      await docRef.update({
        status: status_llamada, // Actualizamos el status general también
        intentos_llamada: (data.intentos_llamada || 0) + 1,
        intentos: historial,
        fecha_ultima_gestion: new Date()
      });

      return nuevoIntento; // Retornamos el intento para que el front lo pinte

    } catch (error) {
      throw new Error(`Error agregando seguimiento: ${error.message}`);
    }
  }
}

module.exports = SolicitudModel;