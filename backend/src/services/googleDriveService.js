const { google } = require('googleapis');
const { Readable } = require('stream');

/**
 * CONFIGURACIÓN DE AUTENTICACIÓN (OAuth2)
 * Usamos el ID de Cliente, el Secreto y el Refresh Token para actuar en nombre
 * de la cuenta institucional del CECAMED.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * ESTABLECE PERMISOS PÚBLICOS
 * Permite que cualquier persona con el enlace pueda ver el documento.
 */
const setFilePublic = async (fileId) => {
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (error) {
    console.error('Error al establecer permisos públicos:', error);
    throw error;
  }
};

/**
 * BUSCAR CARPETA
 */
const findFolder = async (folderName, parentId) => {
  const response = await drive.files.list({
    q: `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  });
  return response.data.files[0] || null;
};

/**
 * CREAR CARPETA
 */
const createFolder = async (folderName, parentId) => {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };
  const response = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });
  return response.data.id;
};

/**
 * SUBIR ARCHIVO
 * Procesa el buffer, lo sube a Drive y lo hace público.
 */
const uploadFile = async (fileObject, folderId) => {
  try {
    const bufferStream = new Readable();
    bufferStream.push(fileObject.buffer);
    bufferStream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: fileObject.originalname,
        parents: [folderId],
      },
      media: {
        mimeType: fileObject.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    // IMPORTANTE: Hacerlo público para que el link de SACRE funcione para todos
    await setFilePublic(response.data.id);

    return response.data;
  } catch (error) {
    console.error('Error en la subida a Drive (OAuth2):', error);
    throw error;
  }
};

/**
 * OBTENER STREAM DEL ARCHIVO
 */
const getFileStream = async (fileId) => {
  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener el stream del archivo:', error);
    throw error;
  }
};

/**
 * LÓGICA DE CARPETAS POR PUESTO
 */
const getOrCreateFolder = async (folderName, parentId) => {
  try {
    const folder = await findFolder(folderName, parentId);
    if (folder) return folder.id;

    console.log(`[Drive Service] Creando carpeta para el puesto: ${folderName}`);
    return await createFolder(folderName, parentId);
  } catch (error) {
    console.error("Error en getOrCreateFolder:", error);
    throw error;
  }
};

/**
 * Actualiza el nombre de un archivo en Google Drive
 */
const actualizarNombreArchivo = async (fileId, nuevoNombre) => {
  try {
    const response = await drive.files.update({
      fileId: fileId,
      resource: { name: nuevoNombre },
    });
    return response.data;
  } catch (error) {
    console.error('Error al renombrar en Drive:', error);
    throw error;
  }
};

module.exports = { 
  findFolder, 
  createFolder, 
  uploadFile, 
  getFileStream,
  getOrCreateFolder, 
  actualizarNombreArchivo
};