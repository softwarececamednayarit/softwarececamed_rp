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

module.exports = {
  getAtendidos
};