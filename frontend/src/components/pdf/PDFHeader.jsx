import React from 'react';
import { View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '43.8mm',
  },
  headerImage: {
    width: '210mm',
    height: '43.8mm',
  },
});

export const PDFHeader = () => (
  <View style={styles.headerContainer} fixed>
    <Image src="/encabezado_acta_carnet.png" style={styles.headerImage} />
  </View>
);