const db = require('../../config/firebase');

/**
 * LoggerService
 * Servicio ligero para escritura de eventos en la colección `bitacora` de Firestore.
 * - Uso: LoggerService.log(usuario, accion, modulo, descripcion, detalles)
 * - Diseño: escrituras en background (fire-and-forget) para no bloquear respuestas HTTP.
 * - Nota: mantener la forma mínima del objeto `usuario` (id, nombre/email, role) para trazabilidad.
 */
class LoggerService {
  /**
   * Registra un evento en Firestore.
   * @param {Object} usuario - Objeto con información del usuario (id, nombre/email, role).
   * @param {string} accion - Acción registrada (ej. 'CREATE', 'UPDATE', 'DELETE').
   * @param {string} modulo - Módulo o componente responsable (ej. 'SOLICITUDES').
   * @param {string} descripcion - Texto breve que explique el evento.
   * @param {Object} [detalles={}] - Datos adicionales libres (no deben contener secretos).
   */
  static async log(usuario, accion, modulo, descripcion, detalles = {}) {
    try {
      // Normalizar valores para consistencia en consultas/agrupaciones
      const moduloSeguro = modulo ? modulo.toString().toUpperCase() : 'GENERAL';
      const accionSegura = accion ? accion.toString().toUpperCase() : 'INFO';

      const nuevoLog = {
        usuario_id: usuario?.id || 'sistema',
        // Preferir nombre; si no existe, usar email o valor por defecto
        usuario_nombre: usuario?.nombre || usuario?.email || 'Desconocido',
        usuario_rol: usuario?.role || 'N/A',

        accion: accionSegura,
        modulo: moduloSeguro,

        descripcion: descripcion || 'Sin descripción',
        detalles: detalles,
        fecha: new Date().toISOString()
      };

      // Escritura intencionalmente no bloqueante: registramos en background y manejamos errores localmente.
      db.collection('bitacora').add(nuevoLog).catch(err =>
        console.error('⚠️ Error guardando bitácora en background:', err)
      );

    } catch (error) {
      // Capturamos errores inesperados del propio Logger para evitar romper la ruta que lo llama.
      console.error('❌ Error crítico en LoggerService:', error);
    }
  }
}

module.exports = LoggerService;