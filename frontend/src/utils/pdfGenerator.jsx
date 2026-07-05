import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatName } from './formatters';
import { pdf } from '@react-pdf/renderer';
import DocumentoActa from '../components/pdf/DocumentoActa';
import DocumentoActaQueja from '../components/pdf/DocumentoActaQueja';

// Diccionario simple para convertir días y años a texto sin librerías externas
const numerosALetras = {
  1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
  11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince", 16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve", 20: "veinte",
  21: "veintiuno", 22: "veintidós", 23: "veintitrés", 24: "veinticuatro", 25: "veinticinco", 26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve", 30: "treinta", 31: "treinta y uno"
};

const anioALetras = (anio) => {
  const aniosMap = {
    2024: "dos mil veinticuatro",
    2025: "dos mil veinticinco",
    2026: "dos mil veintiséis",
    2027: "dos mil veintisiete",
    2028: "dos mil veintiocho",
    2029: "dos mil veintinueve",
    2030: "dos mil treinta"
  };
  return aniosMap[anio] || `dos mil ${numerosALetras[anio - 2000]}`;
};

const buscarValorCampo = (exp, llaves) => {
  for (let key of llaves) {
    if (exp[key] !== undefined && exp[key] !== null && exp[key] !== '') {
      return String(exp[key]).toUpperCase();
    }
  }
  return null; 
};

const normalizarEdadONacimiento = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '';

  const texto = String(valor).trim();
  return texto.replace(/\s*años?$/i, '').trim();
};

const clasificarInstitucion = (nombreRaw) => {
  const nombre = (nombreRaw || '').toUpperCase();
  if (nombre.includes('IMSS') || nombre.includes('HGZ') || nombre.includes('UMF') || nombre.includes('HGR') || nombre.includes('HOSPITAL GENERAL') || nombre.includes('BIENESTAR')) return 'imss';
  if (nombre.includes('ISSSTE') || nombre.includes('FOVISSSTE') || nombre.includes('CH ') || nombre.includes('CLINICA HOSPITAL')) return 'issste';
  if (nombre.includes('SSN') || nombre.includes('SSA') || nombre.includes('SERVICIOS DE SALUD') || nombre.includes('HOSPITAL CIVIL') || nombre.includes('CENTRO DE SALUD') || nombre.includes('CESSA') || nombre.includes('UNEME') || nombre.includes('INSABI')) return 'ssn';
  if (nombre.includes('PRIV') || nombre.includes('PARTICULAR') || nombre.includes('CONSULTORIO') || nombre.includes('FARMACIA') || nombre.includes('SANATORIO') || nombre.includes('CLINICA SAN') || nombre.includes('PUERTA DE HIERRO') || nombre.includes('CMQ') || nombre.includes('HOSPITAL REAL')) return 'priv';
  return 'otros';
};

const clasificarActividad = (actividadRaw) => {
  const act = (actividadRaw || '').toUpperCase();
  if (act.includes('ORIENTACI')) return 'orientaciones';
  if (act.includes('ASESOR')) return 'asesorias';
  if (act.includes('GESTI')) return 'gestiones';
  if (act.includes('QUEJA')) return 'quejas';
  if (act.includes('DICTAMEN')) return 'dictamenes';
  return null;
};

const obtenerMesAnio = (fechaString) => {
  if (!fechaString) return "FECHA DESCONOCIDA";
  const [anio, mes] = fechaString.split('-'); 
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  return `${meses[parseInt(mes) - 1]} DE ${anio}`;
};

const formatearFechaJuridica = (fechaIso) => {
  if (!fechaIso) return '___ HORAS DEL DÍA ___ DE ___ DE ___';
  const fecha = new Date(fechaIso);
  
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const dia = fecha.getDate();
  const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${horas}:${minutos} HORAS DEL DÍA ${dia} DE ${mes} DE ${anio}`;
};

const obtenerFechaCorta = (dateStr) => {
  const date = new Date(dateStr);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${meses[date.getMonth()]} del ${date.getFullYear()}`;
}

