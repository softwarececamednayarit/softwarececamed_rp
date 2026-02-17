const { google } = require('googleapis');

/*
 * Servicio `googleSheetsService`
 * Helpers para generar/actualizar Google Sheets usados por el backend
 * - Agenda (append)
 * - Padrón (limpiar y pegar por trimestres)
 * - Registro clásico (formato visual)
 * Requiere `FIREBASE_CREDENTIALS` en el entorno (JSON stringificado).
 */

// Carga y parseo de credenciales desde env
let serviceAccount;
try {
  if (!process.env.FIREBASE_CREDENTIALS) {
    throw new Error('No se encontró la variable FIREBASE_CREDENTIALS en .env');
  }
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error('❌ Error crítico leyendo credenciales:', error.message);
  throw error;
}

// Configurar cliente de Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// IDs de hojas en entorno
const SPREADSHEET_AGENDA_ID = process.env.GOOGLE_SHEET_ID;
const SPREADSHEET_PADRON_ID = process.env.GOOGLE_SHEET_PADRON_ID;
const SPREADSHEET_CLASICO_ID = process.env.GOOGLE_SHEET_CLASICO_ID;

// Helpers de formato
const formatoTitulo = (texto) => {
  if (!texto) return '';
  return texto.toLowerCase().split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
};

const formatoOracion = (texto) => {
  if (!texto) return '';
  let res = texto.toLowerCase();
  res = res.charAt(0).toUpperCase() + res.slice(1);
  return res.replace(/(\. \w)/g, (match) => match.toUpperCase());
};

// Determina pestaña de trimestre según fecha
const obtenerHojaTrimestre = (fechaStr) => {
  if (!fechaStr) return '1er trimestre'; 
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return '1er trimestre'; 
  const mes = fecha.getMonth(); 
  if (mes >= 0 && mes <= 2) return '1er trimestre';
  if (mes >= 3 && mes <= 5) return '2do trimestre';
  if (mes >= 6 && mes <= 8) return '3er trimestre';
  if (mes >= 9 && mes <= 11) return '4to trimestre';
  return '1er trimestre';
};

