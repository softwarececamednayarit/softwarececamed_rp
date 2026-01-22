const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');

// 1. RUTAS FIJAS (Van primero)
// URL: GET /api/atendidos/resumen
router.get('/resumen', atendidoController.getResumenMensual);

// 2. RUTAS DINÁMICAS (Van después)
// URL: GET /api/atendidos/:id (Para ver la ficha de los 35 campos)
router.get('/:id', atendidoController.getAtendidoById);

// 3. RUTA BASE / FILTRADO
// URL: GET /api/atendidos
router.get('/', atendidoController.getAtendidos);

// Ruta COMPLETA (Pesada - Padrón/Detalle)
// Usamos /:id/completo para diferenciarla
router.get('/:id/completo', atendidoController.getExpedienteCompleto);

// Ruta de migración (Temporal)
router.post('/migracion', atendidoController.migrarExpedientes);

router.put('/:id/padron', atendidoController.actualizarPadron);

module.exports = router;