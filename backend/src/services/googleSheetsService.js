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
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// --- CONSTANTES DE ID ---
const SPREADSHEET_AGENDA_ID = process.env.GOOGLE_SHEET_ID; 
const SPREADSHEET_PADRON_ID = process.env.GOOGLE_SHEET_PADRON_ID;
const SPREADSHEET_CLASICO_ID = process.env.GOOGLE_SHEET_CLASICO_ID; 

// --- FUNCIONES DE FORMATO (HELPERS) ---
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

// --- NUEVOS HELPERS PARA FOLIOS ---
const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const obtenerMesRomano = (fechaStr) => {
  if (!fechaStr) return 'X'; 
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return 'X';
  return ROMANOS[fecha.getMonth() + 1] || 'X';
};

const obtenerAnio = (fechaStr) => {
  if (!fechaStr) return new Date().getFullYear();
  const fecha = new Date(fechaStr);
  return isNaN(fecha.getTime()) ? new Date().getFullYear() : fecha.getFullYear();
};

// =====================================================================
// 1. FUNCIÓN AGENDA (INTACTA)
// =====================================================================
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

// =====================================================================
// 2. FUNCIÓN PADRÓN (MODO LIMPIAR Y PEGAR) - CORREGIDA
// =====================================================================
exports.generarReporteCompleto = async (listaDatos) => {
  try {
    console.log(`📄 Iniciando reporte Padrón en hoja existente con ${listaDatos.length} registros...`);

    // --- NUEVO: ORDENAR (MÁS VIEJOS ARRIBA) ---
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

    // 1. CLASIFICAR DATOS EN LOS 4 TRIMESTRES
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

    // 2. EJECUTAR LIMPIEZA Y ESCRITURA
    const promesas = Object.keys(lotes).map(async (nombreHoja) => {
      const filasNuevas = lotes[nombreHoja];

      // OJO: Agregamos comillas simples '' alrededor del nombre de la hoja
      // Esto es vital cuando el nombre tiene espacios (ej: '1er trimestre'!A12)
      const rango = `'${nombreHoja}'!A12`; 
      const rangoLimpieza = `'${nombreHoja}'!A12:P2000`;

      // A. LIMPIAR RANGO
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

      // B. ESCRIBIR DATOS NUEVOS (Solo si hay)
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

// =====================================================================
// 3. FUNCIÓN REGISTRO CLÁSICO (Con Acentos)
// =====================================================================
exports.generarReporteClasico = async (listaDatos) => {
  try {
    console.log(`📄 Generando Registro Clásico ESTABLE para ${listaDatos.length} expedientes...`);

    // A. ORDENAR CRONOLÓGICAMENTE
    listaDatos.sort((a, b) => {
      const fechaA = new Date(a.fecha_recepcion || 0).getTime();
      const fechaB = new Date(b.fecha_recepcion || 0).getTime();
      const diff = fechaA - fechaB;
      if (diff !== 0) return diff;
      return String(a.id).localeCompare(String(b.id));
    });

    // B. INICIALIZAR CONTADORES
    let contadorGlobal = 1; 
    
    const contadoresTipo = {
      'Gestión': 0, 
      'Orientación': 0, 
      'Asesoría': 0, // <--- Ahora sí se usará este contador
      'Queja': 0, 
      'Dictamen': 0
    };

    // C. MAPEO Y CÁLCULO
    const filas = listaDatos.map(dato => {
      const anio = obtenerAnio(dato.fecha_recepcion);
      const mesRomano = obtenerMesRomano(dato.fecha_recepcion);

      // 1. Limpieza básica
      let textoBase = (dato.actividad_apoyo || dato.tipo_asunto || 'Orientacion')
          .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
      
      let tipoAnalisis = textoBase.charAt(0).toUpperCase() + textoBase.slice(1).toLowerCase(); 

      // 2. DEFINIR TIPO FINAL (CON ACENTOS Y SIN FUSIONES FORZADAS)
      let tipoFinal = 'Orientación'; // Default

      if (tipoAnalisis.includes('Asesoria')) {
          tipoFinal = 'Asesoría'; // <--- SE RESPETA: Generará folio 'A-#'
      } else if (tipoAnalisis.includes('Orientacion')) {
          tipoFinal = 'Orientación';
      } else if (tipoAnalisis.includes('Gestion')) {
          tipoFinal = 'Gestión';
      } else if (tipoAnalisis.includes('Queja')) {
          tipoFinal = 'Queja';
      } else if (tipoAnalisis.includes('Dictamen')) {
          tipoFinal = 'Dictamen';
      }

      // 3. Incrementar Contadores
      if (contadoresTipo.hasOwnProperty(tipoFinal)) {
          contadoresTipo[tipoFinal]++;
      } else {
          tipoFinal = 'Orientación'; // Fallback de seguridad
          contadoresTipo['Orientación']++;
      }
      
      const consecutivoTipo = contadoresTipo[tipoFinal];

      // 4. Generar Folio
      let folioServicio = '';
      
      // Casos especiales con fecha en el folio (Queja/Dictamen)
      if (tipoFinal === 'Queja' || tipoFinal === 'Dictamen') {
        const letra = tipoFinal.charAt(0); // Q o D
        folioServicio = `${letra}${consecutivoTipo}/${mesRomano}/${anio}`;
      } 
      // Casos simples (Orientación, Gestión, ASESORÍA)
      else {
        const inicial = tipoFinal.charAt(0); // Toma la 'A' de Asesoría, 'O' de Orientación, 'G' de Gestión
        folioServicio = `${inicial}-${consecutivoTipo}`; // Ej: A-15, O-20, G-5
      }

      const noAsignado = `${contadorGlobal}/${anio}`;
      contadorGlobal++;

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
        formatoOracion(dato.submotivo || ''),                        
        formatoOracion(dato.descripcion_hechos || ''),               
        
        tipoFinal, // Asesoría, Gestión, etc.
        
        formatoOracion(dato.observaciones_servicio || ''),           
        folioServicio,                                               
        noAsignado                                                   
      ];
    });

    // D. LIMPIAR Y ESCRIBIR
    const NOMBRE_HOJA = "Datos"; 

    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_CLASICO_ID,
        range: `${NOMBRE_HOJA}!A2:V10000`, 
      });
    } catch (e) {
      console.warn(`Aviso: No se pudo limpiar la hoja. Verifica Excel.`);
    }

    if (filas.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_CLASICO_ID,
        range: `${NOMBRE_HOJA}!A2`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: filas },
      });
    }

    const datosParaGuardar = listaDatos.map((dato, index) => ({
      id: dato.id,
      servicio: filas[index][20],    
      no_asignado: filas[index][21]  
    }));

    return { 
        success: true, 
        url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_CLASICO_ID}/edit`, 
        count: filas.length,
        updates: datosParaGuardar 
    };

  } catch (error) {
    console.error("❌ Error en Registro Clásico:", error.message); 
    throw new Error("Falló la generación del Registro Clásico.");
  }
};