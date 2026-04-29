const driveService = require('../services/googleDriveService');
const ArchivoModel = require('../models/archivoModel');
const LoggerService = require('../services/loggerService');

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

exports.getCompartidos = async (req, res) => {
  try {
    const userId = req.user.id;
    const archivos = await ArchivoModel.obtenerCompartidos(userId);
    
    res.json({
      success: true,
      count: archivos.length,
      data: archivos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.actualizarPermisos = async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body; // Se espera un array de IDs [id1, id2, ...]

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ error: 'El campo permisos debe ser un arreglo.' });
    }

    const archivo = await ArchivoModel.obtenerPorId(id);
    if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado.' });

    // Actualizamos solo los permisos en Firestore
    await ArchivoModel.actualizar(id, { permisos });

    // Registro en bitácora
    LoggerService.log(
      req.user,
      'COMPARTIR',
      'ARCHIVOS',
      `Actualizó permisos del archivo ${archivo.noOficio}`,
      { archivo_id: id, nuevos_permisos: permisos }
    );

    res.json({ success: true, message: 'Permisos actualizados correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPapelera = async (req, res) => {
  try {
    const propietarioId = req.user.id;
    const archivos = await ArchivoModel.obtenerBorradosPorPropietario(propietarioId);
    
    res.json({
      success: true,
      count: archivos.length,
      data: archivos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.editarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      tipoDocumento, 
      noOficio, 
      asunto, 
      nombreOriginal,
      fechaDocumento,
      origen,
      cargo,
      fechaRecibido,
      horaRecibido,
      dirigidoA,
      quienRecibe,
      observaciones
    } = req.body;
    
    // 1. Obtener datos actuales a través del Modelo
    const archivoActual = await ArchivoModel.obtenerPorId(id);
    if (!archivoActual) {
      return res.status(404).json({ error: 'El expediente no existe.' });
    }

    // 2. Lógica de Drive: Solo si el nombre cambió físicamente
    if (nombreOriginal && nombreOriginal !== archivoActual.nombreOriginal) {
      console.log(`[Drive] Renombrando archivo de ${archivoActual.nombreOriginal} a ${nombreOriginal}`);
      await driveService.actualizarNombreArchivo(archivoActual.driveId, nombreOriginal);
    }

    // 3. Mapear los campos a actualizar (Asegúrate de que coincidan con los nombres en Firestore)
    const camposAActualizar = { 
      tipoDocumento,
      noOficio, 
      asunto, 
      nombreOriginal,
      fechaDocumento: fechaDocumento || null,
      origen: origen || '',
      cargoRemitente: cargo || '', // Nota: En tu modelo se llama cargoRemitente
      fechaRecibido: fechaRecibido || null,
      horaRecibido: horaRecibido || null,
      dirigidoA: dirigidoA || '',
      quienRecibe: quienRecibe || '',
      observaciones: observaciones || ''
    };

    // 4. Actualizar metadatos en Firestore
    await ArchivoModel.actualizar(id, camposAActualizar);

    // 5. Registro en Bitácora con el detalle de los cambios
    LoggerService.log(
      req.user, 
      'EDICION', 
      'ARCHIVOS', 
      `Actualizó el oficio ${archivoActual.noOficio} (ID: ${id})`,
      { 
        id_documento: id,
        cambios: camposAActualizar 
      }
    );

    res.json({ 
      success: true, 
      message: 'Expediente actualizado correctamente y sincronizado con Drive.' 
    });

  } catch (error) {
    console.error("Error en editarArchivo:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    await ArchivoModel.eliminarLogico(id);
    
    LoggerService.log(req.user, 'ELIMINAR', 'ARCHIVOS', `Movió a papelera el archivo con ID: ${id}`);
    
    res.json({ success: true, message: 'Movido a la papelera' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};