const obtenerFechaLargaAudiencia = (dateStr) => {
  if (!dateStr) return "a las ___:___ horas del día ___";
  
  const date = new Date(dateStr);
  const hora = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  const diaSemana = diasSemana[date.getDay()];
  const diaNumero = date.getDate();
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();
  
  const diaLetras = numerosALetras[diaNumero];
  const anioLetras = anioALetras(anio);
  
  return `a las ${hora}:${min} horas del día ${diaSemana} ${diaNumero} ${diaLetras} de ${mes} del ${anio} ${anioLetras}`;
}

// --- AYUDANTE GLOBAL: INYECTOR DE ENCABEZADO Y PIE GUBERNAMENTAL (ORIENTACIÓN / ASESORÍA) ---
const encapsularDiseñoInstitucional = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const unidadTexto = 'UNIDAD DE ORIENTACIÓN';

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    
    // 1. Encabezado Oficial
    doc.addImage('/encabezado_acta_carnet.png', 'PNG', 0, 0, 210, 43.8);
    
    // 2. Pie de Página
    doc.addImage('/pie_acta_carnet.jpg', 'JPEG', 0, 251, 210, 46);
    
    // 3. Textos institucionales estampados EN CIMA del Pie de Página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5); 
    doc.setTextColor(150, 150, 150); 
    
    doc.text(`[${unidadTexto}]`, 105, 278, { align: 'center' });
    doc.text("Av. Jacarandas #204, San Juan C.P 63130 Tepic, Nayarit.", 105, 281.5, { align: 'center' });
    doc.text("3112103283 | 3112104276", 105, 285, { align: 'center' });
  }
};


const encapsularDiseñoInstitucionalQ = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const unidadTexto = 'UNIDAD DE CONCILIACIÓN';

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    
    // 1. Encabezado Oficial
    doc.addImage('/encabezado_acta_carnet.png', 'PNG', 0, 0, 210, 43.8);
    
    // 2. Pie de Página
    doc.addImage('/pie_acta_carnet.jpg', 'JPEG', 0, 251, 210, 46);
    
    // 3. Textos institucionales estampados EN CIMA del Pie de Página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5); 
    doc.setTextColor(150, 150, 150); 
    
    doc.text(`[${unidadTexto}]`, 105, 278, { align: 'center' });
    doc.text("Av. Jacarandas #204, San Juan C.P 63130 Tepic, Nayarit.", 105, 281.5, { align: 'center' });
    doc.text("3112103283 | 3112104276", 105, 285, { align: 'center' });
  }
};

// --- AYUDANTE GLOBAL: INYECTOR DE ENCABEZADO Y PIE CON AVISO DE PRIVACIDAD (QUEJAS) ---
export const encapsularDiseñoInstitucionalQueja = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const avisoPrivacidadCuerpo = "Los datos personales proporcionados a la COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO PARA EL ESTADO DE NAYARIT (CECAMED) ubicada en Av. Jacarandas # 204, C.P. 63130, colonia San Juan, de esta ciudad de Tepic, Nayarit, serán protegidos conforme a lo dispuesto por los artículos 16, 17, 18, fracción I incisos a, b y c de la Ley de Protección de Datos Personales en Posesión de los Sujetos Obligados para el Estado de Nayarit, y demás normatividad aplicable. Los servicios que brinda esta institución son gratuitos en términos de su artículo 6 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit. Artículo 82 de Ley de Transparencia y Acceso a la Información Pública del Estado de Nayarit. La información confidencial que usted proporcione como usuario de los servicios que brinda la Comisión será utilizada únicamente para los efectos de una adecuada integración de su expediente de: Orientación, Asesoría, Gestión Inmediata, Queja, Conciliación o Arbitraje según sea el caso.";

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    // 1. Encabezado Oficial
    doc.addImage('/encabezado_acta_carnet.png', 'PNG', 0, 0, 210, 43.8);
    // 2. Pie de Página
    doc.addImage('/pie_acta_carnet.jpg', 'JPEG', 0, 251, 210, 46);
    
    // 3. Aviso de Privacidad
    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 80); 
    
    // Bajamos la coordenada Y a 272 para que cuadre con la imagen
    doc.setFontSize(5);
    doc.text("AVISO DE PRIVACIDAD", 105, 276, { align: 'center', baseline: 'top' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4);
    // Bajamos a 275 y mantenemos centrado
    doc.text(avisoPrivacidadCuerpo, 100, 279, { align: 'center', maxWidth: 150, baseline: 'top', lineHeightFactor: 1.15 });
  }
};
// ===========================================================================

