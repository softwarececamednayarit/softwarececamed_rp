import React from 'react';
import { SECCIONES_CONFIG } from '../../utils/pdfConfigs';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader'; 
import { PDFFooter } from './PDFFooter';

const styles = StyleSheet.create({
  page: {
    paddingTop: '45mm', // Espacio para el header
    paddingBottom: '48mm', // Espacio para el footer
    paddingHorizontal: '15mm', // Tus márgenes laterales originales
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  sectionContainer: {
    marginBottom: '5mm', // Espaciado entre secciones
  },
  sectionTitleBox: {
    backgroundColor: '#B4B4B4', // (180, 180, 180)
    paddingVertical: '1.5mm',
    marginBottom: '2mm',
  },
  sectionTitleText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#323232', // (50, 50, 50)
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    minHeight: '6mm',
    alignItems: 'center',
    paddingVertical: '1mm',
  },
  
  col1Label: { width: '19%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#282828', textTransform: 'uppercase' },
  col1Value: { width: '36%', fontSize: 9, color: '#282828', textTransform: 'uppercase' },
  col2Label: { width: '19%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#282828', textTransform: 'uppercase' },
  col2Value: { width: '26%', fontSize: 9, color: '#282828', textTransform: 'uppercase' },
  colFullValue: { width: '81%', fontSize: 9, color: '#282828', textTransform: 'uppercase' },
  
  // Bloque de firmas
  firmasContainer: {
    marginTop: '15mm',
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
  },
  firmaLinea: {
    fontSize: 9,
    color: '#141414',
    marginBottom: '2mm',
  },
  firmaTexto: {
    fontSize: 9,
    color: '#141414',
    textAlign: 'center',
    lineHeight: 1.2,
  }
});

const DocumentoActa = ({ expP, tipoAsunto }) => {
  const esQueja = tipoAsunto.includes('QUEJA');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const tipoFooter = esQueja ? 'queja' : 'orientacion';

  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />
        
        {/* ITERACIÓN DE SECCIONES DINÁMICAS */}
        {Object.values(SECCIONES_CONFIG).map((seccion, index) => {
          // Evaluar condición
          if (seccion.condicion && !seccion.condicion(expP)) return null;

          // Detectar si la sección tiene al menos una fila con 2 columnas (Mixta)
          const esSeccionMixta = seccion.filas.some(fila => fila.length > 1);

          return (
            // wrap={false} asegura que si la sección no cabe, baje COMPLETA a la siguiente hoja
            // en lugar de dejar el título gris huérfano al final de la página.
            <View key={index} style={styles.sectionContainer} wrap={false}>
              
              {/* Título de la sección */}
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitleText}>{seccion.titulo}</Text>
              </View>

              {/* Filas de la sección */}
              {seccion.filas.map((fila, filaIdx) => (
                <View key={filaIdx} style={styles.tableRow}>
                  {fila.length === 1 ? (
                    <>
                      <Text style={styles.col1Label}>{fila[0].label}</Text>
                      {/* Lógica condicional: Si es mixta, topa al 36% y baja de renglón. Si es fila única, toma todo el ancho */}
                      <Text style={esSeccionMixta ? styles.col1Value : styles.colFullValue}>
                        {expP[fila[0].key] || ''}
                      </Text> 
                    </>
                  ) : (
                    <>
                      <Text style={styles.col1Label}>{fila[0].label}</Text>
                      <Text style={styles.col1Value}>{expP[fila[0].key] || ''}</Text>
                      <Text style={styles.col2Label}>{fila[1].label}</Text>
                      <Text style={styles.col2Value}>{expP[fila[1].key] || ''}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* SECCIÓN DE FIRMAS */}
        <View style={styles.firmasContainer} wrap={false}>
          {/* Titular y Auxiliar */}
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
          
          {/* Usuario / Representante */}
          <View style={styles.firmaCenter}>
            <Text style={styles.firmaLinea}>___________________________________</Text>
            <Text style={styles.firmaTexto}>FIRMA DEL USUARIO / REPRESENTANTE</Text>
          </View>
        </View>

        <PDFFooter tipo={tipoFooter} />
      </Page>
    </Document>
  );
};

export default DocumentoActa;