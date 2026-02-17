import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatName } from './formatters';

// --- AYUDANTE 1: CLASIFICACIÓN DE INSTITUCIONES ---
// Aquí definimos las palabras clave para saber en qué columna sumar
const clasificarInstitucion = (nombreRaw) => {
  const nombre = (nombreRaw || '').toUpperCase();

  // 1. IMSS (Incluye UMF, HGZ, HGR, Bienestar)
  if (
    nombre.includes('IMSS') || 
    nombre.includes('HGZ') || 
    nombre.includes('UMF') || 
    nombre.includes('HGR') ||
    nombre.includes('HOSPITAL GENERAL') ||
    nombre.includes('BIENESTAR')
  ) return 'imss';

  // 2. ISSSTE (Incluye CH, Clinica Hospital)
  if (
    nombre.includes('ISSSTE') || 
    nombre.includes('FOVISSSTE') ||
    nombre.includes('CH ') || // Clínica Hospital
    nombre.includes('CLINICA HOSPITAL')
  ) return 'issste';

  // 3. SSN / SSA (Secretaría de Salud, Hospital Civil, Centros de Salud)
  if (
    nombre.includes('SSN') || 
    nombre.includes('SSA') || 
    nombre.includes('SERVICIOS DE SALUD') || 
    nombre.includes('HOSPITAL CIVIL') || 
    nombre.includes('CENTRO DE SALUD') ||
    nombre.includes('CESSA') ||
    nombre.includes('UNEME') ||
    nombre.includes('INSABI')
  ) return 'ssn';

  // 4. PRIVADOS
  if (
    nombre.includes('PRIV') || 
    nombre.includes('PARTICULAR') || 
    nombre.includes('CONSULTORIO') || 
    nombre.includes('FARMACIA') || 
    nombre.includes('SANATORIO') ||
    nombre.includes('CLINICA SAN') || // Ej. San Rafael
    nombre.includes('PUERTA DE HIERRO') ||
    nombre.includes('CMQ') ||
    nombre.includes('HOSPITAL REAL')
  ) return 'priv';

  // 5. OTROS (Defensa, Marina, Pemex, Cruz Roja, etc.)
  return 'otros';
};

// --- AYUDANTE 2: CLASIFICACIÓN DE ACTIVIDAD ---
const clasificarActividad = (actividadRaw) => {
  const act = (actividadRaw || '').toUpperCase();
  if (act.includes('ORIENTACI')) return 'orientaciones';
  if (act.includes('ASESOR')) return 'asesorias';
  if (act.includes('GESTI')) return 'gestiones';
  if (act.includes('QUEJA')) return 'quejas';
  if (act.includes('DICTAMEN')) return 'dictamenes';
  return null; // Si no coincide
};

// --- AYUDANTE 3: FECHA SEGURA ---
// Evita que "2026-01-01" se convierta en "Diciembre" por la zona horaria
const obtenerMesAnio = (fechaString) => {
  if (!fechaString) return "FECHA DESCONOCIDA";
  const [anio, mes] = fechaString.split('-'); // "2026-01-20" -> ["2026", "01"]
  const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  return `${meses[parseInt(mes) - 1]} DE ${anio}`;
};

