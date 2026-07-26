import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFHeader } from './PDFHeader';
import { PDFFooter } from './PDFFooter';

// Registro de fuente estándar para todo el ecosistema
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
    paddingHorizontal: '20mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 12, 
  },
  
  // --- EXPEDIENTE ---
  expText: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '6mm', // Más pegado a la lista
  },

  // --- BLOQUE DE DATOS ---
  listContainer: {
    marginBottom: '6mm',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: '1mm', // Mucho más compacto
  },
  label: {
    width: '22%',
    fontWeight: 'bold', // Negrita como en la imagen
  },
  value: {
    width: '78%',
    textTransform: 'uppercase', 
  },

  // --- CUERPO ---
  parrafo: {
    textAlign: 'justify',
    lineHeight: 1.3, // Interlineado más cerrado
    marginBottom: '4mm', // Párrafos más juntos
  },
  bold: {
    fontWeight: 'bold',
  },
  cita: {
    textAlign: 'justify',
    lineHeight: 1.3,
    marginBottom: '4mm',
  },

  // --- FECHA Y FIRMA ---
  fechaText: {
    textAlign: 'center', // Centrado como en la imagen
    marginTop: '8mm',
    marginBottom: '20mm',
  },
  firmaContainer: {
    alignItems: 'center',
    width: '100%',
  },
  firmaLinea: {
    marginBottom: '2mm',
  },
  firmaNombre: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1mm',
  },
  firmaCargo: {
    textAlign: 'center',
  }
});

const DocumentoNoSujecion = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader />

        {/* EXPEDIENTE (Ahora va arriba) */}
        <Text style={styles.expText}>EXP. {data.expediente}</Text>

        {/* DATOS DEL MÉDICO */}
        <View style={styles.listContainer}>
          <View style={styles.listItem}><Text style={styles.label}>NOMBRE.</Text><Text style={styles.value}>{data.medicoNombre}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>DOMICILIO.</Text><Text style={styles.value}>{data.medicoDomicilio}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>COLONIA.</Text><Text style={styles.value}>{data.medicoColonia}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>CIUDAD. -</Text><Text style={styles.value}>{data.medicoCiudad}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>CEDULA. -</Text><Text style={styles.value}>{data.medicoCedula}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>TELÉFONO.</Text><Text style={styles.value}>{data.medicoTelefono}</Text></View>
        </View>

        {/* PÁRRAFO INTRODUCTORIO */}
        <Text style={styles.parrafo}>
          El <Text style={styles.bold}>C. {data.medicoNombre.toUpperCase()}</Text>, en su carácter de prestador de servicios médicos mismo que acredita con copia de cedula profesional se presentó en esta Comisión Estatal de Conciliación y Arbitraje Médico y se sirvió manifestar lo siguiente:
        </Text>

        {/* TEXTO DE MANIFESTACIÓN */}
        <Text style={styles.cita}>
          "Que una vez que he sido informado por la CECAMED de la naturaleza y alcance del procedimiento arbitral, así como de las vías existentes para la posible solución de la controversia en cuestión, me presento ante esta Comisión Manifiesto que no es mi deseo llegar a dirimir la Queja presentada por {data.tituloSenor} <Text style={styles.bold}>{data.nombreUsuario.toUpperCase()}</Text>, {data.sustantivoUsuario} de Servicio Médico, para lo cual <Text style={styles.bold}>NO ACEPTO SUJETARME AL PROCEDIMIENTO ARBITRAL DE LA CECAMED</Text>".
        </Text>

        {/* CONCLUSIÓN Y FUNDAMENTO LEGAL */}
        <Text style={styles.parrafo}>
          Por lo anterior y en el caso previsto se dejan a salvo los derechos de el quejoso para que los haga valer por la vía y forma que estime pertinente.
        </Text>

        <Text style={styles.parrafo}>
          Lo anterior con fundamento en el numeral 56 en su último párrafo del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico para el Estado de Nayarit.
        </Text>

        {/* FECHA Y FIRMA */}
        <Text style={styles.fechaText}>
          Tepic, Nayarit; {data.fechaDocumentoCorta}
        </Text>

        <View style={styles.firmaContainer} wrap={false}>
          <Text style={styles.firmaLinea}>_______________________________________</Text>
          <Text style={styles.firmaNombre}>{data.medicoNombre.toUpperCase()}</Text>
          <Text style={styles.firmaCargo}>PRESTADOR DE SERVICIO MÉDICO</Text>
        </View>

        <PDFFooter tipo="conciliacion" />
      </Page>
    </Document>
  );
};

export default DocumentoNoSujecion;