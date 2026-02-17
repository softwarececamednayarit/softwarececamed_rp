const Bitacora = require('../models/bitacoraModel');

// Obtener últimos logs (usa el modelo para acceso a BD)
exports.getLogs = async (req, res) => {
  try {
    const logs = await Bitacora.getRecent(100);
    res.json(logs);
  } catch (error) {
    console.error('Error obteniendo bitácora:', error);
    res.status(500).json({ message: 'Error al obtener la bitácora' });
  }
};