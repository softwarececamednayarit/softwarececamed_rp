const db = require('../../config/firebase');

const NotificacionModel = {
  crear: async (usuarioDestinoId, mensaje, tipo, archivoId) => {
    const nuevaNotificacion = {
      usuarioId: usuarioDestinoId,
      mensaje,
      tipo, // ej: 'ARCHIVO_COMPARTIDO'
      archivoId,
      leida: false,
      fecha: new Date().toISOString()
    };
    const docRef = await db.collection('notificaciones').add(nuevaNotificacion);
    return { id: docRef.id, ...nuevaNotificacion };
  },

  obtenerNoLeidas: async (usuarioId) => {
    const snapshot = await db.collection('notificaciones')
      .where('usuarioId', '==', usuarioId)
      .where('leida', '==', false)
      .orderBy('fecha', 'desc')
      .get();

    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  marcarComoLeida: async (notificacionId) => {
    await db.collection('notificaciones').doc(notificacionId).update({
      leida: true
    });
    return true;
  }
};

module.exports = NotificacionModel;