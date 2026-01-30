const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// ==========================================================
// 1. RUTAS PÚBLICAS (Cualquiera puede entrar)
// ==========================================================
router.post('/login', authController.login);

// ==========================================================
// 2. ACTIVAR EL PORTERO (Middleware de Autenticación)
// ==========================================================
// 🛑 A partir de aquí, NADIE pasa sin un Token válido.
router.use(verifyToken);


// ==========================================================
// 3. RUTAS DE USUARIO (Cualquier rol logueado)
// ==========================================================
// Un usuario normal puede cambiar SU propia contraseña
router.post('/change-password', authController.changePassword);


// ==========================================================
// 4. FILTRO DE SEGURIDAD EXTRA (Solo Admins)
// ==========================================================
// Creamos un pequeño middleware aquí mismo para no dejar pasar 
// a nadie que no sea 'admin' a las rutas de abajo.
const soloAdmin = (req, res, next) => {
    // req.user viene del verifyToken anterior
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Acceso denegado. Se requieren permisos de Administrador.' 
        });
    }
    next();
};

// Aplicamos el filtro
router.use(soloAdmin);

// ==========================================================
// 5. RUTAS DE ADMINISTRADOR (La "Zona VIP")
// ==========================================================

// A. Crear nuevos usuarios (Solo el admin debe poder crear gente)
router.post('/register', authController.register); 

// B. Ver la tabla completa de usuarios
// Ruta final: GET /api/auth/users
router.get('/users', authController.getAllUsers); 

// C. Banear o Activar usuarios (El interruptor)
// Ruta final: PATCH /api/auth/users/:id/status
router.patch('/users/:id/status', authController.toggleUserStatus);

// D. Resetear contraseña de OTRO usuario (Cuando la olvidan)
// Ruta final: PATCH /api/auth/users/:id/reset-password
router.patch('/users/:id/reset-password', authController.adminResetPassword);

// E. Editar usuario existente
router.put('/users/:id', authController.updateUser);

module.exports = router;