import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatName } from './formatters';
import { pdf } from '@react-pdf/renderer';
import DocumentoActa from '../components/pdf/DocumentoActa';
import DocumentoActaQueja from '../components/pdf/DocumentoActaQueja';
import DocumentoAudiencia from '../components/pdf/DocumentoAudiencia';
import DocumentoCarnet from '../components/pdf/DocumentoCarnet';
import DocumentoRecepcionContestacion from '../components/pdf/DocumentoRecepcionContestacion';
import DocumentoNoSujecion from '../components/pdf/DocumentoNoSujecion';
import DocumentoDeclaracionVoluntad from '../components/pdf/DocumentoDeclaracionVoluntad';
import { CONFIG_CAMPOS_CARNET, ETIQUETA_FIRMA_USUARIO } from './pdfConfigs';

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
export const generarPDFAudienciaInformativa = async (exp) => {
  const qData = exp.datos_docs || {};
  const domicilio = qData.domicilio || {};

  const esFemenino = exp.sexo === 'Femenino';
  
  let medicoNombre = qData.medico_nombre || qData.contra_quien || '';
  if (medicoNombre && !medicoNombre.toUpperCase().startsWith('DR')) {
    medicoNombre = `Dr. ${medicoNombre}`; 
  }

  const domNumInt = domicilio.numero_interior ? ` INT. ${domicilio.numero_interior}` : '';

  // Empaquetamos todos los datos limpios
  const datosProcesados = {
    fechaDocumento: obtenerFechaCorta(new Date()),
    fechaQueja: obtenerFechaCorta(exp.fecha_recepcion ? new Date(exp.fecha_recepcion) : new Date()),
    fechaHoraAudiencia: obtenerFechaLargaAudiencia(new Date()),
    nombreOficio: qData.nombre_oficio || 'OFICIO No. SM/UC/001/01/2026',
    nombreUsuario: qData.nombre_usuario || `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim(),
    titularConciliacion: 'AMÉRICA IVONNE GAMEROS ORTIZ',
    medicoNombre,
    articuloGenero: esFemenino ? 'la' : 'el',
    sustantivoUsuario: esFemenino ? 'Usuaria' : 'Usuario',
    domicilio: {
      calleNum: `${domicilio.calle || 'CONOCIDA'} ${domicilio.numero_exterior || domicilio.numero || 'S/N'}${domNumInt}`,
      colonia: domicilio.colonia || 'CENTRO',
      municipioEstado: `${domicilio.municipio || 'TEPIC'}, ${domicilio.estado || 'NAYARIT'}`
    }
  };

  const nombreArchivo = `Oficio_Audiencia_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoAudiencia data={datosProcesados} />;
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
    console.error("Error al generar PDF de Audiencia:", error);
  }
};

// ===========================================================================
// 3. GENERACIÓN DE CARNETS DE SEGUIMIENTO (DISEÑO FORMAL OPTIMIZADO)
// ===========================================================================
export const generarPDFCarnet = async (exp, notaSeguimientoSeleccionada) => {
  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'seguimiento').toUpperCase();
  const tituloDocumento = `CARNET DE SEGUIMIENTO DE ${tipoAsunto}`;
  const esQueja = tipoAsunto.includes('QUEJA');
  const tipoFooter = esQueja ? 'queja' : 'orientacion';

  const copiaExpediente = { 
    ...exp, 
    notas_seguimiento: notaSeguimientoSeleccionada || exp.notas_seguimiento 
  };

  // Recopilación de datos de la tabla
  const filasTabla = [];
  CONFIG_CAMPOS_CARNET.forEach(campo => {
    // Asumo que buscarValorCampo está importado en tu archivo
    const valor = buscarValorCampo(copiaExpediente, campo.keys);
    if (valor) {
      filasTabla.push({ label: campo.label, value: valor });
    }
  });

  const datosProcesados = {
    tituloDocumento,
    filasTabla,
    esQueja,
    tipoFooter,
    // Asumiendo que ETIQUETA_FIRMA_USUARIO está en este scope, o puedes pasar el string directo
    etiquetaFirmaUsuario: typeof ETIQUETA_FIRMA_USUARIO !== 'undefined' ? ETIQUETA_FIRMA_USUARIO : 'USUARIO'
  };

  const nombreArchivo = `Carnet_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoCarnet data={datosProcesados} />;
    const blob = await pdf(docElement).toBlob();
    
    // Descarga automática
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al generar PDF de Carnet:", error);
  }
};


// ===========================================================================
// 4. GENERACIÓN DE AUTO DE RECEPCIÓN DE CONTESTACIÓN (DISEÑO FORMAL)
// ===========================================================================
export const generarPDFRecepcionContestacion = async (exp) => {
  const qData = exp.datos_docs || {};
  
  // Procesamos las fechas
  const fechaDoc = exp.fecha_documento ? new Date(exp.fecha_documento) : new Date();
  const fechaAud = exp.fecha_hora_audiencia ? new Date(exp.fecha_hora_audiencia) : new Date();

  // Procesamos los datos
  const datosProcesados = {
    expediente: exp.servicio || 'S/N',
    fechaDocumentoCorta: obtenerFechaCorta(fechaDoc),
    medicoNombre: qData.medico_nombre || '___',
    // Mantenemos mayúsculas y minúsculas normales para la redacción
    titularConciliacion: exp.titular_conciliacion || 'América Ivonne Gameros Ortiz',
    auxiliarConciliacion: exp.auxiliar_conciliacion || 'Rosa Gloria Aguilar Sartiaguín',
    textoAnexos: exp.anexos_contestacion || '-----------',
    fechaHoraAudienciaLarga: obtenerFechaLargaAudiencia(fechaAud) 
  };

  const nombreArchivo = `Acuerdo_Recepcion_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoRecepcionContestacion data={datosProcesados} />;
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
    console.error("Error al generar PDF de Recepción:", error);
  }
};

