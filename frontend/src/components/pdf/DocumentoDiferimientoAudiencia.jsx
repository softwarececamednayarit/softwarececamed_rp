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
  
  titleCentral: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '4mm',
  },
  expText: {
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: '8mm', 
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
    marginBottom: '6mm',
  },

  // --- BLOQUE DE FIRMAS HÍBRIDO (Acorde a image_a023f9.png) ---
  firmasSeccion: {
    marginTop: '15mm',
    width: '100%',
  },
  // Firmas Partes (Verticales y centradas con línea)
  firmaVerticalContenedor: {
    alignItems: 'center',
    marginBottom: '15mm',
  },
  firmaLinea: {
    width: '60%', // Línea sobre el nombre
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: '2mm',
  },
  firmaNombre: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  firmaCargo: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  firmaTituloCentral: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20mm', // Espacio grande para firmar arriba de los nombres CECAMED
    marginTop: '5mm',
  },

  // Firmas CECAMED (En columnas con línea)
  firmasFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  firmaColumna: {
    width: '45%',
    alignItems: 'center',
  },
  firmaLineaColumna: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: '2mm',
  },
});

const DocumentoDiferimientoAudiencia = ({ data }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <PDFHeader fixed />

        <Text style={styles.expText}>[{data.expediente}]</Text>
        <Text style={styles.titleCentral}>AUDIENCIA DE CONCILIACIÓN</Text>

        <Text style={styles.parrafo}>
          Tepic, Nayarit; {data.fechaJuridica}, en las oficinas que ocupa la Comisión Estatal de Conciliación y Arbitraje Médico; la Doctora América Ivonne Gameros Ortiz, Jefa de la Unidad de Conciliación, y la Licenciada Rosa Gloria Aguilar Sartiaguín, Auxiliar Jurídico de la Unidad de Conciliación, siendo las {data.horaInicio}, se declara abierta la Audiencia de Conciliación señalada con anticipación y previa notificación a las partes tal y como obra en el expediente. Haciéndose constar en este acto la presencia de las partes {data.tituloUsuario} {data.nombreUsuario}, {data.sustantivoUsuario} de Servicios Médicos, y {data.medicoNombre}, Prestador de Servicio Médico, mismos que se encuentran plenamente identificados. En razón a lo anterior las partes se reconocen la personalidad con la que comparecen, para todo el efecto Legales. Se declara abierta la Audiencia de Conciliación.
        </Text>

        <Text style={styles.parrafo}>
          Acto continuo, la Doctora, América Ivonne Gameros Ortiz, jefa de la Unidad de Conciliación, le hace saber al usuario de servicio médico en que consiste el Procedimiento de Conciliación y el del Arbitraje y los requisitos para que este se efectúe, los alcances que tiene el mismo y específicamente el objeto de esta primera fase de Conciliación y sus efectos, para lo cual una vez enteradas.
        </Text>

        <Text style={styles.parrafo}>
          Acto continuo la Doctora, América Ivonne Gameros Ortiz, inicia con la lectura de la Queja y a su vez a la contestación de la misma.
        </Text>

        <Text style={styles.parrafo}>
          {data.articuloUsuario} {data.tituloUsuario} {data.nombreUsuario}, ratifica todos y cada uno de los puntos de su Queja.
        </Text>

        <Text style={styles.parrafo}>
          {data.articuloMedicoCap} {data.medicoNombre}, Prestador de Servicio Médico ratifica todos los puntos de contestación de su Queja.
        </Text>

        <Text style={styles.parrafo}>
          Ante la dificultad de encontrar solución a la negociación conciliada por ambas partes, en el uso de la voz la Doctora América Ivonne Gameros Ortiz, realiza una intervención para que las partes puedan ver de manera clara la situación y puedan llegar a una solución, volviéndoles a informar, como ya fue hecho, las ventajas y desventajas de la solución al problema en medios jurisdiccionales.
        </Text>

        <Text style={styles.parrafo}>
          {data.articuloUsuario} {data.sustantivoUsuarioMin} de servicios médicos {data.nombreUsuario}, manifiesta que {data.usuarioManifestacion}. Por lo que solicita una segunda Audiencia de Conciliación para poder llegar a un arreglo conciliatorio.
        </Text>

        <Text style={styles.parrafo}>
          En el uso de la voz {data.articuloMedicoMin} {data.medicoNombre} acepta que se señale una segunda audiencia de conciliación.
        </Text>

        <Text style={styles.parrafo}>
          Las partes acuerdan una segunda Audiencia para reconsiderar la propuesta institucional.
        </Text>

        <Text style={styles.parrafo}>
          En razón a lo anterior con base en el artículo 63 párrafo segundo y 64 del Reglamento de Procedimientos para la Atención de Quejas Médicas y Gestión Pericial de la Comisión Estatal de Conciliación y Arbitraje Médico, tiene a bien realizar el siguiente <Text style={styles.bold}>ACUERDO.</Text>
        </Text>

        <Text style={styles.parrafo}>
          <Text style={styles.bold}>ÚNICO. - </Text>Se señalan las <Text style={styles.bold}>{data.fechaCitatorioStr}</Text>, para que tenga verificativo la segunda audiencia de Conciliación acordado que ambas partes quedan plenamente notificadas de dicha fecha.
        </Text>

        <Text style={styles.parrafo}>
          Se cierra la presente a las {data.horaConclusion} del día de su inicio, firmando para constancia los que en ella intervinieron y pudieron hacerlo previa lectura que se dio al documento.
        </Text>

        {/* --- BLOQUE DE FIRMAS --- */}
        <View style={styles.firmasSeccion} wrap={false}>
          
          <View style={styles.firmaVerticalContenedor}>
            <View style={styles.firmaLinea}></View>
            <Text style={styles.firmaNombre}>{data.tituloUsuario.toUpperCase()} {data.nombreUsuario.toUpperCase()}.</Text>
            <Text style={styles.firmaCargo}>{data.sustantivoUsuario.toUpperCase()} DEL SERVICIO MÉDICO,</Text>
          </View>

          <View style={styles.firmaVerticalContenedor}>
            <View style={styles.firmaLinea}></View>
            <Text style={styles.firmaCargo}>PRESTADOR DE SERVICIO MÉDICO</Text>
            <Text style={styles.firmaNombre}>{data.medicoNombre.toUpperCase()}</Text>
          </View>

          <Text style={styles.firmaTituloCentral}>POR LA COMISIÓN ESTATAL DE CONCILIACIÓN Y ARBITRAJE MÉDICO</Text>

          <View style={styles.firmasFila}>
            <View style={styles.firmaColumna}>
              <View style={styles.firmaLineaColumna}></View>
              <Text style={styles.firmaNombre}>DRA. AMÉRICA IVONNE GAMEROS ORTIZ</Text>
              <Text style={styles.firmaCargo}>JEFE DE LA UNIDAD DE ORIENTACIÓN</Text>
            </View>
            <View style={styles.firmaColumna}>
              <View style={styles.firmaLineaColumna}></View>
              <Text style={styles.firmaNombre}>LIC. ROSA GLORIA AGUILAR SARTIAGUÍN</Text>
              <Text style={styles.firmaCargo}>AUXILIAR JURÍDICA DE LA UNIDAD DE CONCILIACIÓN.</Text>
            </View>
          </View>
        </View>

        <PDFFooter tipo="conciliacion" fixed />
      </Page>
    </Document>
  );
};

export default DocumentoDiferimientoAudiencia;