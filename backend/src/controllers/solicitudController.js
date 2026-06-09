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
  
  // 1. Ya no intentamos sacar correoElectronico directamente del destructuring
  const { tipo_asignado, fecha_cita, instrucciones, datos_completos } = req.body;

  try {
    // 2. Extraemos el correo de manera segura desde datos_completos
    const correoDestino = req.body.correoElectronico || datos_completos?.correoElectronico;

    // Guardado en Excel (Google Sheets)
    const expedienteFinal = {
      ...datos_completos,
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones,
      status: 'agendado' 
    };
    await sheetsService.agregarAAgenda(expedienteFinal);

    // Actualización en Base de Datos
    await SolicitudModel.marcarComoAgendado(id, {
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones
    });

    // Registro en Bitácora (LOG)
    LoggerService.log(
      req.user, 'AGENDAR', 'AGENDA', 
      `Agendó cita para solicitud ${id}`, 
      { fecha_cita, tipo: tipo_asignado }
    );

    // 3. Evaluamos con la nueva variable 'correoDestino'
    if (correoDestino) {
      const asunto = 'CECAMED: Notificación de seguimiento a su solicitud';
      // Personalización de datos
      const nombreAtendido = `${datos_completos.nombre || ''} ${datos_completos.apellido_paterno || ''}`.trim() || 'Ciudadano';
      // Usamos los últimos 6 caracteres del ID como un "Folio" temporal para que se vea formal
      // Plantilla HTML Formal y Responsiva
      const htmlBody = `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #0f172a; color: #ffffff; padding: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">Comisión Estatal de Conciliación y Arbitraje Médico</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Plataforma Digital</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Estimado/a <strong>${nombreAtendido}</strong>,</p>
            <p style="line-height: 1.6;">Por medio del presente comunicado se le notifica que su solicitud ha sido actualizada en nuestro sistema.</p>
            <p style="line-height: 1.6;">Se han emitido las siguientes instrucciones oficiales respecto a su trámite:</p>

            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 6px 6px 0;">
              <p style="margin: 0; font-size: 15px; color: #1e293b; font-style: italic; line-height: 1.6;">
                "${instrucciones}"
              </p>
            </div>

            <p style="line-height: 1.6;">Le sugerimos presentarse puntualmente y cumplir con los requisitos descritos para agilizar su atención en nuestras instalaciones.</p>
            
            <br/>
            <p style="margin: 0; color: #64748b;">Atentamente,</p>
            <p style="margin: 5px 0 0; font-weight: bold; color: #0f172a;">CECAMED Nayarit</p>
          </div>

          <div style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Este mensaje es generado automáticamente por la plataforma interna (SACRE). Por favor, evite responder a este correo.</p>
          </div>
        </div>
      `;

      // Fire and forget
      enviarCorreoNotificacion(correoDestino, asunto, htmlBody)
        .catch(err => console.error("Fallo silencioso en envío de correo:", err.message));
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Cita agendada, exportada y notificación procesada.' 
    });

  } catch (error) {
    console.error("Error Agendar:", error);
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