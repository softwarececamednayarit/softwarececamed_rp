const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Importación del middleware centralizado
const archivoController = require('../controllers/archivoController');

// Aplicación de seguridad global para el archivo de rutas
router.use(verifyToken);

// Registro de oficio y subida a Drive
router.post('/subir', upload.single('archivo'), archivoController.subirArchivo);

router.get('/mis-archivos', verifyToken, archivoController.getMisArchivos);

router.get('/papelera', verifyToken, archivoController.getPapelera);

router.get('/compartidos', verifyToken, archivoController.getCompartidos);

router.put('/:id', verifyToken, archivoController.editarArchivo);

router.patch('/:id/eliminar', verifyToken, archivoController.eliminarArchivo);

module.exports = router;