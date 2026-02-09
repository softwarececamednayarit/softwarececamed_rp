const SolicitudModel = require('../models/solicitudModel'); 
const sheetsService = require('../services/googleSheetsService');
const LoggerService = require('../services/loggerService');

// 1. OBTENER POR STATUS
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

// 2. REGISTRAR SEGUIMIENTO (Refactorizado)
exports.actualizarSeguimiento = async (req, res) => {
  const { id } = req.params;
  // 'usuario' viene del body (nombre escrito) o usamos req.user (token)
  const { status_llamada, notas_nuevas, usuario } = req.body;

  try {
    // 👇 REFACTOR: Toda la lógica de arrays y fechas se fue al modelo
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

// 3. AGENDAR (Finalizar y Excel)
exports.agendarCita = async (req, res) => {
  const { id } = req.params;
  const { tipo_asignado, fecha_cita, instrucciones, datos_completos } = req.body;

  try {
    // A. Excel (Esto está bien aquí, el modelo no debe saber de Excel)
    const expedienteFinal = {
      ...datos_completos,
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones,
      status: 'agendado' 
    };

    await sheetsService.agregarAAgenda(expedienteFinal);

    // B. Base de Datos
    await SolicitudModel.marcarComoAgendado(id, {
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones
    });

    // LOG
    LoggerService.log(
      req.user, 'AGENDAR', 'AGENDA', 
      `Agendó cita para solicitud ${id}`, 
      { fecha_cita, tipo: tipo_asignado }
    );

    res.json({ success: true, message: 'Agendado y exportado.' });
  } catch (error) {
    console.error("Error Agendar:", error);
    res.status(500).json({ error: 'Error al agendar.' });
  }
};

// 4. DESCARTAR
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

// 5. RECUPERAR
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