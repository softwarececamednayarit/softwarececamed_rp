const driveService = require('../services/googleDriveService');
const { db } = require('../../config/firebase');

const subirArchivo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No hay archivo' });

    // El puesto viene del middleware de auth
    const puestoUsuario = req.user.role || 'General'; 
    const mainFolderId = process.env.DRIVE_MAIN_FOLDER_ID;
    const { hash, descripcion } = req.body;

    // 1. Verificar o crear carpeta del puesto
    let folder = await driveService.findFolder(puestoUsuario, mainFolderId);
    let folderId = folder ? folder.id : await driveService.createFolder(puestoUsuario, mainFolderId);

    // 2. Subir archivo a Drive
    const driveFile = await driveService.uploadFile(req.file, folderId);

    // 3. Registrar en Firestore
    const nuevoArchivo = {
      driveId: driveFile.id,
      url: driveFile.webViewLink,
      nombre: req.file.originalname,
      hash: hash,
      propietarioRol: puestoUsuario,
      propietarioId: req.user.uid,
      descripcion: descripcion || '',
      fechaSubida: new Date().toISOString(),
      size: req.file.size,
      permisos: [puestoUsuario, 'Desarrollador', 'Director'] // Permisos base
    };

    const docRef = await db.collection('archivos').add(nuevoArchivo);

    res.status(201).json({ 
      message: 'Archivo procesado con éxito', 
      id: docRef.id,
      url: driveFile.webViewLink 
    });
  } catch (error) {
    console.error("Error en subida:", error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { subirArchivo };