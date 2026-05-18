const NotificacionModel = require('../models/notificationModel');

exports.getNoLeidas = async (req, res) => {
  try {
    const notificaciones = await NotificacionModel.obtenerNoLeidas(req.user.id);
    res.json({ success: true, count: notificaciones.length, data: notificaciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificacionModel.marcarComoLeida(id);
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};