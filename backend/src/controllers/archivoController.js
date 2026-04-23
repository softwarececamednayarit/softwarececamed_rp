const driveService = require('../services/googleDriveService');
const { db } = require('../../config/firebase');

const subirArchivo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo PDF' });

    // Desestructuración de los campos enviados desde el UploadModal.jsx
    const { 
      noOficio, 
      fechaDocumento, 
      origen, 
      cargo, 
      fechaRecibido, 
      horaRecibido, 
      asunto, 
      dirigidoA, 
      quienRecibe, 
      observaciones,
      hash 
    } = req.body;

    // Datos de sesión del usuario (inyectados por verifyToken)
    const puestoUsuario = req.user.role || 'General'; 
    const uIdSubio = req.user.uid;
    const mainFolderId = process.env.DRIVE_MAIN_FOLDER_ID;

    // 1. Gestión de carpetas en Drive por puesto
    let folder = await driveService.findFolder(puestoUsuario, mainFolderId);
    let folderId = folder ? folder.id : await driveService.createFolder(puestoUsuario, mainFolderId);

    // 2. Subida física y obtención de enlace público
    const driveFile = await driveService.uploadFile(req.file, folderId);

    // 3. Construcción del objeto siguiendo el estándar institucional
    const metadatosArchivo = {
      // Identificadores de archivo
      driveId: driveFile.id,
      url: driveFile.webViewLink,
      nombreOriginal: req.file.originalname,
      hash: hash, // Huella digital para integridad
      size: req.file.size,

      // Información del Oficio (Datos del remitente)
      noOficio: noOficio || 'S/N',
      fechaDocumento: fechaDocumento,
      origen: origen,
      cargoRemitente: cargo,
      asunto: asunto,

      // Información de Recepción (Control interno)
      fechaRecibido: fechaRecibido,
      horaRecibido: horaRecibido,
      dirigidoA: dirigidoA,
      quienRecibe: quienRecibe,
      observaciones: observaciones || '',

      // Trazabilidad del sistema
      propietarioRol: puestoUsuario,
      propietarioId: uIdSubio,
      fechaRegistroSistema: new Date().toISOString(),
      
      // Gestión de Visibilidad y Estado
      permisos: [puestoUsuario, 'Desarrollador', 'Director'],
      estado: 'activo', // Para el borrado lógico gestionado en el sistema
    };

    // 4. Persistencia en Firestore
    const docRef = await db.collection('archivos').add(metadatosArchivo);

    res.status(201).json({ 
      success: true,
      message: 'Oficio registrado y archivado correctamente', 
      id: docRef.id,
      driveUrl: driveFile.webViewLink 
    });

  } catch (error) {
    console.error("%c[SACRE ERROR] Fallo en archivoController:", "color: #ef4444; font-weight: bold;", error);
    res.status(500).json({ 
      success: false,
      message: 'Error al procesar el registro del archivo' 
    });
  }
};

module.exports = { subirArchivo };