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
    // 1. Quitamos el orderBy para que Firestore no exija un Índice Compuesto
    const snapshot = await db.collection('notificaciones')
      .where('usuarioId', '==', usuarioId)
      .where('leida', '==', false)
      .get();

    if (snapshot.empty) return [];
    
    // 2. Mapeamos los datos
    const notificaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 3. Ordenamos en memoria (Las más recientes primero)
    return notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  },

  marcarComoLeida: async (notificacionId) => {
    await db.collection('notificaciones').doc(notificacionId).update({
      leida: true
    });
    return true;
  }
};

module.exports = NotificacionModel;