// Agenda: añade una fila a la hoja de Agenda
exports.agregarAAgenda = async (datos) => {
  try {
    const nombreRaw = `${datos.nombre || ''} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim();
    const nombreCompleto = formatoTitulo(nombreRaw);
    const quienPresenta = (datos.quien_presenta || '').toLowerCase();
    const esElPaciente = quienPresenta.includes('paciente') || quienPresenta.includes('mismo');
    const checkEsPaciente = esElPaciente ? 'Sí' : 'No'; 
    
    const repNombre = esElPaciente ? '---' : formatoTitulo(datos.representante_nombre || '');
    const repTelefono = esElPaciente ? '---' : (datos.representante_telefono || '');
    const repRelacion = esElPaciente ? '---' : formatoTitulo(datos.representante_parentesco || '');

    const fila = [
      (datos.tipo_asignado || 'SIN CLASIFICAR').toUpperCase(),
      nombreCompleto,
      datos.telefono || '',
      checkEsPaciente,
      repNombre,
      repTelefono,
      repRelacion,
      formatoTitulo(datos.medico_nombre || ''),
      formatoOracion(datos.notas_seguimiento || ''),
      formatoOracion(datos.descripcion_hechos || ''),
      datos.edad || '',
      formatoTitulo(datos.sexo || ''),
      (datos.curp || '').toUpperCase(),
      formatoTitulo(datos.domicilio || ''),
      datos.fecha_recepcion || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_AGENDA_ID,
      range: `AGENDA!A:A`, 
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      resource: { values: [fila] },
    });
    console.log(`Agenda actualizada para: ${nombreCompleto}`);
    return true;

  } catch (error) {
    console.error('Error escribiendo en Excel:', error.message);
    throw new Error('No se pudo sincronizar con la hoja de Agenda.');
  }
};

// Padrón: limpia y escribe registros clasificados por trimestres
exports.generarReporteCompleto = async (listaDatos) => {
  try {
    console.log(`📄 Iniciando reporte Padrón en hoja existente con ${listaDatos.length} registros...`);

    // Ordenar cronológicamente (más antiguos arriba)
    listaDatos.sort((a, b) => {
      // Usamos fecha_beneficio porque es la clave de este reporte
      const fechaA = new Date(a.fecha_beneficio || 0).getTime();
      const fechaB = new Date(b.fecha_beneficio || 0).getTime();
      
      // ASCENDENTE (Viejos arriba): A - B
      const diff = fechaA - fechaB; 
      
      if (diff !== 0) return diff;

      // Desempate por ID para evitar saltos si tienen la misma hora
      return String(a.id).localeCompare(String(b.id));
    });

    // Clasificar en 4 trimestres (pestañas)
    const lotes = {
      '1er trimestre': [],
      '2do trimestre': [],
      '3er trimestre': [],
      '4to trimestre': []
    };

    listaDatos.forEach(dato => {
      // Asegúrate que esta función devuelva exactamente el nombre de la pestaña en tu Excel
      const hoja = obtenerHojaTrimestre(dato.fecha_beneficio); 
      
      const fila = [
        formatoTitulo(dato.tipo_beneficiario || 'Ciudadano'),
        dato.criterio_seleccion || 'Solicitud Directa',
        dato.tipo_apoyo || 'Servicio',
        dato.monto_apoyo || '0',
        (dato.curp || '').toUpperCase(),
        formatoTitulo(dato.nombre || ''),
        formatoTitulo(`${dato.apellido_paterno || ''} ${dato.apellido_materno || ''}`),
        formatoTitulo(dato.sexo || ''),
        formatoTitulo(dato.parentesco || ''),
        dato.edad || '',
        formatoTitulo(dato.estado_civil || ''),
        formatoTitulo(dato.cargo_ocupacion || ''),
        formatoOracion(dato.actividad_apoyo || ''),
        formatoTitulo(dato.municipio || ''),
        formatoTitulo(dato.localidad || ''),
        dato.fecha_beneficio || ''
      ];

      // Protección por si la fecha devuelve una hoja que no definimos en 'lotes'
      if (lotes[hoja]) {
        lotes[hoja].push(fila);
      }
    });

    // Ejecutar limpieza y escritura por cada hoja
    const promesas = Object.keys(lotes).map(async (nombreHoja) => {
      const filasNuevas = lotes[nombreHoja];

      // OJO: Agregamos comillas simples '' alrededor del nombre de la hoja
      // Esto es vital cuando el nombre tiene espacios (ej: '1er trimestre'!A12)
      const rango = `'${nombreHoja}'!A12`; 
      const rangoLimpieza = `'${nombreHoja}'!A12:P2000`;

      // A. Limpiar rango objetivo
      try {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_PADRON_ID,
          range: rangoLimpieza, 
        });
      } catch (e) {
        // Imprimimos el error real para depurar
        console.warn(`⚠️ Aviso: No se pudo limpiar la hoja "${nombreHoja}". Detalles:`, e.message);
        return; // Si no encuentra la hoja, saltamos al siguiente trimestre
      }

      // B. Escribir datos nuevos (si existen)
      if (filasNuevas.length > 0) {
        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_PADRON_ID,
            range: rango, 
            valueInputOption: 'USER_ENTERED',
            resource: { values: filasNuevas },
          });
          console.log(`✅ ${nombreHoja}: ${filasNuevas.length} registros escritos.`);
        } catch (writeError) {
          console.error(`❌ Error escribiendo en "${nombreHoja}":`, writeError.message);
        }
      }
    });

    await Promise.all(promesas);

    const webLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_PADRON_ID}/edit`;

    return { 
        success: true, 
        url: webLink,
        count: listaDatos.length 
    };

  } catch (error) {
    console.error("❌ Error CRÍTICO actualizando Padrón:", error);
    throw new Error("Falló la actualización del archivo Excel. Revisa los logs del servidor.");
  }
};

