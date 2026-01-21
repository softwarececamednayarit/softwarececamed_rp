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
// 2. REGISTRAR SEGUIMIENTO (Llamada)
exports.actualizarSeguimiento = async (req, res) => {
  const { id } = req.params;
  // Recibimos también al 'usuario' que hace la acción
  const { status_llamada, notas_nuevas, usuario } = req.body;

  try {
    const actual = await SolicitudModel.obtenerPorId(id);
    if (!actual) return res.status(404).json({ error: "No encontrado" });

    // 1. Preparamos el nuevo objeto de intento
    const nuevoIntento = {
      fecha: new Date().toISOString(), // Fecha exacta automática
      usuario: usuario || 'Desconocido', // El usuario que mandas del front
      status: status_llamada,
      notas: notas_nuevas || ''
    };

    // 2. Obtenemos el historial actual. 
    // NOTA: Si tu DB es SQL y guardas esto en un campo de texto, usa: JSON.parse(actual.historial_intentos || '[]')
    // Si es Mongo o Postgres con JSONB, úsalo directo:
    let historial = actual.intentos || []; 
    
    // 3. Agregamos el nuevo intento al principio (para que el más reciente salga arriba) o al final
    historial.unshift(nuevoIntento); 

    // 4. Actualizamos
    await SolicitudModel.actualizar(id, {
      status_llamada: status_llamada,
      intentos_llamada: (actual.intentos_llamada || 0) + 1,
      intentos: historial // <--- Guardamos el ARRAY completo, no un string
    });

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