// ===========================================================================
// 5. GENERACIÓN DE AUTO DE NO SUJECIÓN (DISEÑO FORMAL)
// ===========================================================================
export const generarPDFNoSujecion = async (exp) => {
  const qData = exp.datos_docs || {};
  
  // Procesamiento de Género
  const esFemenino = exp.sexo === 'Femenino';
  const tituloSenor = esFemenino ? 'la señora' : 'el señor';
  const sustantivoUsuario = esFemenino ? 'Usuaria' : 'Usuario';

  // Procesamiento de Fecha
  const fechaDoc = exp.fecha_documento ? new Date(exp.fecha_documento) : new Date();

  // Diccionario de datos limpios
  const datosProcesados = {
    expediente: exp.servicio || 'S/N',
    medicoNombre: qData.medico_nombre || '___',
    medicoDomicilio: qData.medico_domicilio || '___',
    medicoColonia: qData.medico_colonia_Med || '___',
    medicoCiudad: qData.medico_ciudad || 'Tepic, Nayarit',
    medicoCedula: qData.medico_cedula || '___',
    medicoTelefono: qData.medico_telefono || '___',
    
    nombreUsuario: qData.nombre_usuario || '___',
    tituloSenor,
    sustantivoUsuario,
    
    fechaDocumentoCorta: obtenerFechaCorta(fechaDoc)
  };

  const nombreArchivo = `No_Sujecion_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoNoSujecion data={datosProcesados} />;
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
    console.error("Error al generar PDF de No Sujeción:", error);
  }
};

// ===========================================================================
// 6. GENERACIÓN DE DECLARACIÓN DE VOLUNTAD (DISEÑO FORMAL)
// ===========================================================================
export const generarPDFDeclaracionVoluntad = async (exp) => {
  const qData = exp.datos_docs || {};
  
  // Procesamiento Género del USUARIO
  const esFemeninoUsuario = exp.sexo === 'Femenino';
  const articuloUsuario = esFemeninoUsuario ? 'la' : 'el';
  const sustantivoUsuario = esFemeninoUsuario ? 'Usuaria' : 'Usuario';
  const pacienteArticulo = esFemeninoUsuario ? 'la paciente' : 'el paciente';

  // Procesamiento Género del MÉDICO (Inteligente por prefijo)
  const nombreMed = qData.medico_nombre || '___';
  const esFemeninoMedico = nombreMed.toUpperCase().includes('DRA.') || nombreMed.toUpperCase().includes('DOCTORA');
  const articuloMedico = esFemeninoMedico ? 'la' : 'el';
  const alMedico = esFemeninoMedico ? 'a la' : 'al';

  const fechaDoc = exp.fecha_documento ? new Date(exp.fecha_documento) : new Date();

  // Diccionario
  const datosProcesados = {
    expediente: exp.servicio || 'S/N',
    medicoNombre: nombreMed,
    nombreUsuario: qData.nombre_usuario || '___',
    
    // Representante Legal
    repNombre: qData.representanteMed_nombre || '___',
    repDomicilio: qData.representanteMed_domicilio || '___',
    repColonia: qData.representanteMed_colonia || '___',
    repCiudad: qData.representanteMed_ciudad || '___',
    repTelefono: qData.representanteMed_telefono || '___',
    repCedula: qData.representanteMed_cedula || '___',
    
    // Gramática Dinámica
    articuloUsuario,
    sustantivoUsuario,
    pacienteArticulo,
    articuloMedico,
    alMedico,
    
    fechaDocumentoCorta: obtenerFechaCorta(fechaDoc)
  };

  const nombreArchivo = `Declaracion_Voluntad_${exp.id || 'Exp'}.pdf`;

  try {
    const docElement = <DocumentoDeclaracionVoluntad data={datosProcesados} />;
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
    console.error("Error al generar PDF de Declaración:", error);
  }
};