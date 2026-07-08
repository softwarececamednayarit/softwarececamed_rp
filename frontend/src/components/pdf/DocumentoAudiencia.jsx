import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

// REGISTRO DE FUENTES (Mantenemos Tahoma para la congruencia de tus documentos)
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
    paddingHorizontal: '15mm', 
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 10, // Tamaño 10 exacto para que cuadre en una sola hoja
  },
  
  // --- CABECERA DERECHA ---
  headerRightText: {
    textAlign: 'right',
    marginBottom: '1.5mm',
    lineHeight: 1.2,
  },
  oficioText: {
    textAlign: 'right',
    marginBottom: '8mm', // Espacio equivalente al lineSpacing: 8 que tenías
    lineHeight: 1.2,
  },

  // --- DESTINATARIO ---
  destinatarioBox: {
    marginBottom: '6mm',
  },
  destinatarioText: {
    fontWeight: 'bold',
    marginBottom: '1.5mm',
    lineHeight: 1.2,
    textTransform: 'uppercase', // Solo este bloque va forzado a mayúsculas
  },
  presenteText: {
    fontWeight: 'bold',
    marginTop: '2mm',
    marginBottom: '6mm',
    textTransform: 'uppercase',
  },

  // --- CUERPO DEL OFICIO ---
  parrafo: {
    textAlign: 'justify',
    marginBottom: '3.5mm', // Tu lineSpacing: 3.5 original
    lineHeight: 1.3,
  },
  despedida: {
    textAlign: 'justify',
    marginBottom: '10mm',
    lineHeight: 1.3,
  },

  // --- FIRMAS ---
  firmaContainer: {
    marginTop: '5mm',
    alignItems: 'center',
    width: '100%',
  },
  atentamente: {
    fontWeight: 'bold',
    marginBottom: '15mm', // Espacio para la firma física
    textAlign: 'center',
  },
  titularNombre: {
    fontWeight: 'bold',
    marginBottom: '1.5mm',
    textAlign: 'center',
  },
  titularCargo: {
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // --- COPIAS ---
  copiasBox: {
    marginTop: '10mm', // Lo empujamos hacia abajo
  },
  copiasText: {
    fontSize: 7, // Letra pequeñita como lo pediste
    lineHeight: 1.2,
    marginBottom: '1mm',
  }
});

const DocumentoAudiencia = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />

        {/* CABECERA DERECHA */}
        <View>
          <Text style={styles.headerRightText}>SERVICIO MÉDICO</Text>
          <Text style={styles.headerRightText}>Tepic, Nayarit; {data.fechaDocumento}</Text>
          <Text style={styles.oficioText}>{data.nombreOficio}</Text>
        </View>

        {/* DESTINATARIO */}
        <View style={styles.destinatarioBox} wrap={false}>
          <Text style={styles.destinatarioText}>{data.medicoNombre}</Text>
          <Text style={styles.destinatarioText}>DOMICILIO. {data.domicilio.calleNum}</Text>
          <Text style={styles.destinatarioText}>COL. {data.domicilio.colonia}</Text>
          <Text style={styles.destinatarioText}>{data.domicilio.municipioEstado}.</Text>
          <Text style={styles.presenteText}>P R E S E N T E.</Text>
        </View>

        {/* CUERPO DEL OFICIO */}
        <Text style={styles.parrafo}>
          Por este medio se le hace de su conocimiento, que con fecha {data.fechaQueja}, {data.articuloGenero} {data.nombreUsuario} de Servicio Médico presentó una queja con motivo de la Atención Médica proporcionada por Usted, por lo que se le invita a comparecer a esta H. Comisión Estatal de Conciliación y Arbitraje Médico, misma que se encuentra ubicada en calle Av. Jacarandas 204 Sur, Colonia San Juan, Tepic, Nayarit, {data.fechaHoraAudiencia}, con la finalidad de llevar a cabo una AUDIENCIA INFORMATIVA respecto de la Queja, de las atribuciones y procedimientos de la CECAMED y en su momento exprese voluntariamente si es su interés aceptar someterse al procedimiento arbitral de nuestra Institución, para tal efecto solicito a Usted tenga a bien presentarse con una copia de su identificación oficial, copia de su cedula profesional.
        </Text>

        <Text style={styles.parrafo}>
          No omito manifestarle a Usted que entre las ventajas de que el procedimiento sea llevado ante esta Comisión Estatal, se encuentran entre otras, el trámite es personal, confidencial, gratuito, no requiere aseguranza, no interviene Autoridad Judicial y la solución es a corto plazo.
        </Text>

        <Text style={styles.parrafo}>
          Así mismo anexamos a la presente, en sobre cerrado con efectos de notificación personal, copia con firmas originales de la queja presentada ante esta Comisión Estatal por {data.articuloGenero} {data.nombreUsuario}, {data.sustantivoUsuario} de Servicio Médico.
        </Text>

        <Text style={styles.parrafo}>
          Lo anterior con fundamento en lo dispuesto por el artículo 9 fracción II del Decreto Número 8292 de Creación de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit, publicado en el periódico oficial número 49 de fecha 16 de Diciembre de 2000, así como de los artículos 18 fracción X y 24 fracción III párrafo del Reglamento Interno para el Funcionamiento de la misma, y en los numerales 26, 55 y 56 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la CECAMED.
        </Text>

        <Text style={styles.despedida}>
          Sin otro particular por el momento, quedo de Usted a sus apreciables órdenes.
        </Text>

        {/* FIRMAS */}
        <View style={styles.firmaContainer} wrap={false}>
          <Text style={styles.atentamente}>A T E N T A M E N T E</Text>
          <Text style={styles.titularNombre}>{data.titularConciliacion}</Text>
          <Text style={styles.titularCargo}>JEFE DE LA UNIDAD DE CONCILIACIÓN</Text>
        </View>

        {/* COPIAS */}
        <View style={styles.copiasBox} wrap={false}>
          <Text style={styles.copiasText}>Rgas.</Text>
          <Text style={styles.copiasText}>Minutario</Text>
          <Text style={styles.copiasText}>Archivo.</Text>
        </View>

        <PDFFooter tipo="orientacion" />
      </Page>
    </Document>
  );
};

export default DocumentoAudiencia;