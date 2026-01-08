const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudesController');

// 1. GET: La "Bandeja de Entrada"
// Obtiene todas las solicitudes que no han sido finalizadas.
router.get('/', solicitudesController.obtenerPendientes);

// 2. PATCH: Registrar intento de llamada (Bitácora rápida)
// Se usa cuando: "Llamé y no contestó" o "Llamé y me colgó".
// Actualiza el contador de intentos y el status de la llamada.
router.patch('/:id/seguimiento', solicitudesController.actualizarSeguimiento);

// 3. POST: Agendar / Finalizar (La acción principal)
// Se usa cuando: "Ya hablé con él, viene el lunes".
// Envía los datos a la Hoja de Cálculo "Agenda" y saca la solicitud de pendientes.
router.post('/:id/agendar', solicitudesController.agendarCita);

// 4. DELETE: Descartar (Basura/Spam)
router.delete('/:id', solicitudesController.eliminarSolicitud);

module.exports = router;