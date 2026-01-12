const SolicitudModel = require('../models/solicitudModel'); // <--- Importamos el Modelo
const sheetsService = require('../services/googleSheetsService');

// 1. OBTENER POR STATUS
exports.obtenerPorStatus = async (req, res) => {
  try {
    const statusSolicitado = req.query.status || 'pendiente';
    
    // Mapeo lógico para las pestañas
    let filtroStatus;

    if (statusSolicitado === 'pendiente') {
      // La pestaña "Pendientes" muestra todo lo activo
      filtroStatus = ['pendiente', 'no_contesto', 'contactado'];
    } else {
      // Las pestañas "agendado" o "descartado" son directas
      filtroStatus = [statusSolicitado];
    }

    // Llamamos al Modelo
    const data = await SolicitudModel.obtenerPorStatus(filtroStatus);
    
    res.json(data);

  } catch (error) {
    console.error("Error en obtenerPorStatus:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. REGISTRAR SEGUIMIENTO (Llamada)
exports.actualizarSeguimiento = async (req, res) => {
  const { id } = req.params;
  const { status_llamada, notas_nuevas } = req.body;

  try {
    const actual = await SolicitudModel.obtenerPorId(id);
    if(!actual) return res.status(404).json({error: "No encontrado"});

    const intentos = (actual.intentos_llamada || 0) + 1;
    
    // CORRECCIÓN: Manejo seguro de strings para evitar "undefined"
    const notaNuevaLimpia = notas_nuevas ? `\n- ${notas_nuevas}` : '';
    const historialNotas = (actual.notas_seguimiento || '') + notaNuevaLimpia;
    
    await SolicitudModel.actualizar(id, {
      status_llamada: status_llamada,
      intentos_llamada: intentos,
      notas_seguimiento: historialNotas
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error seguimiento:", error); // Importante para ver el error real
    res.status(500).json({ error: error.message });
  }
};

// 3. AGENDAR (Finalizar y Excel)
exports.agendarCita = async (req, res) => {
  const { id } = req.params;
  const { tipo_asignado, fecha_cita, instrucciones, datos_completos } = req.body;

  try {
    // A. Preparar objeto completo para Excel
    const expedienteFinal = {
      ...datos_completos,
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones,
      status: 'agendado' 
    };

    // B. Mandar a Excel
    await sheetsService.agregarAAgenda(expedienteFinal);

    // C. Actualizar BD vía Modelo
    await SolicitudModel.marcarComoAgendado(id, {
      tipo_asignado,
      cita_programada: fecha_cita,
      notas_seguimiento: instrucciones
    });

    res.json({ success: true, message: 'Agendado y exportado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agendar.' });
  }
};

// 4. DESCARTAR
exports.descartarSolicitud = async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;

  try {
    await SolicitudModel.softDelete(id, motivo);
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};