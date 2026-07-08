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
    paddingTop: '45mm', 
    paddingBottom: '48mm', 
    paddingHorizontal: '20mm', // Margen clásico de oficio
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 11,
  },
  
  // --- ENCABEZADOS ---
  headerTextRight: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '1.5mm',
  },
  headerBox: {
    marginBottom: '10mm',
  },
  
  // --- CUERPO ---
  parrafo: {
    textAlign: 'justify',
    lineHeight: 1.4,
    marginBottom: '6mm',
  },
  bold: {
    fontWeight: 'bold',
  },
  centerBold: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: '6mm',
  },

  // --- FIRMAS ---
  firmaContainer: {
    marginTop: '25mm',
    alignItems: 'center',
    width: '100%',
  },
  firmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  firmaBlock: {
    width: '48%',
    alignItems: 'center',
  },
  firmaLinea: {
    marginBottom: '3mm',
  },
  firmaNombre: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
    marginBottom: '1.5mm',
  },
  firmaCargo: {
    textAlign: 'center',
    fontSize: 9,
    lineHeight: 1.2,
  }
});

const DocumentoRecepcionContestacion = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />

        {/* ENCABEZADO DERECHO[cite: 2] */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTextRight}>EXPEDIENTE {data.expediente}</Text>
          <Text style={styles.headerTextRight}>TEPIC, NAYARIT; A {data.fechaDocumentoCorta}.</Text>
        </View>

        {/* PÁRRAFO 1: VISTO EL ESTADO...[cite: 2] */}
        <Text style={styles.parrafo}>
          Visto el estado que guarda la presente queja, la Doctora {data.titularConciliacion}, Titular de la Unidad de Conciliación y la Licenciada {data.auxiliarConciliacion}, Auxiliar Jurídica de la Unidad de Conciliación, hacemos constar que con fecha {data.fechaDocumentoCorta}, se recibió en la oficialía de partes de esta Comisión Estatal de Conciliación y Arbitraje Médico escrito de contestación de Queja signado por el Prestador del Servicio Médico <Text style={styles.bold}>{data.medicoNombre}</Text>, el cual presenta contestación de la Queja, {data.textoAnexos}
        </Text>

        {/* PÁRRAFO 2: FUNDAMENTO[cite: 2] */}
        <Text style={styles.parrafo}>
          Por lo expuesto y con fundamento en los numerales 60 y 61 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit; esta Unidad de Conciliación emite el siguiente:
        </Text>

        {/* TÍTULO ACUERDO[cite: 2] */}
        <Text style={styles.centerBold}>ACUERDO.</Text>

        {/* PÁRRAFO 3: RESOLUCIÓN Y CITA[cite: 2] */}
        <Text style={styles.parrafo}>
          Por recibido el escrito de contestación de queja presentado en la oficialía de partes de esta Comisión Estatal por el Prestador del Servicio médico, por lo que se agregan a los autos del presente expediente para que surtan los efectos legales correspondientes, en virtud de lo anterior se tiene a bien señalar las <Text style={styles.bold}>{data.fechaHoraAudienciaLarga}</Text> para que se lleve a cabo la Audiencia de Conciliación entre las partes, sito en Av. Jacarandas 204, Colonia San Juan de esta Ciudad de Tepic Nayarit.
        </Text>

        {/* NOTIFÍQUESE[cite: 2] */}
        <Text style={styles.centerBold}>NOTIFIQUESE A LAS PARTES.</Text>

        {/* PÁRRAFO FINAL DE FIRMAS[cite: 2] */}
        <Text style={styles.parrafo}>
          Así lo acordaron y firman la Doctora {data.titularConciliacion}, Titular de la Unidad de Conciliación y la Licenciada {data.auxiliarConciliacion}, Auxiliar Jurídica de la Unidad de conciliación.
        </Text>

        {/* BLOQUE DE FIRMAS FÍSICAS */}
        {/* <View style={styles.firmaContainer} wrap={false}>
          <View style={styles.firmasRow}>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>_______________________________________</Text>
              <Text style={styles.firmaNombre}>DRA. {data.titularConciliacion.toUpperCase()}</Text>
              <Text style={styles.firmaCargo}>TITULAR DE LA UNIDAD DE CONCILIACIÓN</Text>
            </View>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>_______________________________________</Text>
              <Text style={styles.firmaNombre}>LIC. {data.auxiliarConciliacion.toUpperCase()}</Text>
              <Text style={styles.firmaCargo}>AUXILIAR JURÍDICA DE LA UNIDAD DE CONCILIACIÓN</Text>
            </View>
          </View>
        </View> */}

        <PDFFooter tipo="conciliacion" />
      </Page>
    </Document>
  );
};

export default DocumentoRecepcionContestacion;