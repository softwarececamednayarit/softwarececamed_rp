import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatName } from './formatters';

// --- CONFIGURACIÓN MODULAR DE CAMPOS PARA DOCUMENTOS ---

// Configuración de secciones para el Acta
const SECCIONES_CONFIG = {
  RECEPCION: {
    titulo: '1. DATOS DE LA RECEPCIÓN',
    campos: [
      { label: 'Tipo de Asunto', key: 'tipo' },
      { label: 'Fecha Recepción', key: 'fecha_recepcion' },
      { label: 'Folio de atención', key: 'no_asignado' },
      { label: 'Folio de expediente', key: 'servicio' },
      { label: 'Forma Rec.', key: 'forma_recepcion' },
      { label: 'Autoridad Sol.', key: 'autoridad_solicitante' }
    ]
  },
  USUARIO: {
    titulo: '2. DATOS DEL USUARIO / PACIENTE',
    campos: [
      { label: 'Nombre Completo', key: 'nombre_completo' },
      { label: 'Edad', key: 'edad_o_nacimiento' },
      { label: 'Sexo', key: 'sexo' },
      { label: 'CURP', key: 'curp' },
      { label: 'Estado Civil', key: 'estado_civil' },
      { label: 'Ocupación', key: 'ocupacion' },
      { label: 'Domicilio', key: 'domicilio_ciudadano' },
      { label: 'Municipio / Localidad', key: 'municipio_localidad' },
      { label: 'Teléfono', key: 'telefono' },
      { label: 'Correo', key: 'correo' },
      { label: 'Representante', key: 'representante' },
      { label: 'Parentesco', key: 'parentesco' }
    ]
  },
  PRESTADOR: {
    titulo: '3. DATOS DEL (LOS) PRESTADOR(ES)',
    campos: [
      { label: 'Médico / Inst.', key: 'medico_nombre' },
      { label: 'Domicilio UM', key: 'unidad_medica_domicilio' },
      { label: 'Especialidad', key: 'especialidad_medica' },
      { label: 'Institución', key: 'institucion' }
    ]
  },
  ATENCION: {
    titulo: '4. DATOS DE LA ATENCIÓN',
    campos: [
      { label: 'Motivo', key: 'motivo_principal' },
      { label: 'Submotivo', key: 'submotivo' },
      { label: 'Pretensiones', key: 'pretensiones' },
      { label: 'Descripción Hechos', key: 'descripcion_hechos' },
      { label: 'Diagnóstico', key: 'diagnostico' },
      { label: 'Criterio Médico', key: 'criterio_medico' },
      { label: 'Notas Seguimiento', key: 'notas_seguimiento' },
      { label: 'Observaciones', key: 'observaciones_servicio' },
    ]
  }
};

const CONFIG_CAMPOS_CARNET = [
  { label: 'NACIONALIDAD',        keys: ['nacionalidad'] },
  { label: 'IDENTIFICACIÓN',      keys: ['identificacion', 'tipo_identificacion'] },
  { label: 'NO. IDENTIFICACIÓN',  keys: ['no_identificacion', 'num_identificacion'] },
  { label: 'CURP',                keys: ['curp'] },
  { label: 'APELLIDO PATERNO',    keys: ['apellido_paterno', 'apellido_p'] },
  { label: 'APELLIDO MATERNO',    keys: ['apellido_materno', 'apellido_m'] },
  { label: 'NOMBRE (S)',          keys: ['nombre', 'nombres'] },
  { label: 'SEXO',                keys: ['sexo'] },
  { label: 'FECHA NAC. O EDAD',   keys: ['edad', 'edad_o_nacimiento'] },
  { label: 'GRUPO',               keys: ['grupo'] },
  { label: 'DOMICILIO',           keys: ['domicilio'] },
  { label: 'TELÉFONO',            keys: ['telefono'] },
  { label: 'CORREO ELECTRÓNICO',  keys: ['correo_electronico'] },
  { label: 'PRETENSIONES',        keys: ['pretensiones'] },
  { label: 'NOTAS SEGUIMIENTO',   keys: ['notas_seguimiento'] }
];

const ETIQUETA_FIRMA_USUARIO = "COMPARECIENTE"; 

