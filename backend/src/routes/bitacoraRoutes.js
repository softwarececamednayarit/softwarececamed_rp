const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacoraController');
const { verifyToken } = require('../middleware/authMiddleware'); 

// Protegemos todas las rutas de este archivo
router.use(verifyToken);

// Rutas de bitácora (solo lectura)
router.get('/', bitacoraController.getLogs);

module.exports = router;