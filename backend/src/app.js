const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(cors()); // Permite que tu Frontend se conecte desde otro puerto/dominio
app.use(express.json()); // Permite recibir datos en formato JSON

// --- Importar Rutas (Las crearemos a continuación) ---
const atendidosRoutes = require('./routes/atendidoRoutes');

// --- Definir Rutas ---
app.use('/api/atendidos', atendidosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Servidor de CECAMED operando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;