import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatName } from './formatters';

// Configuración de secciones para el Acta
const SECCIONES_CONFIG = {
  RECEPCION: {
    titulo: 'DATOS DE LA RECEPCIÓN',
    filas: [
      [{ label: 'Tipo de asunto:', key: 'tipo' }],
      [{ label: 'Forma de recepción:', key: 'forma_recepcion' }],
      [{ label: 'Folio de atención:', key: 'no_asignado' }],
      [{ label: 'Folio de expediente:', key: 'servicio' }],
      [{ label: 'Fecha de registro:', key: 'fecha_recepcion' }]
    ]
  },
  USUARIO: {
    titulo: 'DATOS DEL USUARIO',
    filas: [
      [{ label: 'Nombre:', key: 'nombre_completo' }],
      [{ label: 'Sexo:', key: 'sexo' }, { label: 'Edad:', key: 'edad_o_nacimiento' }],
      [{ label: 'Domicilio:', key: 'domicilio_ciudadano' }],
      [{ label: 'Entidad:', key: 'entidad' }, { label: 'Municipio:', key: 'municipio_localidad' }],
      [{ label: 'Teléfono:', key: 'telefono' }, { label: 'Nacionalidad:', key: 'nacionalidad' }],
      [{ label: 'Identificación:', key: 'identificacion' }]
    ]
  },
  REPRESENTANTE: {
    titulo: 'DATOS DEL REPRESENTANTE',
    // Esta sección tiene una condición, solo se procesa si devuelve true
    condicion: (datos) => datos.rep_nombre_completo && datos.rep_nombre_completo !== '',
    filas: [
      [{ label: 'Nombre:', key: 'rep_nombre_completo' }],
      [{ label: 'Domicilio:', key: 'rep_domicilio' }],
      [{ label: 'Entidad:', key: 'rep_entidad' }, { label: 'Municipio:', key: 'rep_municipio' }],
      [{ label: 'Teléfono:', key: 'rep_telefono' }, { label: 'Acreditación:', key: 'rep_acreditacion' }],
      [{ label: 'Causa rep.:', key: 'rep_causa' }, { label: 'Parentesco:', key: 'rep_parentesco' }]
    ]
  },
  PRESTADOR: {
    titulo: 'PRESTADOR(ES) DEL(LOS) SERVICIO(S)',
    filas: [
      [{ label: 'Nombre:', key: 'medico_nombre' }],
      [{ label: 'Domicilio:', key: 'unidad_medica_domicilio' }],
      [{ label: 'Entidad:', key: 'pres_entidad' }, { label: 'Municipio:', key: 'pres_municipio' }],
      [{ label: 'Teléfono:', key: 'pres_telefono' }],
      [{ label: 'Sector:', key: 'sector' }],
      [{ label: 'Tipo de Institución:', key: 'tipo_institucion' }],
      [{ label: 'Institución:', key: 'institucion' }],
      [{ label: 'Especialidad:', key: 'especialidad_medica' }]
    ]
  },
  ATENCION: {
    titulo: 'DATOS DE LA ATENCIÓN',
    filas: [
      [{ label: 'Motivo:', key: 'motivo_principal' }],
      [{ label: 'Submotivo:', key: 'submotivo' }],
      [{ label: 'Hechos:', key: 'descripcion_hechos' }],
      [{ label: 'Diagnóstico:', key: 'diagnostico' }],
      [{ label: 'Pretensiones:', key: 'pretensiones' }],
      [{ label: 'Criterio Médico:', key: 'criterio_medico' }],
      [{ label: 'Notas Seguimiento:', key: 'notas_seguimiento' }],
      [{ label: 'Observaciones:', key: 'observaciones_servicio' }]
    ]
  }
};

const CONFIG_CAMPOS_CARNET = [
  { label: 'NACIONALIDAD',        keys: ['nacionalidad'] },
  { label: 'FOLIO DE ATENCIÓN', keys: ['no_asignado'] },
  { label: 'FOLIO DE EXPEDIENTE', keys: ['servicio'] },
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
    doc.text("3112103283 | 311 2104276", 105, 285, { align: 'center' });
  }
};