// Registro clásico: formato visual con columnas específicas
exports.generarReporteClasico = async (listaDatos) => {
  try {
    console.log(`📄 Generando Registro Clásico para ${listaDatos.length} expedientes...`);

    // Ordenar cronológicamente
    listaDatos.sort((a, b) => {
      const fechaA = new Date(a.fecha_recepcion || 0).getTime();
      const fechaB = new Date(b.fecha_recepcion || 0).getTime();
      const diff = fechaA - fechaB;
      if (diff !== 0) return diff;
      return String(a.id).localeCompare(String(b.id));
    });

    // Mapear cada expediente a la fila esperada por la hoja
    const filas = listaDatos.map(dato => {
      
      // 1. Cálculo del tipo para la columna "TIPO DE ASUNTO"
      let textoBase = (dato.actividad_apoyo || dato.tipo_asunto || 'Orientacion')
          .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
      
      let tipoAnalisis = textoBase.charAt(0).toUpperCase() + textoBase.slice(1).toLowerCase(); 
      let tipoFinal = 'Orientación';

      if (tipoAnalisis.includes('Asesoria')) {
          tipoFinal = 'Asesoría';
      } else if (tipoAnalisis.includes('Orientacion')) {
          tipoFinal = 'Orientación';
      } else if (tipoAnalisis.includes('Gestion')) {
          tipoFinal = 'Gestión';
      } else if (tipoAnalisis.includes('Queja')) {
          tipoFinal = 'Queja';
      } else if (tipoAnalisis.includes('Dictamen')) {
          tipoFinal = 'Dictamen';
      }

      // 2. Formateo de nombres
      const nombreCompleto = formatoTitulo(`${dato.nombre || ''} ${dato.apellido_paterno || ''} ${dato.apellido_materno || ''}`);
      const prestador = formatoTitulo(dato.prestador_nombre || '');

      // 3. Retorno de fila (últimas columnas toman valores de la BD)
      return [
        dato.fecha_recepcion || '',                                      
        dato.foraneo ? 'Si' : 'No',                                      
        nombreCompleto,                                                      
        formatoTitulo(dato.domicilio || ''),                             
        dato.telefono || '',                                                 
        dato.edad || '',                                                     
        formatoTitulo(dato.estado_civil || ''),                              
        formatoTitulo(dato.sexo || ''),                                      
        formatoTitulo(dato.ocupacion || dato.cargo_ocupacion || ''), 
        (dato.curp || '').toUpperCase(),                                     
        formatoTitulo(dato.representante || ''),                     
        dato.via_telefonica ? 'Si' : 'No',                                   
        prestador,                                                           
        formatoOracion(dato.diagnostico || ''), 
        formatoTitulo(dato.especialidad || ''),                              
        formatoOracion(dato.motivo_inconformidad || ''),             
        formatoOracion(dato.submotivo || ''),                                
        formatoOracion(dato.descripcion_hechos || ''),               
        
        tipoFinal, // Columna calculada (TIPO DE ASUNTO)
        
        formatoOracion(dato.observaciones_servicio || ''),           
        
        // 👇 AQUÍ YA NO SE GENERA, SE PONE LO QUE HAYA EN BD O VACÍO
        dato.servicio || '',       // Columna "Folio Servicio"                                                
        dato.no_asignado || ''     // Columna "No. Asignado / Interno"                                              
      ];
    });

    // Limpiar y escribir en la hoja "Datos"
    const NOMBRE_HOJA = 'Datos';
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_CLASICO_ID,
        range: `${NOMBRE_HOJA}!A2:V10000`,
      });
    } catch (e) {
      console.warn('Aviso: No se pudo limpiar la hoja o es la primera vez.');
    }

    if (filas.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_CLASICO_ID,
        range: `${NOMBRE_HOJA}!A2`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: filas },
      });
    }

    // Retorno (mantener compatibilidad con controlador)
    return { 
        success: true, 
        url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_CLASICO_ID}/edit`, 
        count: filas.length,
        updates: [] // Enviamos vacío para no romper el controlador si espera este array
    };

  } catch (error) {
    console.error("❌ Error en Registro Clásico:", error.message); 
    throw new Error("Falló la generación del Registro Clásico.");
  }
};