// 1. GENERACIÓN REPORTE MENSUAL

// ===========================================================================

export const generarPDFMensual = (data, fechaInicio, fechaFin) => {

  const doc = new jsPDF({ orientation: 'landscape' });

  const periodoTexto = obtenerMesAnio(fechaInicio);



  const stats = {

    imss: { orientaciones: 0, asesorias: 0, gestiones: 0, quejas: 0, dictamenes: 0 },

    issste: { orientaciones: 0, asesorias: 0, gestiones: 0, quejas: 0, dictamenes: 0 },

    ssn: { orientaciones: 0, asesorias: 0, gestiones: 0, quejas: 0, dictamenes: 0 },

    priv: { orientaciones: 0, asesorias: 0, gestiones: 0, quejas: 0, dictamenes: 0 },

    otros: { orientaciones: 0, asesorias: 0, gestiones: 0, quejas: 0, dictamenes: 0 },

  };



  let totalHombres = 0;

  let totalMujeres = 0;

  let totalForaneos = 0;

  const filasDetalle = [];



  data.forEach(exp => {

    const instKey = clasificarInstitucion(exp.prestador_nombre || exp.institucion);

    const asuntoKey = clasificarActividad(exp.actividad_apoyo || exp.tipo_asunto);



    if (asuntoKey && stats[instKey]) {

      stats[instKey][asuntoKey]++;

    }



    const sexo = (exp.sexo || '').toUpperCase();

    if (sexo.startsWith('H') || sexo.startsWith('MASC')) {

        totalHombres++;

    } else if (sexo.startsWith('F') || sexo.startsWith('MUJ') || sexo === 'M') {

        totalMujeres++;

    }



    if (exp.foraneo === true || exp.foraneo === 'true') totalForaneos++;



    if (asuntoKey === 'gestiones' || asuntoKey === 'quejas' || asuntoKey === 'dictamenes') {

      filasDetalle.push([

        exp.servicio || `G-${String(exp.id).substring(0,4).toUpperCase()}`,

        formatName(exp.prestador_nombre || exp.institucion || 'NO ESPECIFICADO'),

        (exp.especialidad || '---').toUpperCase(),

        (exp.motivo_inconformidad || '---').toUpperCase(),

        exp.edad ? `${exp.edad}` : '---',

        sexo.substring(0,1),

        (exp.diagnostico || '---').toUpperCase(),

        exp.fecha_recepcion || ''

      ]);

    }

  });



  const sumRow = (key) => stats.imss[key] + stats.issste[key] + stats.ssn[key] + stats.priv[key] + stats.otros[key];

  const tImss = Object.values(stats.imss).reduce((a,b)=>a+b,0);

  const tIssste = Object.values(stats.issste).reduce((a,b)=>a+b,0);

  const tSsn = Object.values(stats.ssn).reduce((a,b)=>a+b,0);

  const tPriv = Object.values(stats.priv).reduce((a,b)=>a+b,0);

  const tOtros = Object.values(stats.otros).reduce((a,b)=>a+b,0);

  const granTotal = tImss + tIssste + tSsn + tPriv + tOtros;



  const blueCellStyle = { fillColor: [189, 215, 238], fontStyle: 'bold', halign: 'center' };



  doc.setFontSize(12);

  doc.setFont('helvetica', 'bold');

  doc.text("REPORTE LLENADO POR LA UNIDAD DE ORIENTACIÓN", 148.5, 15, { align: 'center' });

  doc.text(`CONCENTRADO DE ASUNTOS RECIBIDOS ${periodoTexto}`, 148.5, 22, { align: 'center' });



  autoTable(doc, {

    startY: 30,

    head: [['ASUNTO', 'IMSS', 'ISSSTE', 'SSN', 'PRIV.', 'OTROS', 'TOTAL']],

    body: [

      ['ORIENTACIONES', stats.imss.orientaciones, stats.issste.orientaciones, stats.ssn.orientaciones, stats.priv.orientaciones, stats.otros.orientaciones, sumRow('orientaciones')],

      ['ASESORÍAS',     stats.imss.asesorias,     stats.issste.asesorias,     stats.ssn.asesorias,     stats.priv.asesorias,     stats.otros.asesorias,     sumRow('asesorias')],

      ['GESTIONES',     stats.imss.gestiones,     stats.issste.gestiones,     stats.ssn.gestiones,     stats.priv.gestiones,     stats.otros.gestiones,     sumRow('gestiones')],

      ['QUEJAS',        stats.imss.quejas,        stats.issste.quejas,        stats.ssn.quejas,        stats.priv.quejas,        stats.otros.quejas,        sumRow('quejas')],

      ['DICTÁMENES',    stats.imss.dictamenes,    stats.issste.dictamenes,    stats.ssn.dictamenes,    stats.priv.dictamenes,    stats.otros.dictamenes,    sumRow('dictamenes')],

      [{ content: 'TOTAL', styles: blueCellStyle }, { content: tImss, styles: blueCellStyle }, { content: tIssste, styles: blueCellStyle }, { content: tSsn, styles: blueCellStyle }, { content: tPriv, styles: blueCellStyle }, { content: tOtros, styles: blueCellStyle }, { content: granTotal, styles: blueCellStyle }]

    ],

    theme: 'plain',

    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },

    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, halign: 'center', fontSize: 9, cellPadding: 1.5 },

    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } }

  });



  let finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');

  doc.text(`Total, de Hombres: ${totalHombres}`, 148.5, finalY, { align: 'center' });

  doc.text(`Total, de Mujeres: ${totalMujeres}`, 148.5, finalY + 5, { align: 'center' });

  doc.text(`Total, de Asuntos Foráneos: ${totalForaneos}`, 148.5, finalY + 10, { align: 'center' });



  finalY += 25;

  doc.setFont('helvetica', 'bold');

  doc.text(`MOTIVOS DE INCONFORMIDAD RECIBIDOS ${periodoTexto}`, 148.5, finalY, { align: 'center' });

  doc.setFont('helvetica', 'normal');

  doc.text("(Gestiones, Quejas y Dictámenes)", 148.5, finalY + 5, { align: 'center' });



  autoTable(doc, {

    startY: finalY + 10,

    head: [['Asunto', 'Institución\nMédica y\njurídica', 'Especialidad', 'Motivo', 'Edad', 'Sexo', 'DX.', 'Fecha de\nRecepción']],

    body: filasDetalle,

    theme: 'plain',

    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center', valign: 'middle' },

    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 8, cellPadding: 1.5, valign: 'middle' },

    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 45 }, 2: { cellWidth: 30 }, 3: { cellWidth: 60 }, 4: { cellWidth: 15 }, 5: { cellWidth: 15 }, 6: { cellWidth: 40 }, 7: { cellWidth: 25 } },

    margin: { top: 15, bottom: 15, left: 10, right: 10 }

  });



  doc.save(`Reporte_Mensual_${periodoTexto.replace(/ /g, '_')}.pdf`);

};


