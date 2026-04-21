const { google } = require('googleapis');
const path = require('path');
const { Readable } = require('stream');

// Autenticación reutilizando Service Account
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../../config/serviceAccountKey.json'),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Busca una carpeta por nombre dentro de una carpeta padre.
 */
const findFolder = async (folderName, parentId) => {
  const response = await drive.files.list({
    q: `name = '${folderName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  });
  return response.data.files[0] || null;
};

/**
 * Crea una carpeta nueva.
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
 * Sube el archivo al destino final.
 */
const uploadFile = async (fileObject, folderId) => {
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
  return response.data;
};

module.exports = { findFolder, createFolder, uploadFile };