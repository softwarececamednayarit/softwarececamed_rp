const driveService = require('../services/googleDriveService');
const ArchivoModel = require('../models/archivoModel');
const LoggerService = require('../services/LoggerService');

exports.subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Falta el archivo PDF' });
    }

    const mainFolderId = process.env.DRIVE_MAIN_FOLDER_ID;
    const puesto = req.user.role || 'General';

    // 1. Gestión en Google Drive (Service)
    const folderId = await driveService.getOrCreateFolder(puesto, mainFolderId);
    const driveFile = await driveService.uploadFile(req.file, folderId);

    // 2. Persistencia en base de datos (Modelo)
    const resultado = await ArchivoModel.crearYGuardar(req.body, req.file, driveFile, req.user);

    // 3. Registro en Bitácora
    LoggerService.log(
      req.user, 
      'SUBIDA', 
      'ARCHIVOS', 
      `Subió el oficio ${req.body.noOficio || 'S/N'} al repositorio de ${puesto}`, 
      { 
        archivo_id: resultado.id, 
        drive_id: driveFile.id,
        hash: req.body.hash 
      }
    );

    res.json({ 
      success: true, 
      id: resultado.id,
      driveUrl: driveFile.webViewLink 
    });

  } catch (error) {
    console.error("Error en subirArchivo:", error);
    res.status(500).json({ error: error.message });
  }
};

// En archivoController.js agregar:

exports.getMisArchivos = async (req, res) => {
  try {
    const propietarioId = req.user.id; // Extraído del token verificado
    
    const archivos = await ArchivoModel.obtenerPorPropietario(propietarioId);
    
    res.json({
      success: true,
      count: archivos.length,
      data: archivos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};