const multer = require('multer');

// Configuración de almacenamiento en memoria para eficiencia con Google Drive
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 15 * 1024 * 1024 // Límite de 15MB
    },
    fileFilter: (req, file, cb) => {
        // Validación estricta de tipo de archivo
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    }
});

module.exports = upload;