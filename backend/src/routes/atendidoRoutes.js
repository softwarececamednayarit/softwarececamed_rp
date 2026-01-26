const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');

// ==========================================
// 1. RUTAS ESTÁTICAS / FIJAS (SIEMPRE PRIMERO)
// ==========================================

// URL: GET /api/atendidos/resumen
router.get('/resumen', atendidoController.getResumenMensual);

// --- NUEVA RUTA: Sincronización con Sheets ---
// URL: POST /api/atendidos/padron/exportar
// Esta ruta busca los PENDIENTES, los sube al Excel y los marca como ENVIADO.
// Va antes de /:id para que no confunda "padron" con un ID.
router.post('/padron/exportar', atendidoController.exportarExpedientesAPadron);

// URL: GET /api/atendidos/padron/completo
// Esta obtiene la lista completa (con JOIN) para verla en el front (sin exportar ni cambiar estatus)
router.get('/padron/completo', atendidoController.getAllExpedientes);

// Ruta de migración
router.post('/migracion', atendidoController.migrarExpedientes);

// URL: GET /api/atendidos (Ruta base)
router.get('/', atendidoController.getAtendidos);


// ==========================================
// 2. RUTAS DINÁMICAS (CON PARÁMETROS :id)
// ==========================================
// Estas capturan "cualquier cosa" que siga a la barra, por eso van al final.

// URL: GET /api/atendidos/:id/completo
router.get('/:id/completo', atendidoController.getExpedienteCompleto);

// URL: PUT /api/atendidos/:id/padron
router.put('/:id/padron', atendidoController.actualizarPadron);

// URL: GET /api/atendidos/:id 
router.get('/:id', atendidoController.getAtendidoById);

module.exports = router;