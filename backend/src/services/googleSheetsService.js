const { google } = require('googleapis');

// 1. CARGA Y PARSEO DE CREDENCIALES
let serviceAccount;

try {
  // Asegúrate de que esta variable exista en tu .env
  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("No se encontró la variable FIREBASE_CREDENTIALS en .env");
  }
  
  // Parseamos el string JSON a un objeto JavaScript
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

} catch (error) {
  console.error("❌ Error crítico leyendo credenciales de Firebase/Google:", error.message);
  // Es mejor lanzar el error para que te des cuenta rápido si falta la config
  throw error; 
}

// 2. CONFIGURACIÓN DEL SERVICIO
// El ID de la hoja sí mantenlo separado, ya que no es parte de las credenciales
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'AGENDA';

const auth = new google.auth.GoogleAuth({
  // Pasamos el objeto entero parseado. GoogleAuth es inteligente y sabe leerlo.
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

exports.agregarAAgenda = async (datos) => {
  try {
    const filaNueva = [
      datos.fecha_cita,
      datos.nombre,
      datos.telefono,
      datos.tipo,
      datos.observaciones,
      'PENDIENTE'
    ];

    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [filaNueva] },
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log('✅ Agenda actualizada en Google Sheets');
    return response.data;

  } catch (error) {
    console.error('❌ Error escribiendo en Google Sheets:', error.message);
    throw new Error('No se pudo sincronizar con la Agenda.');
  }
};