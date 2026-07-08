// frontend/src/components/pdf/DocumentoActaQueja.jsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

Font.register({
  family: 'tahoma',
  fonts: [
    { src: '/fonts/tahoma.ttf' }, // Normal
    { src: '/fonts/tahomabd.ttf', fontWeight: 'bold' } // Negrita
  ]
});

Font.register({
  family: 'calibri',
  fonts: [
    { src: '/fonts/calibri.ttf' },
    { src: '/fonts/calibrib.ttf', fontWeight: 'bold' }
  ]
});

// TEXTOS ESTÁTICOS AJUSTADOS EXACTAMENTE AL FORMATO DEL PDF [cite: 51, 52, 53, 54, 55, 56]
const DISCLAIMERS = [
  "a. EL ARBITRAJE ES UNA INSTITUCIÓN CIVIL, QUE PERMITE LA SOLUCIÓN DE LAS DIFERENCIAS ENTRE LAS PARTES.",
  "b. LAS ETAPAS DE PROCEDIMIENTO ARBITRAL ANTE ESTA COMISIÓN NACIONAL, SON DOS: LA CONCILIATORIA EN QUE SE BUSCARÁ EL AVENIMIENTO DE LAS PARTES, SIN PREJUZGAR SOBRE EL FONDO DE LOS HECHOS Y EN SU CASO, SE PODRÁ OBTENER UN CONVENIO QUE TENDRÁ POR OBJETO DAR FIN A LA CONTROVERSIA, EN LOS TÉRMINOS ACORDADOS POR LAS PARTES.\n\nLA SEGUNDA ETAPA TENDRÁ POR FINALIDAD BUSCAR EL PRONUNCIAMIENTO ARBITRAL, BAJO LA MODALIDAD QUE ACORDEMOS LAS PARTES (ESTRICTO DERECHO O EN CONCIENCIA).",
  "c. QUE, TRATÁNDOSE DE UN MEDIO ALTERNO PARA LA SOLUCIÓN DE CONTROVERSIAS, LAS REGLAS DEL PROCEDIMIENTO, ESTARÁN SUJETAS, NECESARIAMENTE, A LA ACEPTACIÓN DEL PRESTADOR DEL SERVICIO.",
  "d. QUE AL COMPROMETER EN ÁRBITROS SE GENERAN OBLIGACIONES PARA LAS PARTES (AJUSTARSE A LO PACTADO PARA EL PROCEDIMIENTO, ATENDER LOS REQUERIMIENTOS DE CECAMED), EN LA INTELIGENCIA QUE DURANTE SU TRAMITACIÓN NO PODRÁ SER VENTILADA LA CONTROVERSIA ANTE OTRA INSTANCIA, POR ELLO MANIFIESTO QUE NO EXISTE JUICIO PENDIENTE DE TRÁMITE.",
  "e. QUE EL ARBITRAJE MÉDICO OPERA BAJO REGLAS DE ESTRICTA CONFIDENCIALIDAD, POR ELLO EXCEPCIONALMENTE PODRÁ HACERSE PÚBLICA LA INFORMACIÓN Y RESOLUCIÓN ARBITRALES, CUANDO EXISTA INCUMPLIMIENTO DE OBLIGACIONES Y SOLO PARA BUSCAR SU CUMPLIMIENTO, DE NINGUNA SUERTE PARA AFECTAR LA IMAGEN PÚBLICA DE LAS PARTES, APELANDO A LAS REGLAS QUE RIGEN EL SECRETO PROFESIONAL MÉDICO."
];

// AJUSTADO CON EL GUION Y ESPACIO EXACTO DEL DOCUMENTO LEGAL [cite: 78, 79, 80, 81, 82]
const PETICIONES_LEGALES = [
  "PRIMERA. - TENER POR PRESENTADA LA INCONFORMIDAD AL TENOR DE LOS HECHOS EXPRESADOS.",
  "SEGUNDA. - TENER POR ACEPTADAS DE MI PARTE, LAS REGLAS Y CONDICIONES DE LAS QUE HE SIDO INFORMADO EN LOS INCISOS A AL E, DEL PRESENTE ESCRITO.",
  "TERCERA. - CONVOCAR AL (LOS) PRESTADOR (ES) DE SERVICIOS PARA LAS DILIGENCIAS ARBITRALES A QUE HAYA LUGAR E INTERPONER SUS BUENOS OFICIOS, A EFECTO DE BUSCAR SOLUCIÓN CONCILIATORIA.",
  "CUARTA. - CORRER TRASLADO AL (LOS) PRESTADOR (ES) DE SERVICIOS EN TÉRMINOS DEL PRESENTE ESCRITO, A FIN DE QUE ENTREGUE RESUMEN Y/O EXPEDIENTE CLÍNICO DE LA ATENCIÓN PRESTADA, EN TÉRMINOS DEL ARTÍCULO 29 DEL REGLAMENTO DE LA LEY GENERAL DE SALUD EN MATERIA DE PRESTACIÓN DE SERVICIOS DE ATENCIÓN MÉDICA.",
  "QUINTA. - TENER COMO CONFIDENCIAL LA INFORMACIÓN PROPORCIONADA PARA EFECTOS DE DESAHOGAR MI INCONFORMIDAD."
];

