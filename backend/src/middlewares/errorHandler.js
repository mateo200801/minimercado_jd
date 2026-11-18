// Captura rutas no encontradas (404)
const notFound = (req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Manejador global de errores
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Error interno del servidor",
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    },
  });
};

module.exports = {
  notFound,
  errorHandler,
};