const express = require('express');
const router = express.Router();

// Importación de Controladores (Añadido actualizarUsuario aquí)
const { obtenerUsuarios, login, crearUsuario, eliminarUsuario, actualizarUsuario } = require('../controllers/authController');
const { obtenerProductos, obtenerCategorias, buscarPorCodigo, crearProducto, actualizarProducto, ajustarStock, eliminarProducto } = require('../controllers/productoController');
const { registrarVenta, obtenerVentas, cancelarVenta } = require('../controllers/ventaController');
const { obtenerCorteDetallado } = require('../controllers/corteController');

// --- Rutas de Autenticación y Gestión de Usuarios ---
router.get('/usuarios', obtenerUsuarios); 
router.get('/auth/usuarios', obtenerUsuarios); 
router.post('/auth/login', login);
// (Se eliminó la ruta pública de registro por seguridad)

// --- Rutas de Personal (Contratar, Modificar y Despedir - Exclusivo Admin) ---
router.post('/usuarios', crearUsuario);          // Contratar personal
router.delete('/usuarios/:id', eliminarUsuario); // Despedir personal por ID
router.put('/usuarios/:id', actualizarUsuario);  // Modificar personal o restablecer contraseña

// --- Rutas de Inventario y Categorías ---
router.get('/productos', obtenerProductos);
router.get('/categorias', obtenerCategorias); 
router.get('/productos/codigo/:codigo', buscarPorCodigo);
router.post('/productos', crearProducto);
router.put('/productos/:id', actualizarProducto);
router.put('/productos/:id/stock', ajustarStock);
router.delete('/productos/:id', eliminarProducto);

// --- Rutas de Ventas y Corte ---
router.post('/ventas', registrarVenta);
router.get('/ventas', obtenerVentas);
router.delete('/ventas/:idVenta', cancelarVenta); 

// --- Rutas de Corte de Caja ---
router.get('/corte', obtenerCorteDetallado);
router.get('/corte/detalle', obtenerCorteDetallado);

module.exports = router;