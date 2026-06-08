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
const SPREADSHEET_ARCHIVOS_ID = process.env.GOOGLE_SHEET_ARCHIVOS_ID;

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
    const esElPaciente = quienPresenta.includes('paciente') || quienPresenta.includes('mismo') || quienPresenta === '';
    const checkEsPaciente = esElPaciente ? 'Sí' : 'No'; 
    
    const repNombre = esElPaciente ? '---' : formatoTitulo(datos.representante_nombre || '');
    const repRelacion = esElPaciente ? '---' : formatoTitulo(datos.representante_parentesco || '');
    const repTelefono = esElPaciente ? '---' : (datos.representante_telefono || '');

    const fechaRegistro = datos.fecha_recepcion || new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Arreglo exacto de 20 elementos coincidiendo con las columnas A-T
    const fila = [
      (datos.tipo_asignado || 'SIN CLASIFICAR').toUpperCase(), // A (0)
      fechaRegistro,                                           // B (1)
      formatoTitulo(datos.quien_presenta || 'Ciudadano'),      // C (2)
      nombreCompleto,                                          // D (3)
      datos.edad || '',                                        // E (4)
      formatoTitulo(datos.sexo || ''),                         // F (5)
      (datos.curp || '').toUpperCase(),                        // G (6)
      datos.telefonoCel || datos.telefono || '',               // H (7)
      datos.telefonoFijo || '',                                // I (8)
      (datos.correoElectronico || '').toLowerCase(),           // J (9)
      formatoTitulo(datos.domicilio || ''),                    // K (10)
      checkEsPaciente,                                         // L (11)
      repNombre,                                               // M (12)
      repRelacion,                                             // N (13)
      repTelefono,                                             // O (14)
      datos.fecha_incidente ? datos.fecha_incidente.split('T')[0] : '', // P (15)
      formatoTitulo(datos.medico_nombre || ''),                // Q (16)
      formatoTitulo(datos.medico_domicilio || ''),             // R (17)
      formatoOracion(datos.descripcion_hechos || ''),          // S (18)
      formatoOracion(datos.instrucciones || datos.notas_seguimiento || '') // T (19)
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_AGENDA_ID,
      range: `AGENDA!A:A`, // Automáticamente insertará en A a T
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      resource: { values: [fila] },
    });
    console.log(`✅ Agenda actualizada para: ${nombreCompleto}`);
    return true;

  } catch (error) {
    console.error('❌ Error escribiendo en Excel:', error.message);
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

    // --- NUEVA LÓGICA DE ORDENAMIENTO ---
    listaDatos.sort((a, b) => {
      const valA = a.no_asignado ? String(a.no_asignado) : '';
      const valB = b.no_asignado ? String(b.no_asignado) : '';

      // 1. Si ambos tienen "No. Asignado", compararlos
      if (valA !== '' && valB !== '') {
        // localeCompare con 'numeric: true' ayuda a que "2" vaya antes que "10"
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      }

      // 2. Si solo uno tiene valor, ese va primero
      if (valA !== '' && valB === '') return -1;
      if (valA === '' && valB !== '') return 1;

      // 3. Si ambos están vacíos (o son idénticos), usar el criterio cronológico original
      const fechaA = new Date(a.fecha_recepcion || 0).getTime();
      const fechaB = new Date(b.fecha_recepcion || 0).getTime();
      const diff = fechaA - fechaB;
      
      if (diff !== 0) return diff;
      return String(a.id).localeCompare(String(b.id));
    });
    // ------------------------------------

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

      const nombreCompleto = formatoTitulo(`${dato.nombre || ''} ${dato.apellido_paterno || ''} ${dato.apellido_materno || ''}`);
      const prestador = formatoTitulo(dato.prestador_nombre || '');

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
        formatoOracion(dato.submotivo_catalogo || ''),                               
        formatoOracion(dato.descripcion_hechos || ''),               
        
        tipoFinal, 
        
        formatoOracion(dato.observaciones_servicio || ''),           
        
        dato.servicio || '',       
        dato.no_asignado || ''     
      ];
    });

    // Escritura en Google Sheets (se mantiene igual)
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

    return { 
        success: true, 
        url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_CLASICO_ID}/edit`, 
        count: filas.length,
        updates: [] 
    };

  } catch (error) {
    console.error("❌ Error en Registro Clásico:", error.message); 
    throw new Error("Falló la generación del Registro Clásico.");
  }
};

// Reporte de archivos: clasifica en 3 hojas según criterios específicos y ordena cronológicamente
exports.generarReporteArchivos = async (listaDatos) => {
  try {
    console.log(`📄 Iniciando reporte de archivos con ${listaDatos.length} registros...`);

    // 1. Ordenar cronológicamente por fechaRecibido y horaRecibido (más antiguos arriba)
    listaDatos.sort((a, b) => {
      // Intentar crear objetos de fecha combinando ambos campos para una ordenación precisa
      const dateTimeA = new Date(`${a.fechaRecibido || '1970-01-01'}T${a.horaRecibido || '00:00:00'}`).getTime();
      const dateTimeB = new Date(`${b.fechaRecibido || '1970-01-01'}T${b.horaRecibido || '00:00:00'}`).getTime();

      const diff = dateTimeA - dateTimeB;
      if (diff !== 0) return diff;

      // Desempate por ID si existe, para asegurar un orden estable
      return String(a.id || '').localeCompare(String(b.id || ''));
    });

    // 2. Definir las tres hojas de destino
    const lotes = {
      'MEMORANDUM ENVIADOS': [],
      'CORRESPONDENCIA RECIBIDA': [],
      'CORRESPONDENCIA ENVIADA': []
    };

    // Contadores individuales por hoja para el número consecutivo (Columna A)
    const contadores = {
      'MEMORANDUM ENVIADOS': 1,
      'CORRESPONDENCIA RECIBIDA': 1,
      'CORRESPONDENCIA ENVIADA': 1
    };

    // 3. Clasificar los datos sin duplicidades
    listaDatos.forEach(dato => {
      // Normalizar cargoRemitente (quitar acentos, espacios extras y pasar a minúsculas)
      const cargoNorm = (dato.cargoRemitente || '')
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const noOficioNorm = (dato.noOficio || '').trim().toUpperCase();
      const tipoDoc = (dato.tipoDocumento || '').trim();

      let hojaDestino = null;

      // Condición estricta para MEMORANDUM ENVIADOS
      if (cargoNorm === 'comisionado estatal' && noOficioNorm.startsWith('MEMORANDUM')) {
        hojaDestino = 'MEMORANDUM ENVIADOS';
      } else if (tipoDoc === 'Recibido') {
        hojaDestino = 'CORRESPONDENCIA RECIBIDA';
      } else if (tipoDoc === 'Enviado') {
        hojaDestino = 'CORRESPONDENCIA ENVIADA';
      }

      // Si cumple con alguna de las hojas mapeadas, se construye la fila
      if (hojaDestino && lotes[hojaDestino]) {
        const consecutivo = contadores[hojaDestino]++;
        
        // Mapeo de columnas de la A a la N
        const fila = [
          consecutivo,                                 // Columna A: Número consecutivo
          dato.noOficio || '',                         // Columna B: noOficio
          dato.fechaDocumento || '',                   // Columna C: fechaDocumento
          dato.origen || '',                           // Columna D: origen
          dato.cargoRemitente || '',                   // Columna E: cargoRemitente
          dato.fechaRecibido || '',                    // Columna F: fechaRecibido
          dato.horaRecibido || '',                     // Columna G: horaRecibido
          dato.asunto || '',                           // Columna H: asunto
          dato.dirigidoA || '',                        // Columna I: dirigidoA
          dato.quienRecibe || '',                      // Columna J: quienRecibe
          dato.url ? `=HYPERLINK("${dato.url}", "[enlace]")` : '', // Columna K: Hipervínculo a la URL de la BD
          dato.estatusActual || '',                    // Columna L: estatusActual
          dato.porcentajeAvance || '',                 // Columna M: porcentajeAvance
          dato.observaciones || ''                     // Columna N: observaciones
        ];

        lotes[hojaDestino].push(fila);
      }
    });

    // 4. Ejecutar la limpieza y la escritura en cada pestaña
    const promesas = Object.keys(lotes).map(async (nombreHoja) => {
      const filasNuevas = lotes[nombreHoja];

      // La estructura establecida inicia en la fila 9 (A9 hasta la columna N)
      const rangoInicio = `'${nombreHoja}'!A9`; 
      const rangoLimpieza = `'${nombreHoja}'!A9:N5000`;

      // A. Limpiar el rango de datos anterior de la fila 9 en adelante
      try {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ARCHIVOS_ID,
          range: rangoLimpieza, 
        });
      } catch (e) {
        console.warn(`⚠️ Aviso: No se pudo limpiar la hoja "${nombreHoja}". Detalles:`, e.message);
        return; 
      }

      // B. Escribir los registros nuevos procesados
      if (filasNuevas.length > 0) {
        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ARCHIVOS_ID,
            range: rangoInicio, 
            valueInputOption: 'USER_ENTERED', // Vital para que reconozca la fórmula =HYPERLINK
            resource: { values: filasNuevas },
          });
          console.log(`✅ ${nombreHoja}: ${filasNuevas.length} registros escritos desde la fila 9.`);
        } catch (writeError) {
          console.error(`❌ Error escribiendo en "${nombreHoja}":`, writeError.message);
        }
      } else {
        console.log(`ℹ️ ${nombreHoja}: No se encontraron registros para escribir.`);
      }
    });

    await Promise.all(promesas);

    const webLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ARCHIVOS_ID}/edit`;

    return { 
        success: true, 
        url: webLink,
        count: listaDatos.length 
    };

  } catch (error) {
    console.error("❌ Error CRÍTICO actualizando el reporte de archivos:", error);
    throw new Error("Falló la actualización del archivo de control. Revisa los logs del servidor.");
  }
};