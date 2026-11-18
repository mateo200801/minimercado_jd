const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor logistico operando correctamente',
    timestamp: new Date().toISOString()
  });
});

// (Parte superior de tu app.js actual...)
const rutasAPI = require('./routes/indexRoutes'); // <--- AÑADE ESTA LÍNEA ARRIBA

// ...tus app.use globales...

// Rutas de la API (tu healthcheck actual)
app.get('/api/health', (req, res) => { /* tu código actual */ });

// 👇 AÑADE ESTA LÍNEA PARA INTEGRAR LAS FASES 4, 5 Y 6
app.use('/api', rutasAPI);

// Middleware para rutas no encontradas (404)
app.use(notFound);

// Middleware global para manejo de errores
app.use(errorHandler);

module.exports = app;

// Middleware para rutas no encontradas (404) - Debe ir ANTES de errorHandler
app.use(notFound);

// Middleware global para manejo de errores - Debe ser el ÚLTIMO app.use()
app.use(errorHandler);

module.exports = app;