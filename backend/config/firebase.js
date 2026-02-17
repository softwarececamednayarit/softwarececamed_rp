/**
 * Inicializa Firebase Admin y exporta la instancia de Firestore.
 * Requiere la variable de entorno `FIREBASE_CREDENTIALS` como JSON string.
 */
const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;

try {
  // Parsear la variable de entorno a objeto JS
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error('Error leyendo credenciales de Firebase:', error.message);
  process.exit(1); // No iniciar sin credenciales válidas
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firestore conectado');

module.exports = db;