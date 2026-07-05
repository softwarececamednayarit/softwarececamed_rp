import React from 'react';
import { View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';

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

const avisoPrivacidadCuerpo = "Los datos personales proporcionados a la COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO PARA EL ESTADO DE NAYARIT (CECAMED) ubicada en Av. Jacarandas # 204, C.P. 63130, colonia San Juan, de esta ciudad de Tepic, Nayarit, serán protegidos conforme a lo dispuesto por los artículos 16, 17, 18, fracción I incisos a, b y c de la Ley de Protección de Datos Personales en Posesión de los Sujetos Obligados para el Estado de Nayarit, y demás normatividad aplicable. Los servicios que brinda esta institución son gratuitos en términos de su artículo 6 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit. Artículo 82 de Ley de Transparencia y Acceso a la Información Pública del Estado de Nayarit. La información confidencial que usted proporcione como usuario de los servicios que brinda la Comisión será utilizada únicamente para los efectos de una adecuada integración de su expediente de: Orientación, Asesoría, Gestión Inmediata, Queja, Conciliación o Arbitraje según sea el caso.";

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '46mm',
  },
  footerImage: {
    width: '210mm',
    height: '46mm',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Contenedor para el texto superpuesto en orientación/asesoría/conciliación
  textGroupStandard: {
    position: 'absolute',
    top: '27mm', // 278mm (original) - 251mm (base)
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textBase: {
    fontFamily: 'calibri',
    fontSize: '7pt',
    color: '#969696',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  // Contenedor para el aviso de privacidad de quejas
  textGroupQueja: {
    position: 'absolute',
    top: '25mm', // 276mm (original) - 251mm (base)
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textAvisoTitulo: {
    fontFamily: 'calibri',
    fontWeight: 'bold',
    fontSize: '5pt',
    color: '#505050',
    textAlign: 'center',
    marginBottom: '1mm',
  },
  textAvisoCuerpo: {
    fontFamily: 'calibri',
    fontSize: '5pt',
    color: '#505050',
    width: '150mm',
    textAlign: 'center',
    lineHeight: 1.15,
    textTransform: 'none', // Evita que el texto se transforme a mayúsculas
  },
});

export const PDFFooter = ({ tipo = 'orientacion' }) => {
  // Mapeo directo de textos según la unidad requerida
  const unidades = {
    orientacion: 'UNIDAD DE ORIENTACIÓN',
    conciliacion: 'UNIDAD DE CONCILIACIÓN',
  };

  return (
    <View style={styles.footerContainer} fixed>
      {/* La imagen va primero en el árbol para que actúe como fondo */}
      <Image src="/pie_acta_carnet.jpg" style={styles.footerImage} />

      {tipo === 'queja' ? (
        <View style={styles.textGroupQueja}>
          <Text style={styles.textAvisoTitulo}>AVISO DE PRIVACIDAD</Text>
          <Text style={styles.textAvisoCuerpo}>{avisoPrivacidadCuerpo}</Text>
        </View>
      ) : (
        <View style={styles.textGroupStandard}>
          <Text style={styles.textBase}>[{unidades[tipo] || unidades.orientacion}]</Text>
          <Text style={styles.textBase}>Av. Jacarandas #204, San Juan C.P 63130 Tepic, Nayarit.</Text>
          <Text style={styles.textBase}>3112103283 | 3112104276</Text>
        </View>
      )}
    </View>
  );
};