const SolicitudModel = require('../models/solicitudModel'); // <--- Importamos el Modelo
const sheetsService = require('../services/googleSheetsService');

// --- 1. OBTENER PENDIENTES ---
exports.obtenerPendientes = async (req, res) => {
  try {
    // El controlador pide datos al modelo
    const solicitudes = await SolicitudModel.obtenerTodas();
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. ACTUALIZAR SEGUIMIENTO ---
exports.actualizarSeguimiento = async (req, res) => {
  const { id } = req.params;
  const { status_llamada, notas_nuevas } = req.body; 

  try {
    // Obtenemos el dato actual para sumar el intento (Lógica de Negocio)
    const solicitudActual = await SolicitudModel.obtenerPorId(id);
    
    if (!solicitudActual) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Preparamos los datos a guardar
    const datosUpdate = {
      status_llamada: status_llamada,
      intentos_llamada: (solicitudActual.intentos_llamada || 0) + 1,
      notas_seguimiento: (solicitudActual.notas_seguimiento || '') + '\n' + notas_nuevas
    };

    // El modelo ejecuta la actualización
    await SolicitudModel.actualizarSeguimiento(id, datosUpdate);

    res.json({ message: 'Seguimiento actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. AGENDAR CITA ---
exports.agendarCita = async (req, res) => {
  const { id } = req.params;
  const { tipo_asignado, fecha_cita, instrucciones, datos_base } = req.body;

  try {
    // A. Escribir en Excel (Servicio externo)
    await sheetsService.agregarAAgenda({
      fecha_cita,
      nombre: `${datos_base.nombre} ${datos_base.apellido_paterno}`,
      telefono: datos_base.telefono,
      tipo: tipo_asignado,
      observaciones: instrucciones
    });

    // B. Guardar en Historial (Modelo)
    await SolicitudModel.crearEntradaHistorial({
      ...datos_base,
      tipo_asignado,
      fecha_cita,
      resultado: 'Agendado'
    });

    // C. Eliminar de Pendientes (Modelo)
    await SolicitudModel.eliminar(id);

    res.json({ message: 'Cita agendada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agendar la cita' });
  }
};

// --- 4. ELIMINAR ---
exports.eliminarSolicitud = async (req, res) => {
  try {
    await SolicitudModel.eliminar(req.params.id);
    res.json({ message: 'Solicitud descartada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};