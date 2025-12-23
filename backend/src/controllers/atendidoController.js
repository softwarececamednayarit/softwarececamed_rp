const Atendido = require('../models/atendidoModel');

// 1. Obtener lista con filtros y búsqueda (Sustituye al getAtendidos simple)
const getAtendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, nombre } = req.query;
    let data;

    // Si viene un nombre, usamos la búsqueda específica del modelo
    if (nombre) {
      data = await Atendido.searchByName(nombre);
    } else {
      // Si no, usamos los filtros de rango y tipo
      data = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });
    }

    res.status(200).json({
      ok: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// 2. Obtener un solo registro (Indispensable para ver detalles de los 35 campos)
const getAtendidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Atendido.getById(id);

    if (!data) {
      return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    }

    res.status(200).json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// 3. Resumen estadístico (Tu función actual mejorada)
const getResumenMensual = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;
    const data = await Atendido.getFiltered({ fechaInicio, fechaFin, tipo });

    const resumen = data.reduce((acc, curr) => {
      // Normalizamos la fecha para agrupar (YYYY-MM)
      const mes = curr.fecha_recepcion ? curr.fecha_recepcion.substring(0, 7) : "Sin Fecha";
      
      if (!acc[mes]) {
        acc[mes] = { total: 0, categorias: {} };
      }

      acc[mes].total++;

      // Agrupamos tipos dinámicamente dentro de un objeto 'categorias' para mayor orden
      const nombreTipo = curr.tipo || "NO_DEFINIDO";
      acc[mes].categorias[nombreTipo] = (acc[mes].categorias[nombreTipo] || 0) + 1;

      return acc;
    }, {});

    res.status(200).json({
      ok: true,
      resumen
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = {
  getAtendidos,
  getAtendidoById,
  getResumenMensual
};