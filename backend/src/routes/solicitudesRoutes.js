const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren token
router.use(verifyToken);

// Lista por estado (query: status)
router.get('/', solicitudesController.obtenerPorStatus);

// Registrar seguimiento (añade intento y actualiza status)
router.patch('/:id/seguimiento', solicitudesController.actualizarSeguimiento);

// Agendar cita: exporta a Excel y marca como agendado
router.post('/:id/agendar', solicitudesController.agendarCita);

// Descartar (soft delete) con motivo
router.patch('/:id/descartar', solicitudesController.descartarSolicitud);

// Recuperar solicitud descartada
router.patch('/:id/recuperar', solicitudesController.recuperarSolicitud);

module.exports = router;