// frontend/src/utils/fileUtils.js

/**
 * Limpia acentos, caracteres especiales y espacios de un string para nombres de archivos.
 */
export const sanitizeFileName = (name) => {
  if (!name) return "";
  
  // Extraer nombre y extensión
  const lastDotIndex = name.lastIndexOf('.');
  let baseName = lastDotIndex !== -1 ? name.substring(0, lastDotIndex) : name;
  const extension = lastDotIndex !== -1 ? name.substring(lastDotIndex) : "";

  const cleanBase = baseName
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9.\-_]/g, "_") 
    .replace(/_{2,}/g, "_");

  return `${cleanBase}${extension}`;
};

/**
 * Asegura que el nombre termine en .pdf
 */
export const ensurePdfExtension = (name) => {
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
};