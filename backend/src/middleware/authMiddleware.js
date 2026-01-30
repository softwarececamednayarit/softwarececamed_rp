// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

const verifyToken = (req, res, next) => {
  // 1. Buscamos el token en los headers
  const authHeader = req.headers['authorization'];
  
  // El formato estándar es "Bearer <token>"
  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  // Separamos "Bearer" del token real
  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Formato de token inválido.' });
  }

  try {
    // 2. Verificamos si la firma es válida usando nuestra CLAVE SECRETA
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // 3. Guardamos los datos del usuario en la request para usarlos en el controlador si hace falta
    req.user = decoded; 
    
    // 4. ¡Pase usted!
    next(); 

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = verifyToken;