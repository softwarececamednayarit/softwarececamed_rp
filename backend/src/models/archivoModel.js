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
      estado: 'activo' // Borrado lógico gestionado aquí
    };

    const docRef = await db.collection('archivos').add(nuevoArchivo);
    return { id: docRef.id, ...nuevoArchivo };
  }
};

module.exports = ArchivoModel;