const db = require('../../config/firebase'); 

class LoggerService {
  /**
   * Crea un registro en la bitácora
   * IMPORTANTE: El orden de los parámetros debe ser exacto.
   * 1. usuario
   * 2. accion
   * 3. modulo  <--- ESTE ES EL QUE TE FALTABA O TENÍA TYPO
   * 4. descripcion
   * 5. detalles
   */
  static async log(usuario, accion, modulo, descripcion, detalles = {}) {
    try {
      // Validación rápida para evitar 'ReferenceError' o 'undefined'
      const moduloSeguro = modulo ? modulo.toString().toUpperCase() : 'GENERAL';
      const accionSegura = accion ? accion.toString().toUpperCase() : 'INFO';

      const nuevoLog = {
        usuario_id: usuario?.id || 'sistema',
        // Si el token no tiene nombre, usamos el email o un default
        usuario_nombre: usuario?.nombre || usuario?.email || 'Desconocido',
        usuario_rol: usuario?.role || 'N/A',
        
        accion: accionSegura,
        modulo: moduloSeguro, // Aquí es donde te daba el error
        
        descripcion: descripcion || 'Sin descripción',
        detalles: detalles,
        fecha: new Date().toISOString()
      };

      // Guardar en Firestore (sin await para no bloquear)
      db.collection('bitacora').add(nuevoLog).catch(err => 
        console.error("⚠️ Error guardando bitácora en background:", err)
      );

    } catch (error) {
      console.error("❌ Error crítico en LoggerService:", error);
    }
  }
}

module.exports = LoggerService;