// ===========================================================================
// 2. GENERACIÓN DE ACTAS DE ATENCIÓN (DISEÑO FORMAL)
// ===========================================================================
export const generarPDFActa = async (exp) => {
  // 1. PREPARACIÓN Y NORMALIZACIÓN DE DATOS (Mantenemos tu lógica intacta aquí)
  const rep = exp.representante || {};
  const expP = {
    ...exp,
    nombre_completo: `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim() || 'NO PROPORCIONÓ',
    municipio_localidad: exp.municipio || exp.localidad || 'NO PROPORCIONÓ',
    domicilio_ciudadano: exp.domicilio_ciudadano || exp.domicilio || 'NO PROPORCIONÓ',
    entidad: exp.entidad || 'Nayarit',
    nacionalidad: exp.nacionalidad || 'Mexicana',
    identificacion: exp.identificacion || 'NO PROPORCIONÓ',
    institucion: exp.institucion || exp.unidad_medica,
    
    rep_nombre_completo: rep.nombre_completo || '',
    rep_domicilio: rep.domicilio || 'NO PROPORCIONÓ',
    rep_entidad: rep.entidad || 'NO PROPORCIONÓ',
    rep_municipio: rep.municipio || 'NO PROPORCIONÓ',
    rep_telefono: rep.telefono || 'NO PROPORCIONÓ',
    rep_causa: rep.causa_representacion || 'NO PROPORCIONÓ',
    rep_acreditacion: rep.acreditacion || 'NO PROPORCIONÓ',
    rep_parentesco: rep.parentezco || 'NO PROPORCIONÓ',
  };

  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'gestión').toUpperCase();
  const nombreArchivo = `Acta_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`;

  try {
    // 2. GENERACIÓN DEL PDF CON REACT
    // Pasamos los datos ya normalizados como "prop" al componente
    const docElement = <DocumentoActa expP={expP} tipoAsunto={tipoAsunto} />;
    
    // 3. CONVERSIÓN A BLOB Y DESCARGA
    const blob = await pdf(docElement).toBlob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error al generar el PDF del Acta:", error);
    throw new Error('No se pudo generar el documento pdf');
  }
};

// ===========================================================================
// ACTA DE QUEJA
// ===========================================================================
export const generarPDFActaQueja = async (exp) => {
  const toUpper = (val) => val ? String(val).toUpperCase() : '';
  const qData = exp.datos_docs || {};
  const rep = exp.representante || {};
  
  // Normalización de datos (tu lógica original, pero sin cálculos de PDF)
  const datosProcesados = {
    ...exp,
    qData,
    rep,
    nombreUsuario: toUpper(`${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim() || 'NO PROPORCIONÓ'),
    fechaInicioFormal: toUpper(formatearFechaJuridica(qData.fecha_hora_inicio)),
    fechaConclusionFormal: toUpper(formatearFechaJuridica(qData.fecha_hora_conclusion)),
    edadNormalizadaUsuario: normalizarEdadONacimiento(exp.edad_o_nacimiento),
    
    // Si no existen listas, pasamos las por defecto
    listaPretensiones: Array.isArray(qData.pretensiones_listadas) && qData.pretensiones_listadas.length > 0
      ? qData.pretensiones_listadas 
      : ['NO SE ESPECIFICARON PRETENSIONES.'],
      
    listaDocumentos: Array.isArray(qData.documentacion_recibida) && qData.documentacion_recibida.length > 0
      ? qData.documentacion_recibida 
      : ['COPIA SIMPLE DE INE.', 'COPIA SIMPLE DE COMPROBANTE DE DOMICILIO.']
  };

  const nombreArchivo = `Acta_Queja_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoActaQueja data={datosProcesados} />;
    const blob = await pdf(docElement).toBlob();
    
    // Descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al generar PDF de Queja:", error);
  }
};

// ===========================================================================
// OFICIO DE AUDIENCIA INFORMATIVA
// ===========================================================================
export const generarPDFAudienciaInformativa = (exp) => {
  const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
  
  const qData = exp.datos_docs || {};
  const domicilio = qData.domicilio || {};

  const esFemenino = exp.sexo === 'Femenino';
  const articuloGenero = esFemenino ? 'la' : 'el';
  const sustantivoUsuario = esFemenino ? 'Usuaria' : 'Usuario';

  const fechaDocumento = obtenerFechaCorta(new Date()); 
  const fechaQueja = obtenerFechaCorta(exp.fecha_recepcion ? new Date(exp.fecha_recepcion) : new Date());
  const fechaHoraAudiencia = obtenerFechaLargaAudiencia(new Date()); 

  const nombreOficio = qData.nombre_oficio || 'OFICIO No. SM/UC/001/01/2026';
  const nombreUsuario = qData.nombre_usuario || `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim();
  const titularConciliacion = 'AMÉRICA IVONNE GAMEROS ORTIZ';

  let medicoNombre = qData.medico_nombre || qData.contra_quien || '';
  if (medicoNombre && !medicoNombre.toUpperCase().startsWith('DR')) {
    medicoNombre = `Dr. ${medicoNombre}`; 
  }

  const domCalle = domicilio.calle || 'CONOCIDA';
  const domNumExt = domicilio.numero_exterior || domicilio.numero || 'S/N';
  const domNumInt = domicilio.numero_interior ? ` INT. ${domicilio.numero_interior}` : '';
  const domColonia = domicilio.colonia || 'CENTRO';
  const domMunicipio = domicilio.municipio || 'TEPIC';
  const domEstado = domicilio.estado || 'NAYARIT';

  // Empezamos bien arriba (coordenada 40) para maximizar el espacio de la hoja
  let currentY = 40; 

  const printText = (text, options = {}) => {
    // FIX: Fuente tamaño 10 y lineSpacing de 3.5mm entre párrafos garantiza que quepa en 1 hoja
    const { fontSize = 10, isBold = false, align = 'justify', maxWidth = 170, lineSpacing = 3.5 } = options;
    
    let x = options.x;
    if (x === undefined) {
      if (align === 'center') x = 105; 
      else if (align === 'right') x = 190; 
      else x = 20; 
    }

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    
    const textOpts = { align, baseline: 'top', lineHeightFactor: 1.15 };
    if (align === 'justify' || align === 'left') textOpts.maxWidth = maxWidth;

    const textDimensions = doc.getTextDimensions(text, textOpts);
    const textHeight = textDimensions.h;

    // Salto de página de seguridad (aunque con estos ajustes no debería usarlo)
    if (currentY + textHeight > 250) { 
      doc.addPage();
      currentY = 40; 
    }
    
    doc.text(text, x, currentY, textOpts);
    currentY += textHeight + lineSpacing;
  };

  // --- CABECERA DERECHA (Normal según la imagen) ---
  printText('SERVICIO MÉDICO', { align: 'right', lineSpacing: 1.5 });
  printText(`Tepic, Nayarit; ${fechaDocumento}`, { align: 'right', lineSpacing: 1.5 });
  printText(nombreOficio, { align: 'right', lineSpacing: 8 });

  // --- DESTINATARIO (Todo en Negrita y muy junto, según la imagen) ---
  printText(medicoNombre.toUpperCase(), { isBold: true, lineSpacing: 1.5 });
  printText(`DOMICILIO. ${domCalle} ${domNumExt}${domNumInt}`, { isBold: true, lineSpacing: 1.5 });
  printText(`COL. ${domColonia}`, { isBold: true, lineSpacing: 1.5 });
  printText(`${domMunicipio}, ${domEstado}.`, { isBold: true, lineSpacing: 1.5 });
  printText('P R E S E N T E.', { isBold: true, lineSpacing: 6 });

  // --- CUERPO DEL OFICIO ---
  const parrafo1 = `Por este medio se le hace de su conocimiento, que con fecha ${fechaQueja}, ${articuloGenero} ${nombreUsuario} de Servicio Médico presentó una queja con motivo de la Atención Médica proporcionada por Usted, por lo que se le invita a comparecer a esta H. Comisión Estatal de Conciliación y Arbitraje Médico, misma que se encuentra ubicada en calle Av. Jacarandas 204 Sur, Colonia San Juan, Tepic, Nayarit, ${fechaHoraAudiencia}, con la finalidad de llevar a cabo una AUDIENCIA INFORMATIVA respecto de la Queja, de las atribuciones y procedimientos de la CECAMED y en su momento exprese voluntariamente si es su interés aceptar someterse al procedimiento arbitral de nuestra Institución, para tal efecto solicito a Usted tenga a bien presentarse con una copia de su identificación oficial, copia de su cedula profesional.`;
  printText(parrafo1);

  const parrafo2 = `No omito manifestarle a Usted que entre las ventajas de que el procedimiento sea llevado ante esta Comisión Estatal, se encuentran entre otras, el trámite es personal, confidencial, gratuito, no requiere aseguranza, no interviene Autoridad Judicial y la solución es a corto plazo.`;
  printText(parrafo2);

  const parrafo3 = `Así mismo anexamos a la presente, en sobre cerrado con efectos de notificación personal, copia con firmas originales de la queja presentada ante esta Comisión Estatal por ${articuloGenero} ${nombreUsuario}, ${sustantivoUsuario} de Servicio Médico.`;
  printText(parrafo3);

  const parrafo4 = `Lo anterior con fundamento en lo dispuesto por el artículo 9 fracción II del Decreto Número 8292 de Creación de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit, publicado en el periódico oficial número 49 de fecha 16 de Diciembre de 2000, así como de los artículos 18 fracción X y 24 fracción III párrafo del Reglamento Interno para el Funcionamiento de la misma, y en los numerales 26, 55 y 56 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la CECAMED.`;
  printText(parrafo4);

  const parrafo5 = `Sin otro particular por el momento, quedo de Usted a sus apreciables órdenes.`;
  printText(parrafo5, { lineSpacing: 10 });

  // --- FIRMAS (En negrita según la imagen) ---
  printText('A T E N T A M E N T E', { align: 'center', isBold: true, lineSpacing: 15 });
  
  printText(titularConciliacion, { align: 'center', isBold: true, lineSpacing: 1.5 });
  printText('JEFE DE LA UNIDAD DE CONCILIACIÓN', { align: 'center', isBold: true, lineSpacing: 10 });
  
  // --- COPIAS ARCHIVO ---
  printText('Rgas.', { fontSize: 7, lineSpacing: 1 });
  printText('Minutario', { fontSize: 7, lineSpacing: 1 });
  printText('Archivo.', { fontSize: 7 });

  if (typeof encapsularDiseñoInstitucional === 'function') {
    // Asumo que esta función inyecta tu fondo con el escudo de Nayarit y el pie de página
    encapsularDiseñoInstitucional(doc); 
  }

  doc.save(`Oficio_Audiencia_${exp.id || 'Exp'}.pdf`);
};

