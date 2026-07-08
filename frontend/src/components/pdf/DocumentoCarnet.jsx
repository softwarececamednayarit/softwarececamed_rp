import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

// REGISTRO DE FUENTES 
Font.register({
  family: 'tahoma',
  fonts: [
    { src: '/fonts/tahoma.ttf' }, 
    { src: '/fonts/tahomabd.ttf', fontWeight: 'bold' } 
  ]
});

Font.register({
  family: 'calibri',
  fonts: [
    { src: '/fonts/calibri.ttf' },
    { src: '/fonts/calibrib.ttf', fontWeight: 'bold' }
  ]
});

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
  
  // --- TÍTULO ---
  titleMain: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#141414',
    textAlign: 'center',
    marginVertical: '6mm',
  },

  // --- TABLA CONTINUA ---
  tableContainer: {
    width: '100%',
    marginBottom: '10mm',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: '8mm',
    alignItems: 'flex-start', // Para que si el texto es muy largo, la etiqueta se quede arriba
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC', // Tu color original [220, 220, 220]
    paddingVertical: '2.5mm',
  },
  colLabel: {
    width: '28%', // Emula el ancho 50 de jsPDF
    fontWeight: 'bold',
    color: '#464646', // Tu gris elegante [70, 70, 70]
    paddingRight: '2mm',
  },
  colValue: {
    width: '72%', // Emula el ancho 130 de jsPDF
    color: '#000000',
    textAlign: 'justify',
  },

  // --- FIRMAS ---
  firmasContainer: {
    marginTop: '25mm', 
    width: '100%',
  },
  firmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '15mm',
  },
  firmaBlock: {
    width: '45%',
    alignItems: 'center',
  },
  firmaCenter: {
    alignItems: 'center',
    width: '100%',
  },
  firmaLinea: {
    color: '#000000', 
    marginBottom: '3mm',
  },
  firmaTexto: {
    fontWeight: 'bold', 
    color: '#000000', 
    textAlign: 'center',
    lineHeight: 1.2,
  }
});

const DocumentoCarnet = ({ data }) => {
  const unidadTexto = data.esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';

  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />
        
        {/* TÍTULO */}
        <Text style={styles.titleMain}>{data.tituloDocumento}</Text>

        {/* TABLA PRINCIPAL DE CONTENIDO */}
        <View style={styles.tableContainer} wrap={false}>
          {data.filasTabla.map((fila, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colLabel}>{fila.label}</Text>
              <Text style={styles.colValue}>{fila.value}</Text>
            </View>
          ))}
        </View>

        {/* SECCIÓN DE FIRMAS Estandarizada */}
        <View style={styles.firmasContainer} wrap={false}>
          <View style={styles.firmasRow}>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>___________________________________</Text>
              <Text style={styles.firmaTexto}>{`TITULAR DE LA UNIDAD DE\n${unidadTexto}`}</Text>
            </View>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>___________________________________</Text>
              <Text style={styles.firmaTexto}>{`AUXILIAR DE LA UNIDAD DE\n${unidadTexto}`}</Text>
            </View>
          </View>
          
          <View style={styles.firmaCenter}>
            <Text style={styles.firmaLinea}>___________________________________</Text>
            <Text style={styles.firmaTexto}>{`FIRMA DEL ${data.etiquetaFirmaUsuario}`}</Text>
          </View>
        </View>

        <PDFFooter tipo={data.tipoFooter} />
      </Page>
    </Document>
  );
};

export default DocumentoCarnet;