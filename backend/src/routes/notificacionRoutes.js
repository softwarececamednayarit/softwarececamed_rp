const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const notificacionController = require('../controllers/notificacionController');

router.use(verifyToken);

router.get('/no-leidas', notificacionController.getNoLeidas);
router.patch('/:id/leer', notificacionController.marcarLeida);

module.exports = router;