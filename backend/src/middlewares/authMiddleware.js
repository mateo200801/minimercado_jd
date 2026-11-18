// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const protegerRuta = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('No autorizado, falta token');
        error.statusCode = 401;
        return next(error); // Usa tu errorHandler
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto_desarrollo');
        req.usuario = decodificado;
        next();
    } catch (error) {
        error.message = 'Token inválido o expirado';
        error.statusCode = 401;
        next(error);
    }
};

module.exports = { protegerRuta };