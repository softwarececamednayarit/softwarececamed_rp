const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');

// =====================================================================
// 1. RUTAS ESTÁTICAS / ESPECÍFICAS (SIEMPRE AL PRINCIPIO)
// =====================================================================
// Estas rutas tienen nombres fijos. Si las pones abajo de :id, Express 
// pensará que "resumen" o "padron" son IDs de usuarios.

// Estadísticas
router.get('/resumen', atendidoController.getResumenMensual);

// --- REPORTES Y EXPORTACIÓN ---

// 1. Padrón (Excel de 4 pestañas trimestrales)
// Cambio importante: Ahora es GET porque solo consulta y genera, no modifica la BD.
router.get('/padron/exportar', atendidoController.exportarExpedientesAPadron);

// 2. Registro Clásico (Nuevo - Excel con folios automáticos) [NUEVA RUTA]
router.get('/clasico/exportar', atendidoController.exportarRegistroClasico);

// 3. Vista Previa (Tabla completa para el Frontend)
router.get('/padron/completo', atendidoController.getAllExpedientes);

// --- UTILIDADES ---
// Script de migración (Solo para uso técnico)
router.post('/migracion', atendidoController.migrarExpedientes);

// Ruta base (Lista simple)
router.get('/', atendidoController.getAtendidos);


// =====================================================================
// 2. RUTAS DINÁMICAS (CON PARÁMETRO :id)
// =====================================================================
// Estas van AL FINAL. El :id actúa como un comodín que atrapa todo lo demás.

// Obtener expediente completo (Base + Detalle)
router.get('/:id/completo', atendidoController.getExpedienteCompleto);

// Guardar/Actualizar datos del Padrón/Gestión
router.put('/:id/padron', atendidoController.updateExpedienteDetalle);

// Obtener solo datos base (La más genérica de todas, siempre al último)
router.get('/:id', atendidoController.getAtendidoById);

module.exports = router;