const buscarValorCampo = (exp, llaves) => {
  for (let key of llaves) {
    if (exp[key] !== undefined && exp[key] !== null && exp[key] !== '') {
      return String(exp[key]).toUpperCase();
    }
  }
  return null; 
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

// --- AYUDANTE GLOBAL: INYECTOR DE ENCABEZADO Y PIE GUBERNAMENTAL ---
const encapsularDiseñoInstitucional = (doc, tipoAsunto) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const esQueja = tipoAsunto.toLowerCase().includes('queja');
  
  const unidadTexto = esQueja 
    ? 'UNIDAD DE CONCILIACIÓN Y ARBITRAJE MÉDICO' 
    : 'UNIDAD DE ORIENTACIÓN';

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    
    // 1. Encabezado Oficial
    doc.addImage('/encabezado_acta_carnet.png', 'PNG', 0, 0, 210, 43.8);
    
    // 2. Pie de Página
    doc.addImage('/pie_acta_carnet.jpg', 'JPEG', 0, 251, 210, 46);
    
    // 3. Textos institucionales estampados EN CIMA del Pie de Página
    // AJUSTE: Letra más pequeña y coordenadas Y desplazadas hacia abajo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5); 
    doc.setTextColor(150, 150, 150); 
    
    doc.text(`[${unidadTexto}]`, 105, 278, { align: 'center' });
    doc.text("Av. Jacarandas #204, San Juan C.P 63130 Tepic, Nayarit.", 105, 281.5, { align: 'center' });
    doc.text("3112103283 | 311 2104276", 105, 285, { align: 'center' });
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
export const generarPDFActa = (exp) => {
  const doc = new jsPDF({ orientation: 'portrait' });
  
  // 1. PREPARACIÓN DE DATOS (Priorización y Normalización)
  const expP = {
    ...exp,
    nombre_completo: `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim(),
    municipio_localidad: `${exp.municipio || ''} ${exp.localidad ? '(' + exp.localidad + ')' : ''}`.trim(),
    ocupacion: exp.cargo_ocupacion || exp.ocupacion || 'No especificada',
    monto_apoyo: exp.monto_apoyo ? `$${exp.monto_apoyo}` : 'N/A'
  };

  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'gestión').toUpperCase();
  const tituloDocumento = `ACTA DE ${tipoAsunto}`;

  // Encabezado institucional (Logo)
  encapsularDiseñoInstitucional(doc, tipoAsunto);

  // Título elegante
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(tituloDocumento, 105, 35, { align: 'center' });

  // 2. RENDERIZADO DE SECCIONES
  let currentY = 45;
  Object.values(SECCIONES_CONFIG).forEach((seccion) => {
    // Si no hay espacio, nueva página
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    // Título de Sección
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102); // Azul formal para títulos de sección
    doc.text(seccion.titulo, 15, currentY);

    const filas = [];
    seccion.campos.forEach(c => {
      if (expP[c.key]) filas.push([c.label, expP[c.key]]);
    });

    // Tabla de sección
    autoTable(doc, {
      startY: currentY + 3,
      body: filas,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2 }, lineColor: [220, 220, 220], lineWidth: { bottom: 0.2 } },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: [70, 70, 70] }, 1: { cellWidth: 130 } },
      margin: { left: 15, right: 15, top: 15, bottom: 25 },
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
  });

  // 3. FIRMAS
  const esQueja = tipoAsunto.includes('QUEJA');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const firmaIzquierda = `TITULAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaDerecha = `AUXILIAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaCentro = `FIRMA DEL ${ETIQUETA_FIRMA_USUARIO}`;

  let startYFirmas = currentY + 10;
  if (startYFirmas + 30 > 280) { doc.addPage(); startYFirmas = 20; }

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
    styles: { halign: 'center', fontSize: 9, cellPadding: 1, valign: 'top', font: 'helvetica', textColor: [20, 20, 20] },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid' 
  });

  doc.save(`Acta_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`);
};

// ===========================================================================
// 3. GENERACIÓN DE CARNETS DE SEGUIMIENTO (DISEÑO FORMAL)
// ===========================================================================
export const generarPDFCarnet = (exp, notaSeguimientoSeleccionada) => {
  const doc = new jsPDF({ orientation: 'portrait' });

  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'seguimiento').toLowerCase();
  const tituloDocumento = `CARNET DE SEGUIMIENTO DE ${tipoAsunto.toUpperCase()}`;

  const copiaExpediente = { 
    ...exp, 
    notas_seguimiento: notaSeguimientoSeleccionada || exp.notas_seguimiento 
  };

  const filasTabla = [];
  CONFIG_CAMPOS_CARNET.forEach(campo => {
    const valor = buscarValorCampo(copiaExpediente, campo.keys);
    if (valor) {
      filasTabla.push([campo.label, valor]);
    }
  });

  // Título elegante
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(tituloDocumento, 105, 48, { align: 'center' });
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(15, 52, 195, 52);

  // Tabla principal
  autoTable(doc, {
    startY: 57,
    body: filasTabla,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: { top: 4, right: 2, bottom: 4, left: 0 }, 
      lineColor: [220, 220, 220], 
      lineWidth: { bottom: 0.2 }, 
      valign: 'top',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: [40, 40, 40] },
      1: { cellWidth: 125, textColor: [0, 0, 0], halign: 'justify' }
    },
    margin: { left: 15, right: 15, top: 55, bottom: 65 }
  });

  // --- FIRMAS (Dibujadas con coordenadas fijas para evitar desfases) ---
  const esQueja = tipoAsunto.includes('queja');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const firmaIzquierda = `TITULAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaDerecha = `AUXILIAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaCentro = `FIRMA DEL ${ETIQUETA_FIRMA_USUARIO}`;

  let y = doc.lastAutoTable.finalY + 20;
  
  // Si no hay espacio suficiente, saltamos página
  if (y > 220) {
    doc.addPage();
    y = 30;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);

  // 1. Líneas y texto de Titular y Auxiliar
  doc.setDrawColor(0, 0, 0);
  doc.line(30, y, 80, y);     // Línea Titular
  doc.line(130, y, 180, y);   // Línea Auxiliar
  
  doc.text(firmaIzquierda, 55, y + 5, { align: 'center' });
  doc.text(firmaDerecha, 155, y + 5, { align: 'center' });

  // 2. Línea y texto de Compareciente (Centrado abajo)
  const yCentro = y + 30;
  doc.line(80, yCentro, 130, yCentro);
  doc.text(firmaCentro, 105, yCentro + 5, { align: 'center' });

  // Aplicar el pie de página institucional al final
  encapsularDiseñoInstitucional(doc, tipoAsunto);

  doc.save(`Carnet_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`);
};