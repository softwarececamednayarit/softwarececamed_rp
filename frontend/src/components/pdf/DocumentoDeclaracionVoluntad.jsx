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
    paddingHorizontal: '20mm',
    backgroundColor: '#FFFFFF',
    fontFamily: 'tahoma',
    fontSize: 12, // Tahoma 12[cite: 3]
  },
  
  // --- EXPEDIENTE Y TÍTULO ---
  expText: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '8mm', 
  },
  titleBlock: {
    fontWeight: 'bold',
    marginBottom: '6mm',
  },

  // --- BLOQUE DE DATOS REPRESENTANTE ---
  listContainer: {
    marginBottom: '8mm',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: '1.5mm', 
  },
  label: {
    width: '35%', // Un poco más ancho porque las etiquetas son más largas aquí
    fontWeight: 'bold',
  },
  value: {
    width: '65%',
    textTransform: 'uppercase', 
  },

  // --- CUERPO ---
  parrafo: {
    textAlign: 'justify',
    lineHeight: 1.3, 
    marginBottom: '6mm', 
  },
  bold: {
    fontWeight: 'bold',
  },

  // --- CIERRE Y FIRMAS ---
  cierreText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '15mm', // Empuja esto hacia abajo
    marginBottom: '1.5mm',
  },
  fechaText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '25mm', // Espacio para la firma física
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
    fontWeight: 'bold', // En este doc el cargo va en negrita[cite: 3]
    textAlign: 'center',
  }
});

const DocumentoDeclaracionVoluntad = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        {/* El Header y Footer se repiten solos en la Página 2 gracias a react-pdf */}
        <PDFHeader fixed />

        {/* EXPEDIENTE[cite: 3] */}
        <Text style={styles.expText}>EXP. {data.expediente}</Text>

        {/* TÍTULO[cite: 3] */}
        <Text style={styles.titleBlock}>1.- DATOS DEL REPRESENTANTE LEGAL DEL PRESTADOR DE SERVICIO MÉDICO</Text>

        {/* DATOS DEL REPRESENTANTE[cite: 3] */}
        <View style={styles.listContainer}>
          <View style={styles.listItem}><Text style={styles.label}>NOMBRE:.</Text><Text style={styles.value}>{data.repNombre}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>DOMICILIO:.</Text><Text style={styles.value}>{data.repDomicilio}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>COLONIA:</Text><Text style={styles.value}>{data.repColonia}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>CIUDAD:.</Text><Text style={styles.value}>{data.repCiudad}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>TELÉFONO:</Text><Text style={styles.value}>{data.repTelefono}</Text></View>
          <View style={styles.listItem}><Text style={styles.label}>CEDULA PROFESIONAL:</Text><Text style={styles.value}>{data.repCedula}</Text></View>
        </View>

        {/* PÁRRAFOS DE DECLARACIÓN[cite: 3] */}
        <Text style={styles.parrafo}>
          El {data.medicoNombre.toUpperCase()}, en su carácter de prestador de servicios médicos mismo que acredita con copia de cedula profesional se presentó en esta Comisión Estatal de Conciliación y Arbitraje Médico y se sirvió manifestar lo siguiente:
        </Text>

        <Text style={styles.parrafo}>
          "Que una vez que he sido informado por la CECAMED de la naturaleza y alcance del procedimiento arbitral, así como de las vías existentes para la posible solución de la controversia en cuestión, me presento ante esta Comisión y manifiesto mi deseo de llegar a dirimir la queja presentada por {data.articuloUsuario} {data.nombreUsuario.toUpperCase()}, {data.sustantivoUsuario} de Servicio Médico, en beneficio de ambas partes, para lo cual <Text style={styles.bold}>ACEPTO SUJETARME AL PROCEDIMIENTO ARBITRAL DE LA CECAMED.</Text>
        </Text>

        <Text style={styles.parrafo}>
          Con base en lo anterior se procede a levantar la presente declaración de Voluntad por parte del Prestador del Servicio Médico para someterse al Procedimiento Arbitral de esta Comisión, para lo cual, en términos del artículo 7 párrafo segundo del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la CECAMED, se le hace saber su obligación de guardar confidencialidad sobre el presente procedimiento hasta la Resolución del mismo, a lo cual {data.articuloMedico} {data.medicoNombre.toUpperCase()}, otorga desde estos momentos su compromiso para tal efecto, con la aclaración de que en caso contrario la CECAMED procederá a declinar su conocimiento de la presente queja, dejando a salvo las acciones y derechos de las partes para que los ejerciten en la vía, forma, oportunidad y tiempo que estimen pertinente para ello.
        </Text>

        <Text style={styles.parrafo}>
          Acto continuo, se hace del conocimiento {data.alMedico} {data.medicoNombre.toUpperCase()}, que a partir de esta fecha en la que firma su aceptación del procedimiento ante la CECAMED, dispondrá de un término de (9), nueve días hábiles para que presente la siguiente documentación:
        </Text>

        <Text style={styles.parrafo}>
          Escrito que contenga resumen clínico y/o en su caso copia del expediente Clínico de la atención brindada {data.pacienteArticulo} {data.nombreUsuario.toUpperCase()}, Escrito de contestación de la queja refiriéndose a todos y cada uno de los hechos señalados los que afirme, los que niegue y los que ignore porque no le sean propios, precisando, además, en su caso, sus propuestas de arreglo.
        </Text>

        <Text style={styles.parrafo}>
          Lo anterior con fundamento en lo dispuesto por los artículos 55 al 60 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la CECAMED, en cuanto al procedimiento, según su artículo 22 se estará a lo dispuesto en el Código de Procedimientos Civiles para el estado de Nayarit.
        </Text>

        {/* CIERRE Y FIRMA (Saltará a la pag 2 naturalmente)[cite: 3] */}
        <Text style={styles.cierreText}>
          Aceptó someterse al Procedimiento Arbitral de la Cecamed.
        </Text>
        <Text style={styles.fechaText}>
          Tepic, Nayarit; {data.fechaDocumentoCorta}.
        </Text>

        <View style={styles.firmaContainer} wrap={false}>
          <Text style={styles.firmaLinea}>___________________________________________________</Text>
          <Text style={styles.firmaNombre}>{data.medicoNombre.toUpperCase()}</Text>
          <Text style={styles.firmaCargo}>PRESTADOR DE SERVICIO MÉDICO</Text>
        </View>

        <PDFFooter tipo="conciliacion" fixed />
      </Page>
    </Document>
  );
};

export default DocumentoDeclaracionVoluntad;