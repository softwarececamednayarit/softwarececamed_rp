import React from 'react';
import { SECCIONES_CONFIG } from '../../utils/pdfConfigs';
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

// ESTILOS AJUSTADOS EXACTAMENTE AL ACTA DE QUEJA
const styles = StyleSheet.create({
  page: {
    paddingTop: '45mm', 
    paddingBottom: '48mm', 
    paddingHorizontal: '15mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 11, // Regresamos al 11 original del Acta de Queja
    textTransform: 'uppercase', 
  },
  sectionContainer: {
    marginBottom: '4mm', // Mismo margen vertical que el original
  },
  sectionTitleBox: {
    backgroundColor: '#B4B4B4',
    paddingVertical: '1.5mm',
    marginBottom: '2mm',
  },
  sectionTitleText: {
    fontSize: 11,
    fontFamily: 'tahoma',
    fontWeight: 'bold',
    color: '#323232',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: '6mm',
    alignItems: 'center',
    paddingVertical: '1mm',
  },
  
  // WIDHTS RECALCULADOS PARA EVITAR EL DESBORDAMIENTO (WRAP) EN LETRA 11 BOLD
  // -> Secciones de 2 columnas (Ej: Datos del Usuario)
  tLabel: { width: '19%', fontFamily: 'tahoma', fontWeight: 'bold', color: '#000000' }, 
  tValue: { width: '37%', color: '#000000', paddingRight: '2mm' }, 
  tLabel2: { width: '18%', fontFamily: 'tahoma', fontWeight: 'bold', color: '#000000' }, // Ampliado para que quepa "NACIONALIDAD:"
  tValue2: { width: '26%', color: '#000000' }, 
  tValueFull: { width: '81%', color: '#000000' }, 
  
  // -> Secciones de 1 columna (Ej: Datos de Recepción)
  tLabelSingle: { width: '28%', fontFamily: 'tahoma', fontWeight: 'bold', color: '#000000' }, // Ampliado para "FORMA DE RECEPCIÓN:"
  tValueSingle: { width: '72%', color: '#000000' },
  
  // Bloque de firmas
  firmasContainer: {
    marginTop: '25mm',
    alignItems: 'center',
  },
  firmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
    marginBottom: '3mm',
    color: '#000000',
  },
  firmaTexto: {
    fontFamily: 'tahoma',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.3,
  }
});

const DocumentoActa = ({ expP, tipoAsunto }) => {
  const esQueja = tipoAsunto?.includes('QUEJA');
  const unidadTexto = esQueja ? 'CONCILIACIÓN' : 'ORIENTACIÓN';
  const tipoFooter = esQueja ? 'queja' : 'orientacion';

  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />
        
        {/* ITERACIÓN DE SECCIONES DINÁMICAS */}
        {Object.values(SECCIONES_CONFIG).map((seccion, index) => {
          if (seccion.condicion && !seccion.condicion(expP)) return null;

          // Si hay al menos una fila con 2 datos, toda la sección usará proporciones de 2 columnas
          const esSeccionMixta = seccion.filas.some(fila => fila.length > 1);

          return (
            <View key={index} style={styles.sectionContainer} wrap={false}>
              
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitleText}>{seccion.titulo}</Text>
              </View>

              {seccion.filas.map((fila, filaIdx) => (
                <View key={filaIdx} style={styles.tableRow}>
                  {fila.length === 1 ? (
                    <>
                      {/* Aplicamos tLabelSingle para que los textos largos de 1 sola columna no se partan */}
                      <Text style={esSeccionMixta ? styles.tLabel : styles.tLabelSingle}>
                        {fila[0].label}
                      </Text>
                      <Text style={esSeccionMixta ? styles.tValueFull : styles.tValueSingle}>
                        {expP[fila[0].key] || ''}
                      </Text> 
                    </>
                  ) : (
                    <>
                      <Text style={styles.tLabel}>{fila[0].label}</Text>
                      <Text style={styles.tValue}>{expP[fila[0].key] || ''}</Text>
                      <Text style={styles.tLabel2}>{fila[1].label}</Text>
                      <Text style={styles.tValue2}>{expP[fila[1].key] || ''}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* SECCIÓN DE FIRMAS */}
        <View style={styles.firmasContainer} wrap={false}>
          <Text style={[styles.firmaTexto, { marginBottom: '15mm' }]}>PROTESTO LO NECESARIO</Text>
          
          <View style={styles.firmasRow}>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>___________________________________________________</Text>
              <Text style={styles.firmaTexto}>{`TITULAR DE LA UNIDAD DE\n${unidadTexto}.`}</Text>
            </View>
            <View style={styles.firmaBlock}>
              <Text style={styles.firmaLinea}>___________________________________________________</Text>
              <Text style={styles.firmaTexto}>{`AUXILIAR DE LA UNIDAD DE\n${unidadTexto}.`}</Text>
            </View>
          </View>
          
          <View style={styles.firmaCenter}>
            <Text style={styles.firmaLinea}>___________________________________________________</Text>
            <Text style={styles.firmaTexto}>
              C. {expP.nombreUsuario || expP.nombre_completo || 'USUARIO / REPRESENTANTE'}
            </Text>
            <Text style={{ fontFamily: 'tahoma', marginTop: '1mm' }}>
              USUARIO DE SERVICIO MÉDICO.
            </Text>
          </View>
        </View>

        <PDFFooter tipo={tipoFooter} />
      </Page>
    </Document>
  );
};

export default DocumentoActa;