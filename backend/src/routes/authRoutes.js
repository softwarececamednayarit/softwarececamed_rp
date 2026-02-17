const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Rutas públicas
router.post('/login', authController.login);

// A partir de aquí todas las rutas requieren token válido
router.use(verifyToken);

// Rutas de usuario (cualquier usuario autenticado)
router.post('/change-password', authController.changePassword);

// Rutas de administración
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);
router.patch('/users/:id/status', authController.toggleUserStatus);
router.patch('/users/:id/reset-password', authController.adminResetPassword);
router.put('/users/:id', authController.updateUser);

module.exports = router;