export const generarPDFMensual = (data, fechaInicio, fechaFin) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const periodoTexto = obtenerMesAnio(fechaInicio); // Usamos la fecha de inicio para el título

  // ===========================================================================
  // 1. PROCESAMIENTO DE DATOS
  // ===========================================================================
  
  // Matriz de contadores
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
    // 1. Clasificar Institución y Actividad
    const instKey = clasificarInstitucion(exp.prestador_nombre || exp.institucion);
    const asuntoKey = clasificarActividad(exp.actividad_apoyo || exp.tipo_asunto);

    // 2. Sumar a la matriz (solo si identificamos la actividad)
    if (asuntoKey && stats[instKey]) {
      stats[instKey][asuntoKey]++;
    }

    // 3. Contadores Demográficos (CORREGIDO)
    const sexo = (exp.sexo || '').toUpperCase();
    
    if (sexo.startsWith('H') || sexo.startsWith('MASC')) {
        totalHombres++;
    } else if (sexo.startsWith('F') || sexo.startsWith('MUJ') || sexo === 'M') {
        // Solo entra aquí si NO entró en el if anterior (así MASCULINO no cuenta doble)
        // Y aceptamos 'M' solita como Mujer (estándar CURP)
        totalMujeres++;
    }

    if (exp.foraneo === true || exp.foraneo === 'true') totalForaneos++;

    // 4. Llenar Tabla 2 (FILTRO: Solo Gestiones, Quejas y Dictámenes)
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

  // Función para sumar fila horizontal
  const sumRow = (key) => stats.imss[key] + stats.issste[key] + stats.ssn[key] + stats.priv[key] + stats.otros[key];
  
  // Totales verticales
  const tImss = Object.values(stats.imss).reduce((a,b)=>a+b,0);
  const tIssste = Object.values(stats.issste).reduce((a,b)=>a+b,0);
  const tSsn = Object.values(stats.ssn).reduce((a,b)=>a+b,0);
  const tPriv = Object.values(stats.priv).reduce((a,b)=>a+b,0);
  const tOtros = Object.values(stats.otros).reduce((a,b)=>a+b,0);
  const granTotal = tImss + tIssste + tSsn + tPriv + tOtros;

  // Estilo para celdas azules (TOTAL)
  const blueCellStyle = { fillColor: [189, 215, 238], fontStyle: 'bold', halign: 'center' };

  // ===========================================================================
  // 2. DIBUJAR PDF
  // ===========================================================================

  // --- ENCABEZADO ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("REPORTE LLENADO POR LA UNIDAD DE ORIENTACIÓN", 148.5, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text(`CONCENTRADO DE ASUNTOS RECIBIDOS ${periodoTexto}`, 148.5, 22, { align: 'center' });

  // --- TABLA 1: CONCENTRADO ---
  autoTable(doc, {
    startY: 30,
    head: [['ASUNTO', 'IMSS', 'ISSSTE', 'SSN', 'PRIV.', 'OTROS', 'TOTAL']],
    body: [
      ['ORIENTACIONES', stats.imss.orientaciones, stats.issste.orientaciones, stats.ssn.orientaciones, stats.priv.orientaciones, stats.otros.orientaciones, sumRow('orientaciones')],
      ['ASESORÍAS',     stats.imss.asesorias,     stats.issste.asesorias,     stats.ssn.asesorias,     stats.priv.asesorias,     stats.otros.asesorias,     sumRow('asesorias')],
      ['GESTIONES',     stats.imss.gestiones,     stats.issste.gestiones,     stats.ssn.gestiones,     stats.priv.gestiones,     stats.otros.gestiones,     sumRow('gestiones')],
      ['QUEJAS',        stats.imss.quejas,        stats.issste.quejas,        stats.ssn.quejas,        stats.priv.quejas,        stats.otros.quejas,        sumRow('quejas')],
      ['DICTÁMENES',    stats.imss.dictamenes,    stats.issste.dictamenes,    stats.ssn.dictamenes,    stats.priv.dictamenes,    stats.otros.dictamenes,    sumRow('dictamenes')],
      
      // Fila de TOTALES (Toda en Azul)
      [
        { content: 'TOTAL', styles: blueCellStyle }, 
        { content: tImss, styles: blueCellStyle }, 
        { content: tIssste, styles: blueCellStyle }, 
        { content: tSsn, styles: blueCellStyle }, 
        { content: tPriv, styles: blueCellStyle }, 
        { content: tOtros, styles: blueCellStyle }, 
        { content: granTotal, styles: blueCellStyle }
      ]
    ],
    theme: 'plain', // Usamos 'plain' para controlar bordes manualmente
    headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, halign: 'center', fontSize: 9, cellPadding: 1.5 },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } }
  });

  // --- RESUMEN DEMOGRÁFICO ---
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total, de Hombres: ${totalHombres}`, 148.5, finalY, { align: 'center' });
  doc.text(`Total, de Mujeres: ${totalMujeres}`, 148.5, finalY + 5, { align: 'center' });
  doc.text(`Total, de Asuntos Foráneos: ${totalForaneos}`, 148.5, finalY + 10, { align: 'center' });

  // --- SEGUNDO TÍTULO ---
  finalY += 25;
  // Si la tabla es muy larga y salta de página, esto podría quedar mal, 
  // pero jspdf-autotable maneja el header en la nueva página.
  doc.setFont('helvetica', 'bold');
  doc.text(`MOTIVOS DE INCONFORMIDAD RECIBIDOS ${periodoTexto}`, 148.5, finalY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text("(Gestiones, Quejas y Dictámenes)", 148.5, finalY + 5, { align: 'center' });

  // --- TABLA 2: DETALLES ---
  autoTable(doc, {
    startY: finalY + 10,
    head: [['Asunto', 'Institución\nMédica y\njurídica', 'Especialidad', 'Motivo', 'Edad', 'Sexo', 'DX.', 'Fecha de\nRecepción']],
    body: filasDetalle,
    theme: 'plain',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: 0, 
      fontStyle: 'bold', 
      lineWidth: 0.1,
      lineColor: 0,
      halign: 'center',
      valign: 'middle'
    },
    styles: { 
      lineColor: [0, 0, 0], 
      lineWidth: 0.1, 
      fontSize: 8,
      cellPadding: 1.5,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'left' }, // Asunto
      1: { cellWidth: 45, halign: 'left' }, // Institución (Más espacio)
      2: { cellWidth: 30, halign: 'left' }, // Especialidad
      3: { cellWidth: 60, halign: 'left' }, // Motivo
      4: { cellWidth: 15, halign: 'center' }, // Edad
      5: { cellWidth: 15, halign: 'center' }, // Sexo
      6: { cellWidth: 40, halign: 'left' }, // DX
      7: { cellWidth: 25, halign: 'center' }  // Fecha
    },
    // Margen para imprimir
    margin: { top: 15, bottom: 15, left: 10, right: 10 }
  });

  // Guardar PDF
  doc.save(`Reporte_Mensual_${periodoTexto.replace(/ /g, '_')}.pdf`);
};