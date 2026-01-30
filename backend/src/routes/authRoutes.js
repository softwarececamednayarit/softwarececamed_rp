const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// ==========================================================
// 1. RUTAS PÚBLICAS (Cualquiera puede entrar)
// ==========================================================

// El Login SIEMPRE debe ser público (aquí es donde te dan el token)
router.post('/login', authController.login);

// NOTA: Normalmente el registro es público si es una red social. 
// Pero en un sistema administrativo como CECAMED, a veces se protege 
// para que solo un Admin logueado pueda crear otros usuarios.
// Si es público, déjalo aquí. Si es privado, bájalo después del verifyToken.
// router.post('/register', authController.register); 


// ==========================================================
// 2. ACTIVAR EL PORTERO (Middleware)
// ==========================================================
// A partir de esta línea, todas las rutas de abajo requieren Token.
router.use(verifyToken);

// ==========================================================
// 3. RUTAS PROTEGIDAS (Solo usuarios logueados)
// ==========================================================

// Solo alguien que ya entró puede cambiar su contraseña
router.post('/change-password', authController.changePassword);

// Si decides que solo un usuario logueado (Admin) puede crear nuevos usuarios:
router.post('/register', authController.register);

module.exports = router;