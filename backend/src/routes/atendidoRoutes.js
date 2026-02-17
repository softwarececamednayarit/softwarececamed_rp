const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');
const { verifyToken } = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas de este router
router.use(verifyToken);

// Rutas estáticas / específicas — siempre antes de las dinámicas
// Nota: si colocas rutas fijas debajo de `/:id` Express las capturará como id.

// Estadísticas
router.get('/resumen', atendidoController.getResumenMensual);

// REPORTES / EXPORTACIÓN
// Padrón: genera Google Sheet (GET porque no modifica la BD)
router.get('/padron/exportar', atendidoController.exportarExpedientesAPadron);

// Registro clásico: formato alternativo con folios
router.get('/clasico/exportar', atendidoController.exportarRegistroClasico);

// Vista previa completa para tablas
router.get('/padron/completo', atendidoController.getAllExpedientes);

// UTILIDADES (uso técnico/admin)
router.post('/migracion', atendidoController.migrarExpedientes);

// Lista básica (paginación/filtrado via query)
router.get('/', atendidoController.getAtendidos);

// RUTAS DINÁMICAS (con :id) — colocar al final
// Obtener expediente completo (base + detalle)
router.get('/:id/completo', atendidoController.getExpedienteCompleto);

// Guardar/actualizar datos del padrón para un expediente
router.put('/:id/padron', atendidoController.updateExpedienteDetalle);

// Actualizar estatus SIREMED en el detalle
router.put('/:id/estatus-siremed', atendidoController.updateEstatusSiremed);

// Obtener datos base por id
router.get('/:id', atendidoController.getAtendidoById);

// Eliminar expediente (borrado físico; requiere precaución)
router.delete('/:id', atendidoController.deleteExpediente);

module.exports = router;