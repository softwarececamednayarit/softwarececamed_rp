const Atendido = require('../models/atendidoModel');

const getAtendidos = async (req, res) => {
  try {
    const data = await Atendido.getAll();
    res.status(200).json({
      ok: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};

const getResumenMensual = async (req, res) => {
  try {
    // 1. Extraemos los filtros de la URL (ej: ?fechaInicio=2025-01-01&tipo=QUEJA)
    const { fechaInicio, fechaFin, tipo } = req.query;
    // 2. Llamamos a la función filtrada del modelo que creamos antes
    const data = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    // 3. Agrupación Inteligente con .reduce()
    const resumen = data.reduce((acc, curr) => {
      // Extraemos el mes (YYYY-MM) de la fecha_recepcion
      const mes = curr.fecha_recepcion ? curr.fecha_recepcion.substring(0, 7) : "Sin Fecha";
      // Si el mes no existe en nuestro acumulador, lo creamos
      if (!acc[mes]) {
        acc[mes] = { total: 0 };
      }
      // Incrementamos el total del mes
      acc[mes].total++;
      
      // --- CONTEO DINÁMICO DE TIPOS ---
      // Si el tipo es "ASESORÍA", creará la llave "ASESORÍA" y sumará. 
      // Si mañana agregas "GESTIÓN", lo hará solo sin tocar el código.
      const nombreTipo = curr.tipo || "NO_DEFINIDO";
      
      if (!acc[mes][nombreTipo]) {
        acc[mes][nombreTipo] = 0;
      }
      acc[mes][nombreTipo]++;

      return acc;
    }, {});

    res.status(200).json({
      ok: true,
      filtros_aplicados: { fechaInicio, fechaFin, tipo },
      resumen
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getAtendidos,
  getResumenMensual
};