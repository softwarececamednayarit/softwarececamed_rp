const express = require('express');
const router = express.Router();
// Asegúrate que el nombre del archivo coincida (solicitudesController vs solicitudController)
const solicitudesController = require('../controllers/solicitudController'); 
const verifyToken = require('../middleware/authMiddleware');
router.use(verifyToken);

// 1. GET (Lista)
router.get('/', solicitudesController.obtenerPorStatus);

// 2. PATCH SEGUIMIENTO (ESTA ES LA QUE FALTABA) 🚨
// Sin esta línea, el botón "Guardar Intento" no funciona.
router.patch('/:id/seguimiento', solicitudesController.actualizarSeguimiento);

// 3. POST AGENDAR
router.post('/:id/agendar', solicitudesController.agendarCita);

// 4. PATCH DESCARTAR
router.patch('/:id/descartar', solicitudesController.descartarSolicitud);

// 5. PATCH RECUPERAR
router.patch('/:id/recuperar', solicitudesController.recuperarSolicitud);

module.exports = router;