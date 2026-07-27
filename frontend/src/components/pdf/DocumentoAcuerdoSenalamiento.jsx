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
  
  headerRight: {
    alignItems: 'flex-end',
    marginBottom: '8mm',
  },
  headerTextRight: {
    fontWeight: 'bold',
    marginBottom: '1mm',
  },

  destinatarioBlock: {
    marginBottom: '8mm',
  },
  destinatarioText: {
    fontWeight: 'bold',
    marginBottom: '1mm',
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
  },
  notifiqueseText: {
    fontWeight: 'bold',
    marginBottom: '6mm',
  },
  
  atentamente: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2, 
    marginTop: '10mm',
    marginBottom: '20mm',
  },
  firmaContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: '15mm',
  },
  firmaNombre: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  firmaCargo: {
    fontWeight: 'bold',
    textAlign: 'center',
  },

  copiasBlock: {
    fontSize: 8,
    flexDirection: 'row',
  },
  copiasLeftCol: {
    width: '12%',
  },
  copiasRightCol: {
    width: '88%',
  }
});

const DocumentoAcuerdoSenalamiento = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader fixed />

        <View style={styles.headerRight}>
          <Text style={styles.headerTextRight}>EXPEDIENTE {data.expediente}</Text>
          <Text style={styles.headerTextRight}>Tepic, Nayarit; {data.fechaCorta}</Text>
          <Text style={styles.headerTextRight}>OFICIO No. {data.noOficio}</Text>
        </View>

        <View style={styles.destinatarioBlock}>
          <Text style={styles.destinatarioText}>C. {data.usuarioNombre}</Text>
          <Text style={styles.destinatarioText}>CALLE. {data.usuarioDomicilio}</Text>
          <Text style={styles.destinatarioText}>COLONIA. - {data.usuarioColonia}</Text>
          <Text style={styles.destinatarioText}>{data.usuarioCiudad}</Text>
          <Text style={styles.destinatarioText}>P R E S E N T E.</Text>
        </View>

        <Text style={styles.parrafo}>
          Con relación al expediente de queja radicado en esta Comisión Estatal de Arbitraje Médico, bajo el número de expediente al margen indicado me permito hacer de su conocimiento el acuerdo recaído que a la letra dice:
        </Text>

        <Text style={[styles.parrafo, styles.bold]}>
          TEPIC, NAYARIT; A {data.fechaJuridica}.
        </Text>

        <Text style={styles.parrafo}>
          Visto el estado que guarda la presente queja, la Doctora América Ivonne Gameros Ortiz, Titular de la Unidad de Conciliación y la Licenciada Rosa Gloria Aguilar Sartiaguín, Auxiliar Jurídica de la Unidad de Conciliación, hacemos constar que con fecha {data.fechaContestacionStr}, se recibió en la oficialía de partes de esta Comisión Estatal de Conciliación y Arbitraje Médico escrito de contestación de Queja signado por el Prestador del Servicio Médico <Text style={styles.bold}>{data.medicoNombre}</Text>, el cual presenta contestación de la queja, un historial clínico y consentimiento bajo información.
        </Text>

        <Text style={styles.parrafo}>
          Por lo expuesto y con fundamento en los numerales 60 y 61 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit; esta Unidad de Conciliación emite el siguiente:
        </Text>

        <Text style={styles.acuerdoTitle}>ACUERDO.</Text>

        <Text style={styles.parrafo}>
          Por recibido el escrito de contestación de queja presentado en la oficialía de partes de esta Comisión Estatal por el Prestador del Servicio médico, por lo que se agregan a los autos del presente expediente para que surtan los efectos legales correspondientes, en virtud de lo anterior se tiene a bien señalar las <Text style={styles.bold}>{data.fechaCitatorioStr}</Text> para que se lleve a cabo <Text style={styles.bold}>la Audiencia de Conciliación entre las partes</Text>, sito en Av. Jacarandas 204, Colonia San Juan de esta Ciudad de Tepic Nayarit.
        </Text>

        <Text style={styles.notifiqueseText}>NOTIFIQUESE A LAS PARTES.</Text>

        <Text style={styles.parrafo}>
          Sin otro particular por el momento, quedo de Usted a sus apreciables órdenes.
        </Text>

        <Text style={styles.atentamente}>A T E N T A M E N T E</Text>

        <View style={styles.firmaContainer} wrap={false}>
          <Text style={styles.firmaNombre}>DRA. AMERICA IVONNE GAMEROS ORTIZ</Text>
          <Text style={styles.firmaCargo}>JEFA DE LA UNIDAD DE ORIENTACIÓN</Text>
        </View>

        <View style={styles.copiasBlock} wrap={false}>
          <View style={styles.copiasLeftCol}>
            <Text>Rgas.</Text>
            <Text>C.c.p.-</Text>
          </View>
          <View style={styles.copiasRightCol}>
            <Text>Minutario</Text>
            <Text>Archivo.</Text>
          </View>
        </View>

        <PDFFooter tipo="conciliacion" fixed />
      </Page>
    </Document>
  );
};

export default DocumentoAcuerdoSenalamiento;