const ORDINALES = [
  'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 
  'SÉPTIMA', 'OCTAVA', 'NOVENA', 'DÉCIMA', 'DÉCIMO PRIMERA', 
  'DÉCIMO SEGUNDA', 'DÉCIMO TERCERA', 'DÉCIMO CUARTA', 'DÉCIMO QUINTA'
];

// ESTILOS AJUSTADOS PARA EMPATAR CON EL DOCUMENTO ORIGINAL
const styles = StyleSheet.create({
  page: {
    paddingTop: '45mm', 
    paddingBottom: '48mm', 
    paddingHorizontal: '15mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 11, 
    textTransform: 'uppercase', 
  },
  
  // Textos y Párrafos
  textBase: { marginBottom: '3mm', lineHeight: 1.3, textAlign: 'justify' }, // Aumenté el lineHeight para que lea mejor como un acta
  textBold: { fontWeight: 'bold', marginBottom: '3mm', lineHeight: 1.3, textAlign: 'justify' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  
  // Títulos [cite: 4, 59, 83]
  titleMain: { fontSize: 12, fontFamily: 'tahoma', fontWeight: 'bold', textAlign: 'center', marginVertical: '6mm' },
  titleSection: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#B4B4B4', color: '#323232', paddingVertical: '1.5mm', marginVertical: '4mm' }, // Acompañamos el tamaño de las secciones a 11
  // Tablas sin fondo gris (como en el PDF escaneado) 
  tableRow: { flexDirection: 'row', minHeight: '6mm', alignItems: 'center', paddingVertical: '1mm' },
  tLabel: { width: '18%', fontFamily: 'tahoma', fontWeight: 'bold', color: '#000000' }, // Negrita sólida
  tValue: { width: '38%', color: '#000000', paddingRight: '2mm' }, 
  tLabel2: { width: '16%', fontFamily: 'tahoma', color: '#000000' }, 
  tValue2: { width: '28%', color: '#000000' }, 
  tValueFull: { width: '82%', color: '#000000' }, 
  
  // Listas y Sangrías
  listIndent: { marginLeft: '6mm', marginBottom: '4mm', lineHeight: 1.3, textAlign: 'justify' },
  pretensionRow: { flexDirection: 'row', marginBottom: '4mm', width: '100%' },
  pretensionOrdinal: { width: '16%', fontFamily: 'tahoma', marginLeft: '6mm' }, // Espacio para "PRIMERA. -"
  pretensionText: { width: '78%', textAlign: 'justify', lineHeight: 1.3 }, 
  
  // Firmas [cite: 88, 98, 99]
  firmaContainer: { marginTop: '25mm', alignItems: 'center' },
  firmaLinea: { marginBottom: '3mm' },
});

const DocumentoActaQueja = ({ data }) => {
  const { qData, rep } = data;

  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />
        
        {/* ENCABEZADO [cite: 4, 7] */}
        <Text style={styles.titleMain}>ACTA DE QUEJA</Text>
        <Text style={[styles.textBold, styles.textRight, { marginBottom: '1mm' }]}>NÚMERO DE EXPEDIENTE: {data.servicio || 'S/N'}</Text>
        <Text style={[styles.textBold, styles.textRight, { marginBottom: '6mm' }]}>FECHA DE REGISTRO: {data.fecha_recepcion || 'S/F'}</Text>

        {/* 1. DATOS DEL USUARIO [cite: 8, 5, 6, 10, 9, 11] */}
        <View wrap={false} style={{ marginBottom: '4mm' }}>
          <Text style={styles.titleSection}>DATOS DEL USUARIO DE LOS SERVICIOS MÉDICOS</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>NOMBRE:</Text><Text style={styles.tValueFull}>{data.nombreUsuario}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>SEXO:</Text><Text style={styles.tValue}>{data.sexo || ''}</Text>
            <Text style={styles.tLabel2}>EDAD:</Text><Text style={styles.tValue2}>{data.edadNormalizadaUsuario ? `${data.edadNormalizadaUsuario} AÑOS` : '___ AÑOS'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>DOMICILIO:</Text><Text style={styles.tValue}>{data.domicilio_ciudadano || data.domicilio || ''}</Text>
            <Text style={styles.tLabel2}>MUNICIPIO:</Text><Text style={styles.tValue2}>{data.municipio || data.localidad || ''}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>ESTADO CIVIL:</Text><Text style={styles.tValue}>{data.estado_civil || ''}</Text>
            <Text style={styles.tLabel2}>TELÉFONO:</Text><Text style={styles.tValue2}>{data.telefonoFijo || data.telefono || ''}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>INSTITUCIÓN:</Text><Text style={styles.tValue}>{data.institucion || ''}</Text>
            <Text style={styles.tLabel2}>ENTIDAD:</Text><Text style={styles.tValue2}>{data.entidad || 'NAYARIT'}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>IDENTIFICACIÓN:</Text><Text style={styles.tValue}>{data.identificacion || ''}</Text>
            <Text style={styles.tLabel2}>CURP:</Text><Text style={styles.tValue2}>{data.curp || ''}</Text>
          </View>
        </View>

        {/* 2. DATOS DEL PROMOVENTE (Condicional) [cite: 20, 21, 23, 22, 24] */}
        {rep.nombre_completo && (
          <View wrap={false} style={{ marginBottom: '4mm' }}>
            <Text style={styles.titleSection}>DATOS DEL PROMOVENTE</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tLabel}>NOMBRE:</Text><Text style={styles.tValue}>{rep.nombre_completo}</Text>
              <Text style={styles.tLabel2}>EDAD:</Text><Text style={styles.tValue2}>{rep.edad || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tLabel}>DOMICILIO:</Text><Text style={styles.tValue}>{rep.domicilio || ''}</Text>
              <Text style={styles.tLabel2}>TELÉFONO:</Text><Text style={styles.tValue2}>{rep.telefono || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tLabel}>ACREDITACIÓN:</Text><Text style={styles.tValueFull}>{rep.acreditacion || ''}</Text>
            </View>
          </View>
        )}

        {/* 3. PRESTADOR Y PERSONAL [cite: 26, 27, 28, 29, 30] */}
        <View wrap={false} style={{ marginBottom: '4mm' }}>
          <Text style={styles.titleSection}>PRESTADOR DEL SERVICIO</Text>
          <View style={styles.tableRow}><Text style={styles.tLabel}>NOMBRE:</Text><Text style={styles.tValueFull}>{qData.contra_quien || data.medico_nombre || ''}</Text></View>
          <View style={styles.tableRow}>
            <Text style={styles.tLabel}>DOMICILIO:</Text><Text style={styles.tValue}>{data.medico_domicilio || ''}</Text>
            <Text style={styles.tLabel2}>TELÉFONO:</Text><Text style={styles.tValue2}>{data.medico_telefono || ''}</Text>
          </View>
          <View style={styles.tableRow}><Text style={styles.tLabel}>ESPECIALIDAD:</Text><Text style={styles.tValueFull}>{qData.profesion_especialidad || ''}</Text></View>
        </View>

        {/* [cite: 32, 31, 34, 36] */}
        <View wrap={false} style={{ marginBottom: '8mm' }}>
          <Text style={styles.titleSection}>PERSONAL QUE RECIBE Y ATIENDE LA QUEJA</Text>
          <View style={styles.tableRow}><Text style={{ width: '25%', fontFamily: 'Helvetica-Bold' }}>FORMA RECEPCIÓN:</Text><Text style={{ width: '75%' }}>{data.forma_recepcion || 'PRESENCIAL'}</Text></View>
          <View style={styles.tableRow}><Text style={{ width: '25%', fontFamily: 'Helvetica-Bold' }}>CONSULTOR MÉDICO:</Text><Text style={{ width: '75%' }}>{qData.consultor_medico || 'DRA. AMERICA IVONNE GAMEROS ORTIZ'}</Text></View>
          <View style={styles.tableRow}><Text style={{ width: '25%', fontFamily: 'Helvetica-Bold' }}>CONSULTOR JURÍDICO:</Text><Text style={{ width: '75%' }}>{qData.consultor_juridico || 'LCDA. ROSA GLORIA AGUILAR SARTIAGUÍN'}</Text></View>
        </View>

        {/* CUERPO NARRATIVO [cite: 38, 49, 50] */}
        <Text style={styles.textBase}>
          SIENDO LAS {data.fechaInicioFormal}, EL USUARIO DE SERVICIO MÉDICO C. {data.nombreUsuario}, CON EL CARÁCTER Y DOMICILIO ARRIBA SEÑALADOS, ME PRESENTO ANTE ESTA COMISIÓN ESTATAL DE ARBITRAJE MÉDICO, MANIFIESTO QUE ES MI VOLUNTAD INICIAR TRÁMITE DE INCONFORMIDAD EN CONTRA DEL PRESTADOR DE SERVICIO ANTES MENCIONADO, POR ACTOS MÉDICOS QUE PUDIERAN ENTRAÑAR MALA PRÁCTICA.
        </Text>
        
        <Text style={styles.textBold}>EN ESOS TÉRMINOS MANIFIESTO BAJO PROTESTA DE DECIR LA VERDAD QUE HE SIDO INFORMADA DE LO SIGUIENTE:</Text>
        
        {/* [cite: 51, 52, 53, 54, 55, 56] */}
        {DISCLAIMERS.map((d, i) => (
          <Text key={i} style={styles.listIndent}>{d}</Text>
        ))}

        {/* [cite: 57, 58, 59] */}
        <Text style={styles.textBold}>DEBIDAMENTE ENTERADA DE LO ANTERIOR, ACEPTO, DE MI LIBRE Y ESPONTÁNEA VOLUNTAD LAS REGLAS ANTERIORMENTE ENUNCIADAS.</Text>
        <Text style={styles.textBase}>CONFORME A LO ANTERIOR MANIFIESTO QUE EL MOTIVO DE LA QUEJA ES: {qData.motivo_queja || data.submotivo_catalogo || '---'}, EN BASE A LO SIGUIENTE:</Text>
        
        <Text style={[styles.textBold, styles.textCenter, { fontSize: 11, marginVertical: '5mm' }]}>HECHOS</Text>
        
        {/* [cite: 71, 72, 73, 74, 75] */}
        <Text style={styles.textBase}>
          MI NOMBRE ES {data.nombreUsuario}, DE {data.edadNormalizadaUsuario || '___'} AÑOS DE EDAD, QUIEN ME PRESENTO A ESTA COMISIÓN A INTERPONER MI INCONFORMIDAD EN CONTRA DEL {qData.contra_quien || '___'}, {qData.profesion_especialidad || '___'}. {qData.hechos_ocurridos || 'NO SE REDACTARON HECHOS.'}
        </Text>

        {/* [cite: 76, 77] */}
        <Text style={styles.textBold}>POR LO ANTERIOR SOLICITO {qData.pretensiones_generales || data.pretensiones || '---'}</Text>
        <Text style={styles.textBase}>CON APOYO DE LOS HECHOS Y PRECEPTOS JURÍDICOS SEÑALADOS, SOLICITO A ESTA COMISIÓN NACIONAL DE ARBITRAJE MÉDICO, INTERVENGA EN MI ASUNTO EN RELACIÓN AL (LOS) PRESTADOR (ES) DE SERVICIOS CITADO (S), REQUIRIÉNDOLE :</Text>

        {/* [cite: 78, 79, 80, 81, 82] */}
        {PETICIONES_LEGALES.map((p, i) => (
          <Text key={i} style={styles.textBase}>{p}</Text>
        ))}

        {/* [cite: 83] */}
        <Text style={[styles.textBold, styles.textCenter, { marginVertical: '5mm' }]}>PRETENSIONES HACIA EL PRESTADOR DE SERVICIO</Text>

        {/* LISTA DE PRETENSIONES [cite: 84] */}
        {data.listaPretensiones.map((pretension, idx) => {
          const ordinal = `${ORDINALES[idx] || (idx + 1 + 'A')}. -`;
          return (
            <View key={idx} style={styles.pretensionRow} wrap={false}>
              <Text style={styles.pretensionOrdinal}>{ordinal}</Text>
              <Text style={styles.pretensionText}>{pretension}</Text>
            </View>
          );
        })}

        {/* [cite: 85, 86] */}
        <Text style={[styles.textBold, { marginTop: '6mm', marginBottom: '3mm' }]}>DOCUMENTACIÓN RECIBIDA:</Text>
        {data.listaDocumentos.map((docu, i) => (
          <Text key={i} style={styles.listIndent}>{i + 1}. {docu}</Text>
        ))}

        {/* CIERRE Y FIRMAS [cite: 87] */}
        <Text style={[styles.textBase, styles.textCenter, { marginTop: '10mm', marginBottom: '15mm' }]}>
          SE CONCLUYE LA PRESENTE A {data.fechaConclusionFormal}. EN LA CIUDAD DE TEPIC, NAYARIT, EN EL DÍA QUE SE ACTÚA.
        </Text>

        {/* [cite: 88, 98, 99] */}
        <View style={styles.firmaContainer} wrap={false}>
          <Text style={[styles.textBold, { marginBottom: '15mm' }]}>PROTESTO LO NECESARIO</Text>
          <Text style={styles.firmaLinea}>___________________________________________________</Text>
          <Text style={styles.textBold}>C. {data.nombreUsuario}</Text>
          <Text>USUARIO DE SERVICIO MÉDICO.</Text>
        </View>

        {/* FOOTER CON AVISO DE PRIVACIDAD */}
        <PDFFooter tipo="queja" />
      </Page>
    </Document>
  );
};

export default DocumentoActaQueja;