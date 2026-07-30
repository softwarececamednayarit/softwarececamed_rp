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
    fontSize: 11, 
  },
  
  titleCentral: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '4mm',
  },
  expText: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '8mm', 
  },

  parrafo: {
    textAlign: 'justify',
    lineHeight: 1.3,
    marginBottom: '6mm',
  },
  bold: {
    fontWeight: 'bold',
  },

  acuerdoTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '6mm',
    marginTop: '4mm',
  },
  clausulaBlock: {
    marginBottom: '4mm',
    textAlign: 'justify',
    lineHeight: 1.3,
  },

  // --- NUEVA DISPOSICIÓN DE FIRMAS VERTICALES ---
  firmasSeccion: {
    marginTop: '15mm',
    alignItems: 'center',
    width: '100%',
  },
  firmaBlock: {
    alignItems: 'center',
    marginBottom: '10mm', 
  },
  firmaTituloCentral: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10mm', 
    marginTop: '5mm',
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

const DocumentoAudienciaNoConciliada = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader fixed />

        <Text style={styles.titleCentral}>AUDIENCIA DE CONCILIACIÓN</Text>
        <Text style={styles.expText}>[{data.expediente}]</Text>

        <Text style={styles.parrafo}>
          Tepic, Nayarit; {data.fechaJuridica}, en las oficinas que ocupa la Comisión Estatal de Conciliación y Arbitraje Médico; la Dra. América Ivonne Gameros Ortiz, Jefa de la Unidad de Conciliación, y la Licenciada Rosa Gloria Aguilar Sartiaguín, Auxiliar Jurídico de la Unidad de Conciliación, siendo las {data.horaInicio} horas, se declara abierta la Audiencia de Conciliación señalada con anticipación y previa notificación a las partes tal y como obra en el expediente. Haciéndose constar en este acto la presencia de las partes {data.tituloUsuario} {data.nombreUsuario}, {data.sustantivoUsuario.charAt(0).toUpperCase() + data.sustantivoUsuario.slice(1)} de Servicios Médicos y {data.medicoNombre}, Prestador de Servicio Médico, mismos que se encuentran plenamente identificados. En razón a lo anterior las partes se reconocen la personalidad con la que comparecen, para todos los efectos Legales. Se declara abierta la Audiencia de Conciliación.
        </Text>

        <Text style={styles.parrafo}>
          Acto continuo, la doctora América Ivonne Gameros Ortiz, jefa de la Unidad de Conciliación, le hace saber al usuario de servicio médico en que consiste el Procedimiento de Conciliación y el del Arbitraje y los requisitos para que este se efectúe, los alcances que tiene el mismo y específicamente el objeto de esta primera fase de Conciliación y sus efectos, para lo cual una vez enteradas.
        </Text>

        <Text style={styles.parrafo}>
          {data.tituloUsuario} {data.nombreUsuario}, {data.sustantivoUsuario} de servicio médico, manifiesta {data.usuarioManifestacion}
        </Text>

        <Text style={styles.parrafo}>
          {data.articuloMedico} {data.medicoNombre}, Prestador de Servicio Médico, señala que no está de acuerdo en {data.medicoManifestacion}
        </Text>

        <Text style={styles.parrafo}>
          La Doctora, América Ivonne Gameros Ortiz, le hace del conocimiento a las partes del Arbitraje Médico que se lleva a cabo en esta institución, a lo cual las partes no aceptan llevar el arbitraje en esta Comisión.
        </Text>

        <Text style={styles.parrafo}>
          Dicho lo anterior por {data.articuloUsuario} C. {data.nombreUsuario}, {data.sustantivoUsuario} de Servicio médico, y de conformidad con el numeral 56 del Reglamento de Procedimientos para la Atención de Quejas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit; esta Unidad de Conciliación emite el siguiente <Text style={styles.bold}>ACUERDO.</Text>
        </Text>

        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>PRIMERO. - </Text>Se tiene por no conciliada la presente queja por no llegar a un acuerdo entre las partes.
        </Text>

        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>SEGUNDA. - </Text>Se le dejan los derechos a salvo al C. {data.nombreUsuario}, {data.sustantivoUsuario} de Servicio médico, a efecto de que haga valer sus pretensiones en la vía, forma y tiempo que estime pertinente.
        </Text>

        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>TERCERA. - </Text>Archívese la presente queja como asunto completamente concluida por no llegar a una conciliación.
        </Text>

        <Text style={styles.clausulaBlock}>
          <Text style={styles.bold}>CUARTA. - </Text>Ambas partes quedan plenamente notificadas de los acuerdos manifestados.
        </Text>

        <Text style={styles.parrafo}>
          Se cierra la presente a las {data.horaConclusion} horas del día de su inicio, firmando para constancia los que en ella intervinieron y pudieron hacerlo previa lectura que se dio al documento.
        </Text>

        {/* DISPOSICIÓN VERTICAL DE FIRMAS (Igual a image_ac6aba.png) */}
        <View style={styles.firmasSeccion} wrap={false}>
          
          <View style={styles.firmaBlock}>
            <Text style={styles.firmaNombre}>{data.tituloUsuario.toUpperCase()} {data.nombreUsuario.toUpperCase()}</Text>
            <Text style={styles.firmaCargo}>{data.sustantivoUsuario.toUpperCase()} DE SERVICIO MÉDICO.</Text>
          </View>

          <View style={styles.firmaBlock}>
            <Text style={styles.firmaNombre}>{data.medicoNombre.toUpperCase()}</Text>
            <Text style={styles.firmaCargo}>PRESTADOR DE SERVICIO MÉDICO</Text>
          </View>

          <Text style={styles.firmaTituloCentral}>POR LA COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO.</Text>

          <View style={styles.firmaBlock} wrap={false}>
            <Text style={styles.firmaNombre}>DRA. AMÉRICA IVONNE GAMEROS ORTIZ</Text>
            <Text style={styles.firmaCargo}>JEFA DE LA UNIDAD DE CONCILIACIÓN.</Text>
          </View>

          <View style={styles.firmaBlock} wrap={false}>
            <Text style={styles.firmaNombre}>LICDA. ROSA GLORIA AGUILAR SARTIAGUÍN</Text>
            <Text style={styles.firmaCargo}>AUXILIAR JURÍDICO</Text>
          </View>

        </View>

        <PDFFooter tipo="conciliacion" fixed />
      </Page>
    </Document>
  );
};

export default DocumentoAudienciaNoConciliada;