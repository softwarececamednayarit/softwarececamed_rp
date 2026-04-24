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
      permisos: [user.role || 'General'],
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
  }
};

module.exports = ArchivoModel;