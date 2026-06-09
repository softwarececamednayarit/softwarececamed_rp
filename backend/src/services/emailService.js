const { google } = require('googleapis');

// Inicializamos el cliente OAuth2 con las credenciales de tu .env
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Si no lo usas, puedes omitirlo
);

// Seteamos el refresh token que ya tienes
oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Instanciamos la API de Gmail
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

/**
 * Envía un correo electrónico usando la API de Gmail.
 * @param {string} destinatario - Correo del usuario externo.
 * @param {string} asunto - Asunto del correo.
 * @param {string} contenidoHTML - El cuerpo del correo en formato HTML.
 */
const enviarCorreoNotificacion = async (destinatario, asunto, contenidoHTML) => {
  try {
    // La API de Gmail requiere que el correo esté en formato RFC 5322 y codificado en Base64 URL-safe.
    const rawMessage = [
      `To: ${destinatario}`,
      `Subject: ${asunto}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      contenidoHTML,
    ].join('\n');

    // Codificación segura para URLs
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Llamada a la API de Google
    const response = await gmail.users.messages.send({
      userId: 'me', // 'me' indica que se envíe desde la cuenta autenticada
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Correo enviado con éxito a ${destinatario}. ID: ${response.data.id}`);
    return { success: true, messageId: response.data.id };

  } catch (error) {
    console.error('Error enviando el correo:', error.message);
    throw new Error('No se pudo enviar el correo de notificación.');
  }
};

module.exports = {
  enviarCorreoNotificacion,
};