// --- AYUDANTE GLOBAL: INYECTOR DE ENCABEZADO Y PIE CON AVISO DE PRIVACIDAD (QUEJAS) ---
const encapsularDiseñoInstitucionalQueja = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  
  const avisoPrivacidadTitulo = "AVISO DE PRIVACIDAD";
  const avisoPrivacidadCuerpo = "Los datos personales proporcionados a la COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO PARA EL ESTADO DE NAYARIT (CECAMED) ubicada en Av. Jacarandas # 204, C.P. 63130, colonia San Juan, de esta ciudad de Tepic, Nayarit, serán protegidos conforme a lo dispuesto por los artículos 16, 17, 18, fracción I incisos a, b y c de la Ley de Protección de Datos Personales en Posesión de los Sujetos Obligados para el Estado de Nayarit, y demás normatividad aplicable. Los servicios que brinda esta institución son gratuitos en términos de su artículo 6 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit. Artículo 82 de Ley de Transparencia y Acceso a la Información Pública del Estado de Nayarit. La información confidencial que usted proporcione como usuario de los servicios que brinda la Comisión será utilizada únicamente para los efectos de una adecuada integración de su expediente de: Orientación, Asesoría, Gestión Inmediata, Queja, Conciliación o Arbitraje según sea el caso.";

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    
    // 1. Encabezado Oficial
    doc.addImage('/encabezado_acta_carnet.png', 'PNG', 0, 0, 210, 43.8);
    
    // 2. Pie de Página
    doc.addImage('/pie_acta_carnet.jpg', 'JPEG', 0, 251, 210, 46);
    
    // 3. Aviso de Privacidad
    doc.setFont('calibri', 'bold'); 
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50); 
    
    // Título centrado
    doc.text(avisoPrivacidadTitulo, 105, 255, { align: 'center' });
    
    // Cuerpo centrado con salto de línea automático
    doc.setFont('calibri', 'normal');
    doc.setFontSize(5);
    doc.text(avisoPrivacidadCuerpo, 105, 258, { align: 'center', maxWidth: 190 });
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
  
  // Extraemos el mapa del representante (asegurando de que no de error si no existe)
  const rep = exp.representante || {};

  // 1. PREPARACIÓN Y NORMALIZACIÓN DE DATOS
  const expP = {
    ...exp,
    nombre_completo: `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim() || 'NO PROPORCIONÓ',
    municipio_localidad: exp.municipio || exp.localidad || 'NO PROPORCIONÓ',
    domicilio_ciudadano: exp.domicilio_ciudadano || exp.domicilio || 'NO PROPORCIONÓ',
    entidad: exp.entidad || 'Nayarit', // Por defecto si así lo requiere
    nacionalidad: exp.nacionalidad || 'Mexicana',
    identificacion: exp.identificacion || 'NO PROPORCIONÓ',
    
    // --- Mapeo de Datos del Representante ---
    rep_nombre_completo: rep.nombre_completo || '',
    rep_domicilio: rep.domicilio || 'NO PROPORCIONÓ',
    rep_entidad: rep.entidad || 'NO PROPORCIONÓ',
    rep_municipio: rep.municipio || 'NO PROPORCIONÓ',
    rep_telefono: rep.telefono || 'NO PROPORCIONÓ',
    rep_causa: rep.causa_representacion || 'NO PROPORCIONÓ',
    rep_acreditacion: rep.acreditacion || 'NO PROPORCIONÓ',
    rep_parentesco: rep.parentezco || 'NO PROPORCIONÓ', // Ojo a tu typo original "parentezco"
  };

  const tipoAsunto = (exp.tipo || exp.tipo_asunto || 'gestión').toUpperCase();
  const tituloDocumento = `ACTA DE ${tipoAsunto}`;

  // Encabezado institucional (Asegúrate de tener esta función definida en tu código)
  if (typeof encapsularDiseñoInstitucional === 'function') {
     encapsularDiseñoInstitucional(doc, tipoAsunto);
  }

  // 2. RENDERIZADO DE SECCIONES
  let currentY = 45; // Posición de inicio debajo del encabezado

  Object.values(SECCIONES_CONFIG).forEach((seccion) => {
    // Si la sección tiene condición (como el Representante) y no se cumple, nos la saltamos
    if (seccion.condicion && !seccion.condicion(expP)) return;

    // Control de salto de página
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // --- BARRA GRIS DE TÍTULO DE SECCIÓN (Similar a las imágenes) ---
    doc.setFillColor(180, 180, 180); // Color de relleno gris claro
    doc.rect(15, currentY, 180, 6, 'F'); // (x, y, ancho, alto, 'F' = Fill)
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50); // Texto gris oscuro/casi negro
    doc.text(seccion.titulo, 105, currentY + 4.5, { align: 'center' });
    
    currentY += 8; // Espaciado después del título

    // --- CONSTRUCCIÓN DEL CUERPO DE LA TABLA A 2 COLUMNAS ---
    const filasTabla = [];
    
    seccion.filas.forEach(fila => {
      let row = [];
      if (fila.length === 1) {
        // Fila que ocupa todo el ancho (1 Etiqueta + 1 Valor ancho)
        row.push({ content: fila[0].label, styles: { fontStyle: 'bold' } });
        row.push({ content: expP[fila[0].key] || '', colSpan: 3 });
      } else if (fila.length === 2) {
        // Fila dividida en dos columnas (Etiqueta 1 + Valor 1 | Etiqueta 2 + Valor 2)
        row.push({ content: fila[0].label, styles: { fontStyle: 'bold' } });
        row.push({ content: expP[fila[0].key] || '' });
        row.push({ content: fila[1].label, styles: { fontStyle: 'bold' } });
        row.push({ content: expP[fila[1].key] || '' });
      }
      filasTabla.push(row);
    });

    // --- TABLA INVISIBLE PARA ALINEAR TEXTOS ---
    autoTable(doc, {
      startY: currentY,
      body: filasTabla,
      theme: 'plain', // Sin bordes ni estilos extraños
      styles: { 
        fontSize: 9, 
        cellPadding: { top: 1, bottom: 1, left: 0, right: 0 }, 
        textColor: [40, 40, 40],
        font: 'helvetica'
      },
      // Forzamos anchos de columna para que parezca una cuadrícula de 2 columnas (A4 = ~210 ancho)
      columnStyles: { 
        0: { cellWidth: 35 },  // Label 1
        1: { cellWidth: 65 },  // Value 1
        2: { cellWidth: 35 },  // Label 2
        3: { cellWidth: 45 }   // Value 2
      },
      margin: { left: 15, right: 15 },
    });
    
    currentY = doc.lastAutoTable.finalY + 5; // Actualizamos currentY con pequeño margen
  });

  // 3. FIRMAS
  const esQueja = tipoAsunto.includes('QUEJA');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const firmaIzquierda = `TITULAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaDerecha = `AUXILIAR DE LA UNIDAD DE\n${unidadTexto}`;
  const firmaCentro = `FIRMA DEL USUARIO / REPRESENTANTE`;

  let startYFirmas = currentY + 15;
  if (startYFirmas + 35 > 280) { doc.addPage(); startYFirmas = 20; }

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
    styles: { halign: 'center', fontSize: 9, cellPadding: 1, font: 'helvetica', textColor: [20, 20, 20] },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid' 
  });

  // Exportar Documento
  doc.save(`Acta_${tipoAsunto.replace(/ /g, '_')}_${exp.id || 'Exp'}.pdf`);
};


