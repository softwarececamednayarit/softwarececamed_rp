const { google } = require('googleapis');

// 1. CARGA Y PARSEO DE CREDENCIALES
let serviceAccount;

try {
  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error("No se encontró la variable FIREBASE_CREDENTIALS en .env");
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error("❌ Error crítico leyendo credenciales:", error.message);
  throw error; 
}

// 2. CONFIGURACIÓN DEL SERVICIO
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'AGENDA'; 

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// --- FUNCIONES DE FORMATO (HELPERS) ---

// Convierte: "JUAN PEREZ" o "juan perez" -> "Juan Perez"
const formatoTitulo = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

// Convierte: "el paciente llego. dolia mucho." -> "El paciente llego. Dolia mucho."
const formatoOracion = (texto) => {
  if (!texto) return '';
  // 1. Convertir todo a minúscula base
  let resultado = texto.toLowerCase();
  // 2. Mayúscula a la primera letra absoluta
  resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1);
  // 3. Mayúscula después de cada punto y espacio (. )
  resultado = resultado.replace(/(\. \w)/g, (match) => match.toUpperCase());
  return resultado;
};

exports.agregarAAgenda = async (datos) => {
  try {
    // ---------------------------------------------------------
    // A. LÓGICA DE TRANSFORMACIÓN
    // ---------------------------------------------------------

    // 1. Armar nombre completo (Usamos formato Titulo)
    const nombreRaw = `${datos.nombre || ''} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim();
    const nombreCompleto = formatoTitulo(nombreRaw);

    // 2. Lógica: ¿Quién presenta?
    const quienPresenta = (datos.quien_presenta || '').toLowerCase();
    const esElPaciente = quienPresenta.includes('paciente') || quienPresenta.includes('mismo');

    // 3. Variables calculadas
    const checkEsPaciente = esElPaciente ? 'Sí' : 'No'; // Más limpio que mayúscula cerrada
    
    // Limpieza de representante
    const repNombre = esElPaciente ? '---' : formatoTitulo(datos.representante_nombre || '');
    const repTelefono = esElPaciente ? '---' : (datos.representante_telefono || '');
    const repRelacion = esElPaciente ? '---' : formatoTitulo(datos.representante_parentesco || '');

    // ---------------------------------------------------------
    // B. DEFINICIÓN DE COLUMNAS (SCHEMA)
    // ---------------------------------------------------------
    const fila = [
      // [COL A] TIPO (Este sí lo dejamos en mayúscula para que resalte como etiqueta)
      (datos.tipo_asignado || 'SIN CLASIFICAR').toUpperCase(),

      // [COL B] NOMBRE DEL PACIENTE (Formato Título)
      nombreCompleto,

      // [COL C] TELÉFONO
      datos.telefono || '',

      // [COL D] ¿ES EL PACIENTE?
      checkEsPaciente,

      // [COL E] NOMBRE REPRESENTANTE (Formato Título)
      repNombre,

      // [COL F] TELÉFONO REPRESENTANTE 
      repTelefono,

      // [COL G] PARENTESCO (Formato Título)
      repRelacion,

      // [COL H] CONTRA QUIÉN ES (Formato Título para nombres de docs/clínicas)
      formatoTitulo(datos.medico_nombre || ''),

      // [COL I] INSTRUCCIONES (Formato Oración: Texto legible)
      formatoOracion(datos.notas_seguimiento || ''),

      // [COL J] HECHOS (Formato Oración: Texto legible)
      formatoOracion(datos.descripcion_hechos || ''),

      // --- DATOS DEMOGRÁFICOS ---
      // [COL K] EDAD
      datos.edad || '',
      
      // [COL L] SEXO (H/M o Mujer/Hombre - Formato Título)
      formatoTitulo(datos.sexo || ''),
      
      // [COL M] CURP (Este SIEMPRE debe ser mayúscula cerrada por ley)
      (datos.curp || '').toUpperCase(),
      
      // [COL N] DOMICILIO (Formato Título o Oración, Título se ve mejor en direcciones)
      formatoTitulo(datos.domicilio || ''),
      
      // [COL O] FECHA
      datos.fecha_recepcion || ''
    ];

    // ---------------------------------------------------------
    // C. ESCRITURA
    // ---------------------------------------------------------
    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`, 
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      resource: { values: [fila] },
    };

    await sheets.spreadsheets.values.append(request);
    console.log(`Agenda actualizada para: ${nombreCompleto}`);
    return true;

  } catch (error) {
    console.error('Error escribiendo en Excel:', error.message);
    throw new Error('No se pudo sincronizar con la hoja de Agenda.');
  }
};