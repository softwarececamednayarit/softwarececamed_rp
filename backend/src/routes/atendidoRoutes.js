const express = require('express');
const router = express.Router();
const atendidoController = require('../controllers/atendidoController');

// La ruta base para los atendidos
router.get('/', atendidoController.getAtendidos);
router.get('/resumen', atendidoController.getResumenMensual);

module.exports = router;