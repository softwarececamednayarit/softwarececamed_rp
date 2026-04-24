const db = require('../../config/firebase');

const ArchivoModel = {
  /**
   * Guarda un nuevo registro de archivo en Firestore
   */
  crearYGuardar: async (data, file, driveFile, user) => {
    const nuevoArchivo = {
      // Identificadores de Drive
      driveId: driveFile.id,
      url: driveFile.webViewLink,
      nombreOriginal: file.originalname,
      hash: data.hash,
      size: file.size,

      // Información del Oficio
      noOficio: data.noOficio || 'S/N',
      fechaDocumento: data.fechaDocumento || null,
      origen: data.origen || '',
      cargoRemitente: data.cargo || '',
      asunto: data.asunto || '',

      // Control de Recepción
      fechaRecibido: data.fechaRecibido || null,
      horaRecibido: data.horaRecibido || null,
      dirigidoA: data.dirigidoA || '',
      quienRecibe: data.quienRecibe || '',
      observaciones: data.observaciones || '',

      // Trazabilidad
      propietarioRol: user.role || 'General',
      propietarioId: user.id,
      fechaRegistroSistema: new Date().toISOString(),
      
      // Estado y Seguridad
      permisos: [user.id || 'General'],
      estado: 'activo' 
    };

    const docRef = await db.collection('archivos').add(nuevoArchivo);
    return { id: docRef.id, ...nuevoArchivo };
  },

  /**
   * Obtiene los archivos filtrados por el ID del usuario (propietario)
   */
  obtenerPorPropietario: async (propietarioId) => {
    try {
      const snapshot = await db.collection('archivos')
        .where('propietarioId', '==', propietarioId)
        .where('estado', '==', 'activo') // Solo los que no están "borrados"
        .orderBy('fechaRegistroSistema', 'desc') 
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error en ArchivoModel.obtenerPorPropietario:", error);
      throw error;
    }
  },

  obtenerPorId: async (id) => {
    const doc = await db.collection('archivos').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Obtiene los archivos marcados como borrados para un usuario
  obtenerBorradosPorPropietario: async (propietarioId) => {
    try {
      const snapshot = await db.collection('archivos')
        .where('propietarioId', '==', propietarioId)
        .where('estado', '==', 'borrado') // Filtramos por estado borrado
        .orderBy('fechaBorrado', 'desc') 
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error en obtenerBorradosPorPropietario:", error);
      throw error;
    }
  },

  actualizar: async (id, data) => {
    await db.collection('archivos').doc(id).update({
      ...data,
      fechaUltimaEdicion: new Date().toISOString()
    });
    return true;
  },

  obtenerCompartidos: async (userId) => {
    try {
      const snapshot = await db.collection('archivos')
        .where('permisos', 'array-contains', userId) // Busca si el ID del usuario está en la lista
        .where('estado', '==', 'activo')
        .get();

      if (snapshot.empty) return [];

      // Filtramos para NO mostrar mis propios archivos en la pestaña de compartidos
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(archivo => archivo.propietarioId !== userId); 
    } catch (error) {
      console.error("Error en obtenerCompartidos:", error);
      throw error;
    }
  },

  eliminarLogico: async (id) => {
    await db.collection('archivos').doc(id).update({
      estado: 'borrado',
      fechaBorrado: new Date().toISOString()
    });
    return true;
  }

};

module.exports = ArchivoModel;