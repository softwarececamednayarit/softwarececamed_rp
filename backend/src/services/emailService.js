const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI 
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

/**
 * Envía un correo electrónico usando la API de Gmail.
 * @param {string} destinatario - Correo del usuario externo.
 * @param {string} asunto - Asunto del correo.
 * @param {string} contenidoHTML - El cuerpo del correo en formato HTML.
 */
const enviarCorreoNotificacion = async (destinatario, asunto, contenidoHTML) => {
  try {
    // Solución para acentos en el asunto: Codificación MIME explícita para UTF-8
    const asuntoCodificado = `=?utf-8?B?${Buffer.from(asunto, 'utf-8').toString('base64')}?=`;

    const rawMessage = [
      `To: ${destinatario}`,
      `Subject: ${asuntoCodificado}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      contenidoHTML,
    ].join('\n');

    // Especificar explícitamente 'utf-8' al crear el buffer del mensaje completo
    const encodedMessage = Buffer.from(rawMessage, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { success: true, messageId: response.data.id };

  } catch (error) {
    console.error('Error enviando el correo:', error.message);
    throw new Error('No se pudo enviar el correo de notificación.');
  }
};

module.exports = {
  enviarCorreoNotificacion,
};