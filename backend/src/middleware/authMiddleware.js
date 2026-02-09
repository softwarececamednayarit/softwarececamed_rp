const jwt = require('jsonwebtoken');
// Asegúrate de que esta clave coincida con la del authController
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_dev'; 

// 1. VERIFICAR TOKEN (El que ya tenías)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Formato de token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// 2. VERIFICAR ROL ADMIN (Nuevo)
const isAdmin = (req, res, next) => {
    // req.user ya existe porque verifyToken corrió antes
    if (req.user && req.user.role === 'admin') {
        next(); // Es admin, pase usted
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
};

// IMPORTANTE: Exportamos como objeto para poder sacar los dos
module.exports = { verifyToken, isAdmin };