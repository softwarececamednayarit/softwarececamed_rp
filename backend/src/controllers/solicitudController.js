/**
 * Controlador `solicitudController` — manejo de solicitudes: listar por
 * estado, agregar seguimiento, agendar, descartar y recuperar.
 * La lógica de BD está en `solicitudModel`.
 */
const SolicitudModel = require('../models/solicitudModel');
const sheetsService = require('../services/googleSheetsService');
const LoggerService = require('../services/loggerService');
const { enviarCorreoNotificacion } = require('../services/emailService');

// Obtener solicitudes por estado (query: status)
exports.obtenerPorStatus = async (req, res) => {
  try {
    const statusSolicitado = req.query.status || 'pendiente';
    let filtroStatus = (statusSolicitado === 'pendiente') 
      ? ['pendiente', 'no_contesto', 'contactado'] 
      : [statusSolicitado];

    const data = await SolicitudModel.obtenerPorStatus(filtroStatus);
    res.json(data);
  } catch (error) {
    console.error("Error obtenerPorStatus:", error);
    res.status(500).json({ error: error.message });
  }
};

// Registrar seguimiento: delega la construcción del intento al modelo
exports.actualizarSeguimiento = async (req, res) => {
  const { id } = req.params;
  // 'usuario' viene del body (nombre escrito) o usamos req.user (token)
  const { status_llamada, notas_nuevas, usuario } = req.body;

  try {
    // REFACTOR: Toda la lógica de arrays y fechas se fue al modelo
    const nuevoIntento = await SolicitudModel.agregarSeguimiento(id, {
        status_llamada,
        notas_nuevas,
        usuarioNombre: usuario // Nombre para mostrar en el historial visual
    });

    // LOG
    LoggerService.log(
      req.user, 
      'SEGUIMIENTO', 
      'SOLICITUDES', 
      `Llamada registrada: ${status_llamada}`, 
      { solicitud_id: id, notas: notas_nuevas }
    );

    res.json({ success: true, nuevoIntento });
  } catch (error) {
    console.error("Error seguimiento:", error);
    res.status(500).json({ error: error.message });
  }
};

// Agendar cita: exporta a Excel y marca la solicitud como 'agendado'
exports.agendarCita = async (req, res) => {
  const { id } = req.params;
  // Asegurarse de extraer 'correoElectronico' de req.body o de 'datos_completos'
  const { tipo_asignado, fecha_cita, instrucciones, datos_completos, correoElectronico } = req.body;
  try {
    // 1. Guardado en Excel (Google Sheets)
    const expedienteFinal = {
      ...datos_completos,
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones,
      status: 'agendado' 
    };
    await sheetsService.agregarAAgenda(expedienteFinal);

    // 2. Actualización en Base de Datos
    await SolicitudModel.marcarComoAgendado(id, {
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones
    });

    // 3. Registro en Bitácora (LOG)
    LoggerService.log(
      req.user, 'AGENDAR', 'AGENDA', 
      `Agendó cita para solicitud ${id}`, 
      { fecha_cita, tipo: tipo_asignado }
    );

    // 4. Preparamos y enviamos el correo (Asíncrono)
    // Validamos que exista el correo para evitar errores de la API
    if (correoElectronico) {
      const asunto = 'Actualización de Instrucciones - Plataforma SACRE';
      const htmlBody = `
        <h2>Hola, tienes nuevas instrucciones de CECAMED</h2>
        <p>Se han generado las siguientes instrucciones para tu solicitud:</p>
        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ccc;">
          ${instrucciones}
        </blockquote>
        <br/>
        <p><small>Solicitud procesada por la Plataforma SACRE | CECAMED</small></p>
      `;

      // Fire and forget: disparamos la promesa pero no la esperamos (no hay 'await')
      enviarCorreoNotificacion(correoElectronico, asunto, htmlBody)
        .catch(err => console.error("Fallo silencioso en envío de correo:", err.message));
    }

    // 5. Respondemos al frontend una sola vez y de inmediato
    return res.status(200).json({ 
      success: true, 
      message: 'Cita agendada, exportada y notificación en proceso de envío.' 
    });

  } catch (error) {
    console.error("Error Agendar:", error);
    // Un solo catch para atrapar errores de Sheets o DB
    return res.status(500).json({ success: false, error: 'Error al agendar la cita.' });
  }
};

// Descartar solicitud (soft delete): guarda motivo y fecha
exports.descartarSolicitud = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    await SolicitudModel.softDelete(id, motivo);

    LoggerService.log(
      req.user, 'DESCARTAR', 'SOLICITUDES', 
      `Descartó solicitud ${id}`, 
      { motivo }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recuperar solicitud: quitar campos de descarte y volver a 'pendiente'
exports.recuperarSolicitud = async (req, res) => {
  const { id } = req.params;
  try {
    await SolicitudModel.restaurar(id);

    LoggerService.log(
      req.user, 'RESTAURAR', 'SOLICITUDES', 
      `Recuperó solicitud ${id}`, 
      { solicitud_id: id }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};