// ===========================================================================
// 3. GENERACIÓN DE CARNETS DE SEGUIMIENTO (DISEÑO FORMAL OPTIMIZADO)
// ===========================================================================
export const generarPDFCarnet = (exp, notaSeguimientoSeleccionada) => {
  const doc = new jsPDF({ orientation: 'portrait' });

  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'seguimiento').toUpperCase();
  const tituloDocumento = `CARNET DE SEGUIMIENTO DE ${tipoAsunto}`;

  // 1. PREPARACIÓN INSTITUCIONAL (Al principio para evitar superposición de capas)
  encapsularDiseñoInstitucional(doc, tipoAsunto);

  const copiaExpediente = { 
    ...exp, 
    notas_seguimiento: notaSeguimientoSeleccionada || exp.notas_seguimiento 
  };

  // 2. RECOPILACIÓN DE DATOS (Bloque único continuo, sin divisiones por secciones)
  const filasTabla = [];

  // Carga del resto de los campos base del carnet
  CONFIG_CAMPOS_CARNET.forEach(campo => {
    const valor = buscarValorCampo(copiaExpediente, campo.keys);
    if (valor) {
      filasTabla.push([campo.label, valor]);
    }
  });

  // Título alineado al estándar del Acta
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(tituloDocumento, 105, 35, { align: 'center' });

  // 3. TABLA PRINCIPAL DE CONTENIDO
  autoTable(doc, {
    startY: 45,
    body: filasTabla,
    theme: 'plain',
    styles: { 
      fontSize: 9, // Consistencia de tamaño con el acta
      cellPadding: { top: 3, bottom: 3, left: 0, right: 2 }, 
      lineColor: [220, 220, 220], 
      lineWidth: { bottom: 0.2 }, 
      valign: 'top',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [70, 70, 70] }, // Estilo elegante grisáceo
      1: { cellWidth: 130, textColor: [0, 0, 0], halign: 'justify' }
    },
    margin: { left: 15, right: 15, top: 15, bottom: 25 }
  });

  // 4. BLOQUE DE FIRMAS (Migrado a autoTable para controlar saltos de página de forma automática)
  const esQueja = tipoAsunto.includes('QUEJA');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const firmaIzquierda = `TITULAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaDerecha = `AUXILIAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaCentro = `FIRMA DEL ${ETIQUETA_FIRMA_USUARIO}`;

  let startYFirmas = doc.lastAutoTable.finalY + 15;
  
  // Validación de espacio disponible para el bloque de firmas completo
  if (startYFirmas + 35 > 275) { 
    doc.addPage(); 
    startYFirmas = 25; 
  }

  autoTable(doc, {
    startY: startYFirmas,
    body: [
      ['___________________________________', '___________________________________'],
      [firmaIzquierda, firmaDerecha],
      ['', ''], 
      ['', '___________________________________'],
      ['', firmaCentro]
    ],
    theme: 'plain',
    styles: { 
      halign: 'center', 
      fontSize: 9, 
      cellPadding: 1, 
      valign: 'top', 
      font: 'helvetica', 
      textColor: [20, 20, 20] 
    },
    columnStyles: { 
      0: { cellWidth: 90 }, 
      1: { cellWidth: 90 } 
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid' // Previene que las firmas se dividan entre dos páginas
  });

  doc.save(`Carnet_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`);
};