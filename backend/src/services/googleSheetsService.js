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


const SPREADSHEET_PADRON_ID = process.env.GOOGLE_SHEET_PADRON_ID; // Tu nueva variable de entorno

// --- NUEVOS HELPERS PARA PADRÓN ---

const obtenerHojaTrimestre = (fechaStr) => {
  if (!fechaStr) return '1er trimestre'; 
  
  // Intentar parsear fecha (asumiendo YYYY-MM-DD o ISO)
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return '1er trimestre'; // Fallback si la fecha es inválida

  const mes = fecha.getMonth(); // 0 = Enero, 11 = Diciembre

  if (mes >= 0 && mes <= 2) return '1er trimestre'; // Ene-Mar
  if (mes >= 3 && mes <= 5) return '2do trimestre'; // Abr-Jun
  if (mes >= 6 && mes <= 8) return '3er trimestre'; // Jul-Sep
  if (mes >= 9 && mes <= 11) return '4to trimestre';// Oct-Dic
  
  return '1er trimestre';
};

exports.exportarLotePadron = async (listaCompleta) => {
  try {
    // -----------------------------------------------------------
    // 1. FILTRADO INTELIGENTE
    // -----------------------------------------------------------
    const listosParaSubir = listaCompleta.filter(item => {
      // CONDICIÓN A: Que no se haya subido antes
      const esPendiente = item.estatus_padron === 'PENDIENTE' || !item.estatus_padron;

      // CONDICIÓN B: Que tenga los datos MÍNIMOS obligatorios (Validación)
      // Ajusta estos campos según lo que consideres "incompleto"
      const estaCompleto = 
          item.nombre && 
          item.apellido_paterno && 
          item.curp && 
          item.curp.length >= 10 && // Validación básica de CURP
          item.tipo_apoyo &&
          item.municipio;

      return esPendiente && estaCompleto;
    });

    if (listosParaSubir.length === 0) {
      console.log('⚠ No se encontraron registros PENDIENTES y COMPLETOS para subir.');
      return { procesados: 0, ids: [] };
    }

    // -----------------------------------------------------------
    // 2. CLASIFICACIÓN POR TRIMESTRE
    // -----------------------------------------------------------
    const lotes = {
      '1er trimestre': [],
      '2do trimestre': [],
      '3er trimestre': [],
      '4to trimestre': []
    };

    const idsProcesados = [];

    listosParaSubir.forEach(dato => {
      const hoja = obtenerHojaTrimestre(dato.fecha_beneficio);
      
      // Mapeo EXACTO de columnas A - P
      const fila = [
        formatoTitulo(dato.tipo_beneficiario || 'Ciudadano'), // A
        dato.criterio_seleccion || 'Solicitud Directa',       // B
        dato.tipo_apoyo || 'Servicio',                        // C
        dato.monto_apoyo || '0',                              // D
        (dato.curp || '').toUpperCase(),                      // E
        formatoTitulo(dato.nombre || ''),                     // F
        formatoTitulo(`${dato.apellido_paterno || ''} ${dato.apellido_materno || ''}`), // G
        formatoTitulo(dato.sexo || ''),                       // H
        formatoTitulo(dato.parentesco || ''),                 // I
        dato.edad || '',                                      // J
        formatoTitulo(dato.estado_civil || ''),               // K
        formatoTitulo(dato.cargo_ocupacion || ''),            // L
        formatoOracion(dato.actividad_apoyo || ''),           // M
        formatoTitulo(dato.municipio || ''),                  // N
        formatoTitulo(dato.localidad || ''),                  // O
        dato.fecha_beneficio || ''                            // P
      ];

      if (lotes[hoja]) {
        lotes[hoja].push(fila);
        idsProcesados.push(dato.id); 
      }
    });

    // -----------------------------------------------------------
    // 3. ENVÍO A SHEETS
    // -----------------------------------------------------------
    const promesasEnvio = Object.keys(lotes).map(async (nombreHoja) => {
      const filas = lotes[nombreHoja];
      if (filas.length === 0) return;

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_PADRON_ID,
        range: `${nombreHoja}!A12`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: filas },
      });
    });

    await Promise.all(promesasEnvio);
    
    return { procesados: idsProcesados.length, ids: idsProcesados };

  } catch (error) {
    console.error('❌ Error exportando lote al Padrón:', error.message);
    throw new Error('Falló la sincronización con Google Sheets Padrón.');
  }
};