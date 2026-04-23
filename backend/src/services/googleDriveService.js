const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../../config/serviceAccountKey.json'),
  scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Establece permisos de lectura para cualquier persona con el enlace.
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

const findFolder = async (folderName, parentId) => {
  const response = await drive.files.list({
    q: `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  });
  return response.data.files[0] || null;
};

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
 * Sube el archivo y lo configura como público para lectura inmediatamente.
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

    // Hacer el archivo público justo después de subirlo
    await setFilePublic(response.data.id);

    return response.data;
  } catch (error) {
    console.error('Error en la subida a Drive:', error);
    throw error;
  }
};

/**
 * Obtiene el flujo de datos del archivo para descarga directa desde el backend.
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


module.exports = { 
  findFolder, 
  createFolder, 
  uploadFile, 
  getFileStream 
};