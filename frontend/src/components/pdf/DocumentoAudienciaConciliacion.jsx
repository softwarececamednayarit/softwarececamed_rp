import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

Font.register({
  family: 'tahoma',
  fonts: [
    { src: '/fonts/tahoma.ttf' },
    { src: '/fonts/tahomabd.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    paddingTop: '40mm', 
    paddingBottom: '45mm', 
    paddingHorizontal: '20mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 11, // Reducido a 11 como fue solicitado
    textTransform: 'uppercase', // Fuerza mayúsculas en toda la hoja
  },
  
  // --- TÍTULO Y EXPEDIENTE ---
  titleCentral: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '4mm',
  },
  expText: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '6mm', 
  },

  // --- CUERPO ---
  parrafo: {
    textAlign: 'justify',
    lineHeight: 1.1, // Interlineado ajustado a sencillo
    marginBottom: '4mm', // Párrafos más juntos
  },
  bold: {
    fontWeight: 'bold',
  },

  // --- CLÁUSULAS Y ACUERDOS ---
  clausulaTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '2mm',
    marginBottom: '4mm',
  },
  clausulaBlock: {
    marginBottom: '3mm',
    textAlign: 'justify',
    lineHeight: 1.1, // Interlineado ajustado a sencillo
  },

  // --- FIRMAS VERTICALES ---
  firmasSeccion: {
    marginTop: '10mm',
    alignItems: 'center',
    width: '100%',
  },
  firmaBlock: {
    alignItems: 'center',
    marginBottom: '10mm', 
    width: '80%',
  },
  firmaTituloCentral: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '12mm', 
    marginTop: '4mm',
  },
  firmaNombre: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  firmaCargo: {
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

const DocumentoAudienciaConciliacion = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader fixed />

        <Text style={styles.titleCentral}>AUDIENCIA DE CONCILIACIÓN</Text>
        <Text style={styles.expText}>EXP. {data.expediente}</Text>

        <Text style={styles.parrafo}>
          TEPIC, NAYARIT; {data.fechaDocumentoCorta}, EN LAS OFICINAS QUE OCUPA LA COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO; LA DOCTORA AMÉRICA IVONNE GAMEROS ORTIZ, TITULAR DE LA UNIDAD DE CONCILIACIÓN, Y LA LICENCIADA ROSA GLORIA AGUILAR SARTIAGUÍN, AUXILIAR JURÍDICO DE LA UNIDAD DE CONCILIACIÓN, SIENDO LAS {data.horaInicio} HORAS, SE DECLARA ABIERTA LA AUDIENCIA DE CONCILIACIÓN SEÑALADA CON ANTICIPACIÓN Y PREVIA NOTIFICACIÓN A LAS PARTES TAL Y COMO OBRA EN EL EXPEDIENTE. HACIÉNDOSE CONSTAR EN ESTE ACTO LA PRESENCIA DE LAS PARTES {data.tituloUsuario} {data.nombreUsuario}, {data.sustantivoUsuario} DE SERVICIOS MÉDICOS, {data.medicoNombre}, {data.prestadorSustantivo} DE SERVICIO MÉDICO, MISMOS QUE SE ENCUENTRAN PLENAMENTE IDENTIFICADAS. EN RAZÓN A LO ANTERIOR LAS PARTES SE RECONOCEN LA PERSONALIDAD CON LA QUE COMPARECEN, PARA TODO EL EFECTO LEGALES. SE DECLARA ABIERTA LA AUDIENCIA DE CONCILIACIÓN.
        </Text>

        <Text style={styles.parrafo}>
          ACTO CONTINUO, LA DOCTORA AMÉRICA IVONNE GAMEROS ORTIZ, TITULAR DE LA UNIDAD DE CONCILIACIÓN, LES HACE SABER A LAS PARTES EN QUE CONSISTE EL PROCEDIMIENTO DE CONCILIACIÓN Y EL DEL ARBITRAJE Y LOS REQUISITOS PARA QUE ESTE SE EFECTUE, LOS ALCANCES QUE TIENE EL MISMO Y ESPECÍFICAMENTE EL OBJETO DE ESTA PRIMERA FASE DE CONCILIACIÓN Y SUS EFECTOS, PARA LO CUAL UNA VEZ ENTERADAS LAS PARTES SE LES INVITA A DIRIMIR SUS CONTROVERSIAS CONDUCIÉNDOSE CON LA VERDAD DURANTE Y HASTA LA CONCLUSIÓN DE LA CONTROVERSIA.
        </Text>

        <Text style={styles.parrafo}>
          EL PERSONAL DEL DEPARTAMENTO DE CONCILIACIÓN DRA. AMÉRICA IVONNE GAMEROS ORTIZ Y LIC. ROSA GLORIA AGUILAR SARTIAGUÍN, DAN LECTURA PREVIAMENTE A LA QUEJA PRESENTADA POR LA C. {data.nombreUsuario}, ASÍ COMO LAS PRETENSIONES POR PARTE DE ÉSTE EN LA QUEJA DE CUENTA, ASÍ COMO EL RESUMEN DE LA ATENCIÓN BRINDADA POR {data.elLaMedico} {data.prestadorSustantivo} DEL SERVICIO {data.medicoNombre}, UNA VEZ EXPUESTO LO ANTERIOR SE LES CONCEDE LA VOZ A LAS PARTES PARA QUE EN CONCIENCIA Y LIBRES EN SU VOLUNTAD LLEGUEN A UN ACUERDO CONCILIATORIO EN BENEFICIO DE AMBAS PARTES.
        </Text>

        <Text style={styles.parrafo}>
          ACTO CONTINUO LA DRA. AMÉRICA IVONNE GAMEROS ORTIZ DA INICIO A LA AUDIENCIA.
        </Text>

        <Text style={styles.parrafo}>
          EN EL USO DE LA VOZ {data.elLaUsuario} {data.nombreUsuario}, {data.sustantivoUsuario} DE SERVICIO MÉDICO SEÑALA QUE.
        </Text>

        <Text style={styles.parrafo}>
          {data.elLaMedico}, {data.prestadorSustantivo} DE SERVICIO MÉDICO, MANIFIESTA
        </Text>

        <Text style={styles.parrafo}>
          EN EL USO DE LA VOZ {data.elLaUsuario} DE SERVICIO MÉDICO RATIFICA SU ESCRITO DE QUEJA Y SU PRETENSIÓN.
        </Text>

        <Text style={styles.parrafo}>
          POR SU PARTE EL PERSONAL DE ESTA COMISIÓN, EXPLICA A LAS PARTES, RESPECTO DE LOS ALCANCES JURÍDICOS DE LA CONCILIACIÓN Y ESPECIALMENTE SE LE HACE SABER AL USUARIO DE SERVICIO MÉDICO QUE AL CELEBRARSE EL CONVENIO DE TRANSACCIÓN EN LOS TÉRMINOS Y CONDICIONES QUE VOLUNTARIAMENTE ACEPTAN LAS PARTES, ESTO IMPLICA QUE AMBAS DAN POR TERMINADA LA CONTROVERSIA, DESDE EL PUNTO DE VISTA CIVIL SIN LA POSIBILIDAD DE PODER INTERPONER ALGUNA OTRA QUEJA O DEMANDA ANTE AUTORIDADES JURISDICCIONALES DEL RAMO CIVIL POR LOS MISMOS HECHOS.
        </Text>

        <Text style={styles.parrafo}>
          LAS PARTES POR SU PROPIA VOLUNTAD Y POR CONSIDERAR LA EXISTENCIA DE LOS ELEMENTOS NECESARIOS PARA DAR POR CONCILIADA LA PRESENTE QUEJA, CELEBRAN EL SIGUIENTE CONVENIO DE TRANSACCIÓN EN TÉRMINOS DEL ARTÍCULO 2315, 2316, 2324 Y DEMÁS RELATIVOS DEL CÓDIGO CIVIL PARA EL ESTADO DE NAYARIT VIGENTE, AL TENOR DE LA SIGUIENTE:
        </Text>

        <Text style={styles.clausulaTitle}>CLÁUSULA:</Text>
        
        {data.clausulas.map((c, idx) => (
          <Text key={idx} style={styles.clausulaBlock}>
            <Text style={styles.bold}>{c.titulo}. - </Text>{c.texto}
          </Text>
        ))}

        <Text style={styles.parrafo}>
          TODA VEZ QUE, A LA FIRMA DEL PRESENTE CONVENIO DE TRANSACCIÓN, HAN QUEDADO SATISFECHAS LAS PRETENSIONES RECLAMADAS POR LA C. {data.nombreUsuario}, {data.sustantivoUsuario} DEL SERVICIO MÉDICO, SE DA POR CONCLUIDA LA QUEJA EN TÉRMINOS DEL ARTÍCULO 2315, 2316, 2324 Y DEMÁS RELATIVOS DEL CÓDIGO CIVIL PARA EL ESTADO DE NAYARIT VIGENTE.
        </Text>

        <Text style={styles.parrafo}>
          POR LO ANTES EXPUESTO Y CON FUNDAMENTO EN LO DISPUESTO POR LOS ARTÍCULOS 1, 2, 3, 4, 5, 9, 14, 15, 16, 25 Y 29 DEL DECRETO DE CREACIÓN DE LA COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO PARA EL ESTADO DE NAYARIT, EL PUBLICADO EN EL PERIÓDICO OFICIAL # 49 DE FECHA 16 DE DICIEMBRE DEL AÑO 2000; ARTÍCULOS 1, 2 FRACCIÓN XVIII, 8, 11, 14, 34, 38, 46, 66, 67, 68 Y 69 DEL REGLAMENTO DE PROCEDIMIENTOS PARA LA ATENCIÓN DE QUEJAS MÉDICAS Y GESTIÓN PERICIAL DE LA CECAMED ESTA UNIDAD DE CONCILIACIÓN.
        </Text>

        <Text style={styles.clausulaTitle}>ACUERDA:</Text>

        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>PRIMERO. - </Text>TÉNGASE POR RECONOCIDA LA PERSONALIDAD ENTRE LAS PARTES CON LA QUE SE OSTENTAN LAS PARTES PARA TODOS LOS EFECTOS LEGALES.
        </Text>
        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>SEGUNDO. - </Text>TÉNGASE POR CONCILIADA LA PRESENTE QUEJA A TRAVÉS DEL CONVENIO DE TRANSACCIÓN MISMA QUE FORMA PARTE DE ESTA ACTA DE AUDIENCIA CELEBRADO EN LOS TÉRMINOS Y CONDICIONES ACORDADOS POR LAS PARTES.
        </Text>
        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>TERCERO. - </Text>AGRÉGUESE AL EXPEDIENTE LA COPIA DEL CONVENIO DE TRANSACCIÓN CELEBRADO POR LAS PARTES PARA SU DEBIDA CONSTANCIA LEGAL, ENVÍESE EL EXPEDIENTE AL ARCHIVO COMO ASUNTO DEBIDAMENTE CONCLUIDO EN TÉRMINO DEL ARTÍCULO 67 DEL REGLAMENTO DE PROCEDIMIENTOS PARA LA ATENCIÓN DE QUEJAS MÉDICAS Y GESTIÓN PERICIAL DE LA CECAMED.
        </Text>
        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>CUARTO. - </Text>ESTA COMISIÓN ESTATAL CONTRIBUYÓ EN TODO MOMENTO PARA LA SOLUCIÓN DEL CONFLICTO SIN PRONUNCIARSE EN CUANTO AL FONDO DEL ASUNTO, SOLAMENTE PARA EFECTOS CONCILIATORIOS POR INTERVENIR EN UNA ETAPA AUTO COMPOSITIVA.
        </Text>

        <Text style={styles.parrafo}>
          SE CIERRA LA PRESENTE A LAS {data.horaFin} HORAS DEL DÍA DE SU INICIO, FIRMANDO EN UNIÓN DE LOS TESTIGOS QUE DAN FE DEL ACTO PARA CONSTANCIA PREVIA LECTURA QUE SE DIO AL DOCUMENTO.
        </Text>

        <View style={styles.firmasSeccion}>
          <View style={styles.firmaBlock}>
            <Text style={styles.firmaNombre}>{data.tituloUsuario} {data.nombreUsuario}</Text>
            <Text style={styles.firmaCargo}>{data.sustantivoUsuario} DEL SERVICIO MÉDICO.</Text>
          </View>

          <View style={styles.firmaBlock}>
            <Text style={styles.firmaNombre}>{data.medicoNombre}</Text>
            <Text style={styles.firmaCargo}>{data.prestadorSustantivo} DE SERVICIOS MÉDICO</Text>
          </View>

          <Text style={styles.firmaTituloCentral}>POR LA COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO.</Text>

          <View style={styles.firmaBlock} wrap={false}>
            <Text style={styles.firmaNombre}>DRA. AMÉRICA IVONNE GAMEROS ORTIZ</Text>
            <Text style={styles.firmaCargo}>TITULAR DE LA UNIDAD DE CONCILIACIÓN</Text>
          </View>

          <View style={styles.firmaBlock} wrap={false}>
            <Text style={styles.firmaNombre}>LICDA. ROSA GLORIA AGUILAR SARTIAGUÍN</Text>
            <Text style={styles.firmaCargo}>AUXILIAR JURÍDICA DE LA UNIDAD DE CONCILIACIÓN</Text>
          </View>

          <Text style={styles.firmaTituloCentral}>TESTIGO</Text>
          <View style={styles.firmaBlock} wrap={false}>
            <Text style={styles.firmaNombre}>{data.nombreTestigo}</Text>
          </View>
        </View>

        <PDFFooter tipo="conciliacion" fixed />
      </Page>
    </Document>
  );
};

export default DocumentoAudienciaConciliacion;