export const generarPDFActaQueja = (exp) => {
  const doc = new jsPDF({ orientation: 'portrait' });
  
  // 1. OBTENCIÓN DE DATOS
  // Asumimos que los datos del modal vienen en exp.datos_docs, si no, usamos valores por defecto
  const qData = exp.datos_docs || {};
  const rep = exp.representante || {};

  const nombreUsuario = `${exp.nombre || ''} ${exp.apellido_paterno || ''} ${exp.apellido_materno || ''}`.trim() || 'NO PROPORCIONÓ';
  const fechaInicioFormal = formatearFechaJuridica(qData.fecha_hora_inicio);
  const fechaConclusionFormal = formatearFechaJuridica(qData.fecha_hora_conclusion);
  
  // Si encapsularDiseñoInstitucionalQueja está definida, la llamamos
  if (typeof encapsularDiseñoInstitucionalQueja === 'function') {
      encapsularDiseñoInstitucionalQueja(doc);
  }

  let currentY = 50; // Comenzamos debajo del encabezado institucional

  // --- AYUDANTE PARA IMPRIMIR TEXTO CON SALTO DE PÁGINA AUTOMÁTICO ---
  const printText = (text, options = {}) => {
    const { fontSize = 9, isBold = false, align = 'justify', x = 15, maxWidth = 180, lineSpacing = 5 } = options;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    const textHeight = lines.length * (fontSize * 0.35); // Aproximación de altura

    if (currentY + textHeight > 240) { // Margen inferior antes del pie de página
      doc.addPage();
      currentY = 50; // Reset Y debajo del encabezado en la nueva página
    }
    
    doc.text(lines, x, currentY, { align, maxWidth });
    currentY += textHeight + lineSpacing;
  };

  // 2. ENCABEZADO DEL DOCUMENTO
  printText('ACTA DE QUEJA', { fontSize: 12, isBold: true, align: 'center' });
  currentY -= 2;
  printText(`NÚMERO DE EXPEDIENTE: ${exp.folio || 'S/N'}`, { align: 'right', isBold: true });
  currentY -= 2;
  printText(`FECHA DE REGISTRO: ${exp.fecha_recepcion || 'S/F'}`, { align: 'right', isBold: true });
  currentY += 5;

  // 3. TABLAS DE DATOS (Usando autoTable para las fichas técnicas)
  const themePlano = {
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1, textColor: [40, 40, 40], font: 'helvetica' },
    margin: { left: 15, right: 15 }
  };

  // 3.1 Datos del Usuario
  autoTable(doc, {
    ...themePlano,
    startY: currentY,
    body: [
      [{ content: 'DATOS DEL USUARIO DE LOS SERVICIOS MÉDICOS', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
      ['NOMBRE:', nombreUsuario, 'SEXO:', exp.sexo || ''],
      ['EDAD:', `${exp.edad_o_nacimiento || ''} AÑOS`, 'DOMICILIO:', exp.domicilio_ciudadano || exp.domicilio || ''],
      ['MUNICIPIO:', exp.municipio || exp.localidad || '', 'ESTADO CIVIL:', exp.estado_civil || ''],
      ['TELÉFONO:', exp.telefonoFijo || '', 'CELULAR:', exp.telefonoCel || exp.telefono || ''],
      ['ENTIDAD:', exp.entidad || 'NAYARIT', 'INSTITUCIÓN:', exp.institucion || ''],
      ['AFILIACIÓN:', exp.afiliacion || '', 'IDENTIFICACIÓN:', exp.identificacion || ''],
      ['CURP:', exp.curp || '', '', '']
    ]
  });
  currentY = doc.lastAutoTable.finalY + 5;

  // 3.2 Datos del Promovente (Representante)
  if (rep.nombre_completo) {
    autoTable(doc, {
      ...themePlano,
      startY: currentY,
      body: [
        [{ content: 'DATOS DEL PROMOVENTE', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
        ['NOMBRE:', rep.nombre_completo, 'EDAD:', rep.edad || ''],
        ['DOMICILIO:', rep.domicilio || '', 'TELÉFONO:', rep.telefono || ''],
        ['DOCUMENTO DE ACREDITACIÓN:', rep.acreditacion || '', '', '']
      ]
    });
    currentY = doc.lastAutoTable.finalY + 5;
  }

  // 3.3 Datos del Prestador del Servicio
  autoTable(doc, {
    ...themePlano,
    startY: currentY,
    body: [
      [{ content: 'PRESTADOR DEL SERVICIO', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
      ['NOMBRE:', qData.contra_quien || exp.medico_nombre || '', 'ESPECIALIDAD:', qData.profesion_especialidad || ''],
      ['DOMICILIO:', exp.medico_domicilio || '', 'TELÉFONO:', exp.medico_telefono || '']
    ]
  });
  currentY = doc.lastAutoTable.finalY + 5;

  // 3.4 Personal de la Comisión
  autoTable(doc, {
    ...themePlano,
    startY: currentY,
    body: [
      [{ content: 'PERSONAL QUE RECIBE Y ATIENDE LA QUEJA', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }],
      ['FORMA DE RECEPCIÓN:', exp.forma_recepcion || 'PRESENCIAL'],
      ['CONSULTOR MÉDICO:', qData.consultor_medico || 'DRA. AMERICA IVONNE GAMEROS ORTIZ'],
      ['CONSULTOR JURÍDICO:', qData.consultor_juridico || 'LCDA. ROSA GLORIA AGUILAR SARTIAGUÍN']
    ]
  });
  currentY = doc.lastAutoTable.finalY + 8;

  // 4. DECLARACIONES Y HECHOS (Narrativa)
  printText(`SIENDO LAS ${fechaInicioFormal}, EL USUARIO DE SERVICIO MÉDICO C. ${nombreUsuario}, CON EL CARÁCTER Y DOMICILIO ARRIBA SEÑALADOS, ME PRESENTO ANTE ESTA COMISIÓN ESTATAL DE ARBITRAJE MÉDICO, MANIFIESTO QUE ES MI VOLUNTAD INICIAR TRÁMITE DE INCONFORMIDAD EN CONTRA DEL PRESTADOR DE SERVICIO ANTES MENCIONADO, POR ACTOS MÉDICOS QUE PUDIERAN ENTRAÑAR MALA PRÁCTICA.`);
  
  printText('EN ESOS TÉRMINOS MANIFIESTO BAJO PROTESTA DE DECIR LA VERDAD QUE HE SIDO INFORMADA DE LO SIGUIENTE:', { isBold: true });
  
  const disclaimers = [
    "A) EL ARBITRAJE ES UNA INSTITUCIÓN CIVIL, QUE PERMITE LA SOLUCIÓN DE LAS DIFERENCIAS ENTRE LAS PARTES.",
    "B) LAS ETAPAS DE PROCEDIMIENTO ARBITRAL ANTE ESTA COMISIÓN NACIONAL, SON DOS: LA CONCILIATORIA EN QUE SE BUSCARÁ EL AVENIMIENTO DE LAS PARTES, SIN PREJUZGAR SOBRE EL FONDO DE LOS HECHOS Y EN SU CASO, SE PODRÁ OBTENER UN CONVENIO QUE TENDRÁ POR OBJETO DAR FIN A LA CONTROVERSIA, EN LOS TÉRMINOS ACORDADOS POR LAS PARTES. LA SEGUNDA ETAPA TENDRÁ POR FINALIDAD BUSCAR EL PRONUNCIAMIENTO ARBITRAL, BAJO LA MODALIDAD QUE ACORDEMOS LAS PARTES (ESTRICTO DERECHO O EN CONCIENCIA).",
    "C) QUE, TRATÁNDOSE DE UN MEDIO ALTERNO PARA LA SOLUCIÓN DE CONTROVERSIAS, LAS REGLAS DEL PROCEDIMIENTO, ESTARÁN SUJETAS, NECESARIAMENTE, A LA ACEPTACIÓN DEL PRESTADOR DEL SERVICIO.",
    "D) QUE AL COMPROMETER EN ÁRBITROS SE GENERAN OBLIGACIONES PARA LAS PARTES (AJUSTARSE A LO PACTADO PARA EL PROCEDIMIENTO, ATENDER LOS REQUERIMIENTOS DE CECAMED), EN LA INTELIGENCIA QUE DURANTE SU TRAMITACIÓN NO PODRÁ SER VENTILADA LA CONTROVERSIA ANTE OTRA INSTANCIA, POR ELLO MANIFIESTO QUE NO EXISTE JUICIO PENDIENTE DE TRÁMITE.",
    "E) QUE EL ARBITRAJE MÉDICO OPERA BAJO REGLAS DE ESTRICTA CONFIDENCIALIDAD, POR ELLO EXCEPCIONALMENTE PODRÁ HACERSE PÚBLICA LA INFORMACIÓN Y RESOLUCIÓN ARBITRALES, CUANDO EXISTA INCUMPLIMIENTO DE OBLIGACIONES Y SOLO PARA BUSCAR SU CUMPLIMIENTO, DE NINGUNA SUERTE PARA AFECTAR LA IMAGEN PÚBLICA DE LAS PARTES, APELANDO A LAS REGLAS QUE RIGEN EL SECRETO PROFESIONAL MÉDICO."
  ];

  disclaimers.forEach(d => printText(d, { x: 20, maxWidth: 170 }));

  printText('DEBIDAMENTE ENTERADA DE LO ANTERIOR, ACEPTO, DE MI LIBRE Y ESPONTÁNEA VOLUNTAD LAS REGLAS ANTERIORMENTE ENUNCIADAS.', { isBold: true });
  
  printText(`CONFORME A LO ANTERIOR MANIFIESTO QUE EL MOTIVO DE LA QUEJA ES: ${qData.motivo_queja || exp.submotivo_catalogo || '---'}, EN BASE A LO SIGUIENTE:`);

  // HECHOS
  printText('H E C H O S', { align: 'center', isBold: true, fontSize: 10, lineSpacing: 6 });
  
  const narrativaHechos = `MI NOMBRE ES ${nombreUsuario}, DE ${exp.edad_o_nacimiento || '___'} AÑOS DE EDAD, QUIEN ME PRESENTO A ESTA COMISIÓN A INTERPONER MI INCONFORMIDAD EN CONTRA DEL ${qData.contra_quien || '___'}, ${qData.profesion_especialidad || '___'}. ${qData.hechos_ocurridos || 'NO SE REDACTARON HECHOS.'}`;
  printText(narrativaHechos);

  printText(`POR LO ANTERIOR SOLICITO: ${qData.pretensiones_generales || exp.pretensiones || '---'}`);

  printText('CON APOYO DE LOS HECHOS Y PRECEPTOS JURÍDICOS SEÑALADOS, SOLICITO A ESTA COMISIÓN ESTATAL DE ARBITRAJE MÉDICO, INTERVENGA EN MI ASUNTO EN RELACIÓN AL (LOS) PRESTADOR (ES) DE SERVICIOS CITADO (S), REQUIRIÉNDOLE :');

  const peticionesLegales = [
    "PRIMERA.- TENER POR PRESENTADA LA INCONFORMIDAD AL TENOR DE LOS HECHOS EXPRESADOS.",
    "SEGUNDA.- TENER POR ACEPTADAS DE MI PARTE, LAS REGLAS Y CONDICIONES DE LAS QUE HE SIDO INFORMADO EN LOS INCISOS A AL E, DEL PRESENTE ESCRITO.",
    "TERCERA.- CONVOCAR AL (LOS) PRESTADOR (ES) DE SERVICIOS PARA LAS DILIGENCIAS ARBITRALES A QUE HAYA LUGAR E INTERPONER SUS BUENOS OFICIOS, A EFECTO DE BUSCAR SOLUCIÓN CONCILIATORIA.",
    "CUARTA.- CORRER TRASLADO AL (LOS) PRESTADOR (ES) DE SERVICIOS EN TÉRMINOS DEL PRESENTE ESCRITO, A FIN DE QUE ENTREGUE RESUMEN Y/O EXPEDIENTE CLÍNICO DE LA ATENCIÓN PRESTADA, EN TÉRMINOS DEL ARTÍCULO 29 DEL REGLAMENTO DE LA LEY GENERAL DE SALUD EN MATERIA DE PRESTACIÓN DE SERVICIOS DE ATENCIÓN MÉDICA.",
    "QUINTA.- TENER COMO CONFIDENCIAL LA INFORMACIÓN PROPORCIONADA PARA EFECTOS DE DESAHOGAR MI INCONFORMIDAD."
  ];

  peticionesLegales.forEach(p => printText(p));

  // PRETENSIONES HACIA EL PRESTADOR
  printText('PRETENSIONES HACIA EL PRESTADOR DE SERVICIO', { isBold: true, lineSpacing: 6 });
  const listaPretensiones = Array.isArray(qData.pretensiones_listadas) && qData.pretensiones_listadas.length > 0
    ? qData.pretensiones_listadas 
    : ['NO SE ESPECIFICARON PRETENSIONES.'];
    
  listaPretensiones.forEach(pretension => printText(`• ${pretension}`, { x: 20, maxWidth: 170 }));

  // DOCUMENTACIÓN RECIBIDA
  printText('DOCUMENTACIÓN RECIBIDA:', { isBold: true, lineSpacing: 6 });
  const listaDocumentos = Array.isArray(qData.documentacion_recibida) && qData.documentacion_recibida.length > 0
    ? qData.documentacion_recibida 
    : ['1. COPIA SIMPLE DE INE.', '2. COPIA SIMPLE DE COMPROBANTE DE DOMICILIO CFE.'];
    
  listaDocumentos.forEach((docu, i) => printText(`${i + 1}. ${docu}`, { x: 20, maxWidth: 170 }));

  // CONCLUSIÓN
  currentY += 5;
  printText(`SE CONCLUYE LA PRESENTE A LAS ${fechaConclusionFormal}. EN LA CIUDAD DE TEPIC, NAYARIT, EN EL DÍA QUE SE ACTÚA.`, { isBold: true, align: 'center' });

  // 5. FIRMA
  currentY += 20;
  if (currentY > 250) { doc.addPage(); currentY = 50; }
  
  printText('PROTESTO LO NECESARIO', { align: 'center', isBold: true });
  currentY += 15;
  printText('___________________________________________________', { align: 'center' });
  printText(`C. ${nombreUsuario}`, { align: 'center', isBold: true });
  printText('USUARIO DE SERVICIO MÉDICO', { align: 'center' });

  // Exportar Documento
  doc.save(`Acta_Queja_${exp.id || 'Exp'}.pdf`);
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