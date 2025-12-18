const express = require('express');
const router = express.Router();
const { getAtendidos } = require('../controllers/atendidoController');

// La ruta base para los atendidos
router.get('/', getAtendidos);

module.exports = router;