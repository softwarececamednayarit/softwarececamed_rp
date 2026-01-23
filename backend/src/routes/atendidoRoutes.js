const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');

// ==========================================
// 1. RUTAS ESTÁTICAS / FIJAS (SIEMPRE PRIMERO)
// ==========================================

// URL: GET /api/atendidos/resumen
router.get('/resumen', atendidoController.getResumenMensual);

// URL: GET /api/atendidos/padron/completo
// ¡IMPORTANTE! Esta debe ir ANTES de cualquier /:id para evitar conflicto
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
// (Si pusieras esta arriba, "padron/completo" caería aquí creyendo que el id es "padron")
router.get('/:id/completo', atendidoController.getExpedienteCompleto);

// URL: PUT /api/atendidos/:id/padron
router.put('/:id/padron', atendidoController.actualizarPadron);

// URL: GET /api/atendidos/:id 
// (Suele ir al final de todo para no interferir con sub-rutas si usaras regex, 
// aunque en este caso estricto no choca con /:id/algo, es buena práctica dejarla al final)
router.get('/:id', atendidoController.getAtendidoById);

module.exports = router;