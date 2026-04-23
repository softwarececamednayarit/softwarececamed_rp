/**
 * Servidor Express principal
 * - Carga variables de entorno con `dotenv`.
 * - Expone las rutas del API bajo `/api/*`.
 * - Exporta `app` para facilitar tests o integración con servidores externos.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---
// Habilita CORS para que el frontend (vite/puerto diferente) pueda consumir la API.
app.use(cors());
// Parseo automático de JSON en body de peticiones.
app.use(express.json());

// --- Importar Rutas ---
// Cada archivo de rutas exporta un Router con endpoints relacionados.
const atendidosRoutes = require('./routes/atendidoRoutes');
const authRoutes = require('./routes/authRoutes');
const solicitudesRoutes = require('./routes/solicitudesRoutes');
const bitacoraRoutes = require('./routes/bitacoraRoutes');
const archivoRoutes = require('./routes/archivoRoutes');

// --- Montar Rutas ---
// Mantener prefijos claros facilita la lectura y la seguridad (scoping).
app.use('/api/atendidos', atendidosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/archivos', archivoRoutes);

// Ruta de salud / prueba rápida
app.get('/', (req, res) => {
  res.send('🚀 Servidor de CECAMED operando correctamente');
});

// Puerto y arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;