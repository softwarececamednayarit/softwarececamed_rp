const driveService = require('../services/googleDriveService');
const ArchivoModel = require('../models/archivoModel');
const LoggerService = require('../services/loggerService');
const NotificacionModel = require('../models/notificationModel');
const User = require('../models/userModel'); // <-- Importamos el modelo de usuario para obtener nombres

exports.subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Falta el archivo PDF' });
    }

    const mainFolderId = process.env.DRIVE_MAIN_FOLDER_ID;
    const puesto = req.user.role || 'General';
    const nombreAutor = req.user.nombre || req.user.email || 'Usuario Desconocido';

    // 1. Gestión en Google Drive (Service)
    const folderId = await driveService.getOrCreateFolder(puesto, mainFolderId);
    const driveFile = await driveService.uploadFile(req.file, folderId);

    // 2. Persistencia en base de datos (Modelo)
    const resultado = await ArchivoModel.crearYGuardar(req.body, req.file, driveFile, req.user);

    // 3. Historial del Archivo (Creación)
    await ArchivoModel.agregarHistorial(
      resultado.id, 
      'CREACION', 
      `Archivo subido al sistema por ${nombreAutor}`, 
      req.user.id
    );

    // 4. Registro en Bitácora General
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
    const propietarioId = req.user.id; 
    const archivos = await ArchivoModel.obtenerPorPropietario(propietarioId);
    
    res.json({ success: true, count: archivos.length, data: archivos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCompartidos = async (req, res) => {
  try {
    const userId = req.user.id;
    const archivos = await ArchivoModel.obtenerCompartidos(userId);
    
    res.json({ success: true, count: archivos.length, data: archivos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.actualizarPermisos = async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body; 

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ error: 'El campo permisos debe ser un arreglo.' });
    }

    const archivo = await ArchivoModel.obtenerPorId(id);
    if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado.' });

    const permisosAnteriores = archivo.permisos || [];
    const usuariosAgregados = permisos.filter(userId => !permisosAnteriores.includes(userId));
    const usuariosEliminados = permisosAnteriores.filter(userId => !permisos.includes(userId) && userId !== 'General');
    const autorAccion = req.user.nombre || 'el propietario';

    await ArchivoModel.actualizar(id, { permisos });

    // Procesar agregados buscando sus nombres reales
    for (const userId of usuariosAgregados) {
      let nombreDestino = userId;
      if (userId !== 'General') {
        const userDoc = await User.findById(userId);
        if (userDoc) nombreDestino = userDoc.nombre;
      }

      await ArchivoModel.agregarHistorial(
        id, 
        'COMPARTIDO', 
        `${autorAccion} compartió este archivo con: ${nombreDestino}`, 
        req.user.id
      );
      
      if(userId !== req.user.id && userId !== 'General') {
        await NotificacionModel.crear(
          userId, 
          `${autorAccion} te ha compartido el archivo: ${archivo.nombreOriginal}`, 
          'ARCHIVO_COMPARTIDO', 
          id
        );
      }
    }

    // Procesar eliminados buscando sus nombres reales
    for (const userId of usuariosEliminados) {
      let nombreDestino = userId;
      if (userId !== 'General') {
        const userDoc = await User.findById(userId);
        if (userDoc) nombreDestino = userDoc.nombre;
      }

      await ArchivoModel.agregarHistorial(
        id, 
        'ACCESO_REVOCADO', 
        `${autorAccion} revocó el acceso de: ${nombreDestino}`, 
        req.user.id
      );
    }

    LoggerService.log(
      req.user, 'COMPARTIR', 'ARCHIVOS', `Actualizó permisos del archivo ${archivo.noOficio}`, { archivo_id: id, nuevos_permisos: permisos }
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
    
    res.json({ success: true, count: archivos.length, data: archivos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.editarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipoDocumento, noOficio, asunto, nombreOriginal, fechaDocumento,
      origen, cargo, fechaRecibido, horaRecibido, dirigidoA, quienRecibe, observaciones
    } = req.body;
    
    const archivoActual = await ArchivoModel.obtenerPorId(id);
    if (!archivoActual) return res.status(404).json({ error: 'El expediente no existe.' });

    if (nombreOriginal && nombreOriginal !== archivoActual.nombreOriginal) {
      await driveService.actualizarNombreArchivo(archivoActual.driveId, nombreOriginal);
    }

    const camposAActualizar = { 
      tipoDocumento, noOficio, asunto, nombreOriginal,
      fechaDocumento: fechaDocumento || null, origen: origen || '',
      cargoRemitente: cargo || '', fechaRecibido: fechaRecibido || null,
      horaRecibido: horaRecibido || null, dirigidoA: dirigidoA || '',
      quienRecibe: quienRecibe || '', observaciones: observaciones || ''
    };

    await ArchivoModel.actualizar(id, camposAActualizar);

    // Agregar al historial del archivo
    const nombreEditor = req.user.nombre || req.user.email || 'Un usuario';
    await ArchivoModel.agregarHistorial(
      id, 
      'EDICION', 
      `Los metadatos del archivo fueron actualizados por ${nombreEditor}`, 
      req.user.id
    );

    LoggerService.log(
      req.user, 'EDICION', 'ARCHIVOS', `Actualizó el oficio ${archivoActual.noOficio} (ID: ${id})`, { id_documento: id, cambios: camposAActualizar }
    );

    res.json({ success: true, message: 'Expediente actualizado correctamente y sincronizado con Drive.' });

  } catch (error) {
    console.error("Error en editarArchivo:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    await ArchivoModel.eliminarLogico(id);
    
    // Agregar al historial del archivo
    const nombreEliminador = req.user.nombre || req.user.email || 'Un usuario';
    await ArchivoModel.agregarHistorial(
      id, 
      'ELIMINADO', 
      `El archivo fue enviado a la papelera por ${nombreEliminador}`, 
      req.user.id
    );

    LoggerService.log(req.user, 'ELIMINAR', 'ARCHIVOS', `Movió a papelera el archivo con ID: ${id}`);
    
    res.json({ success: true, message: 'Movido a la papelera' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- CONTROLADORES PARA HISTORIAL ---

exports.agregarHistorialManual = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;
    
    if (!descripcion) return res.status(400).json({ error: 'La descripción es obligatoria' });

    // Etiquetamos visualmente quién hizo el comentario manual
    const nombreAutor = req.user.nombre || 'Usuario';
    const descripcionConAutor = `${descripcion} (Nota de ${nombreAutor})`;

    await ArchivoModel.agregarHistorial(id, 'REGISTRO_MANUAL', descripcionConAutor, req.user.id);
    
    res.json({ success: true, message: 'Registro agregado al historial' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistorialArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await ArchivoModel.obtenerHistorial(id);
    res.json({ success: true, data: historial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};