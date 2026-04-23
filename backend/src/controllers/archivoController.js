const driveService = require('../services/googleDriveService');
const ArchivoModel = require('../models/archivoModel');

const subirArchivo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Falta el archivo PDF' });

    const mainFolderId = process.env.DRIVE_MAIN_FOLDER_ID;
    const puesto = req.user.role || 'General';

    // 1. Interacción con el Service de Google Drive
    const folderId = await driveService.getOrCreateFolder(puesto, mainFolderId);
    const driveFile = await driveService.uploadFile(req.file, folderId);

    // 2. Interacción con el Modelo (que a su vez toca la DB)
    const resultado = await ArchivoModel.crearYGuardar(req.body, req.file, driveFile, req.user);

    res.status(201).json({ 
      success: true, 
      message: 'Oficio registrado correctamente',
      data: resultado 
    });

  } catch (error) {
    console.error("Error en subirArchivo:", error);
    res.status(500).json({ success: false, message: 'Error interno al procesar el archivo' });
  }
};

module.exports = { subirArchivo };