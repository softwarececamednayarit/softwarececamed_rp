const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacoraController');

// AQUI EL CAMBIO: Usamos destructuring { } porque ahora exportamos un objeto
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Protegemos todas las rutas de este archivo
router.use(verifyToken);

// =====================================================================
// RUTAS DE SISTEMA
// =====================================================================

// Solo el admin puede ver los logs
router.get('/', isAdmin, bitacoraController.getLogs);

module.exports = router;