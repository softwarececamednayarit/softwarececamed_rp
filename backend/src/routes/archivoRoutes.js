const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Importación del middleware centralizado
const archivoController = require('../controllers/archivoController');

// Aplicación de seguridad global para el archivo de rutas
router.use(verifyToken);

// Registro de oficio y subida a Drive
router.post('/subir', upload.single('archivo'), archivoController.subirArchivo);

module.exports = router;