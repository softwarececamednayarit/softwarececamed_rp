const jwt = require('jsonwebtoken');

// Clave usada para firmar/verificar JWT. Debe venir de entorno en producción.
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

// Verifica que exista y sea válido el token Authorization: Bearer <token>
// Al éxito: añade `req.user = decoded` y llama a `next()`.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Formato de token inválido.' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // decoded contiene { id, email, role, permises }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// Middleware para rutas que requieren rol `admin`.
// Requiere que `verifyToken` ya haya corrido y dejado `req.user`.
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de Administrador.' });
};

// Exportar ambos middlewares
module.exports = { verifyToken, isAdmin };