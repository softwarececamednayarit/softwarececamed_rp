const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;

try {
  // Parseamos el string que viene del .env a un objeto real de JS
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error("Error al leer las credenciales de Firebase:", error.message);
  process.exit(1); // Detiene el servidor si no hay conexión
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("Conexión a Firestore establecida correctamente");

module.exports = db;