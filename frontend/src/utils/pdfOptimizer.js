import { PDFDocument } from 'pdf-lib';

export const optimizePDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Cargamos el documento
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // 2. Creamos un nuevo documento vacío para "trasplantar" las páginas
    // Esto es clave: elimina automáticamente objetos huérfanos y basura del original.
    const optimizedDoc = await PDFDocument.create();
    
    // Copiamos todas las páginas del original al nuevo
    const pageIndices = pdfDoc.getPageIndices();
    const copiedPages = await optimizedDoc.copyPages(pdfDoc, pageIndices);
    
    copiedPages.forEach((page) => optimizedDoc.addPage(page));

    // 3. Guardamos con compresión de objetos activada
    // useObjectStreams: Junta objetos pequeños en flujos más grandes y comprimidos.
    // addDefaultMetadata: False para ahorrar bytes eliminando info del productor/herramientas.
    const pdfBytes = await optimizedDoc.save({
      useObjectStreams: true,
      addDefaultMetadata: false,
      updateFieldAppearances: false
    });

    // Retornamos un nuevo objeto File con el contenido optimizado
    return new File([pdfBytes], file.name, { type: 'application/pdf' });
  } catch (error) {
    console.error("Error al optimizar el PDF:", error);
    // Si algo falla (ej. PDF encriptado), devolvemos el original para no bloquear al usuario
    return file;
  }
};

export const generateFileHash = async (file) => {
  // 1. Convertimos el archivo a un ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // 2. Calculamos el "digest" (resumen) usando el algoritmo SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // 3. Convertimos el buffer resultante a una cadena hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
    
  return hashHex;
};