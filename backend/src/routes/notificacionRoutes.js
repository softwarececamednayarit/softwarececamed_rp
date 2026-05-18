const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware'); 

router.use(verifyToken);

router.get('/no-leidas', notificationController.getNoLeidas);
router.patch('/:id/marcar-leida', notificationController.marcarLeida);

module.exports = router;