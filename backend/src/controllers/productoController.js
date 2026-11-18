const db = require('../config/db');

const obtenerProductos = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json({ success: true, productos: rows });
    } catch (error) {
        next(error);
    }
};

const obtenerCategorias = async (req, res, next) => {
    try {
        // Ordenadas de forma limpia por ID ascendente
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id_categoria ASC');
        res.json({ success: true, categorias: rows });
    } catch (error) {
        next(error);
    }
};

const buscarPorCodigo = async (req, res, next) => {
    try {
        const { codigo } = req.params;
        const [rows] = await db.query('SELECT * FROM productos WHERE codigo_barras = ?', [codigo]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, producto: rows[0] });
    } catch (error) {
        next(error);
    }
};

const crearProducto = async (req, res, next) => {
    try {
        const { codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero } = req.body;
        const query = 'INSERT INTO productos (codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [resultado] = await db.query(query, [codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero || 0]);
        res.status(201).json({ success: true, message: 'Producto creado', id: resultado.insertId });
    } catch (error) {
        next(error);
    }
};

const actualizarProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero } = req.body;
        const query = 'UPDATE productos SET codigo_barras=?, descripcion=?, id_categoria=?, costo_unitario=?, precio_venta=?, stock_actual=?, stock_minimo=?, es_perecedero=? WHERE id_producto=?';
        const [resultado] = await db.query(query, [codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero || 0, id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, message: 'Producto actualizado' });
    } catch (error) {
        next(error);
    }
};

const ajustarStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cantidad_sumar } = req.body;

        if (!cantidad_sumar || isNaN(cantidad_sumar)) {
            return res.status(400).json({ success: false, message: 'Cantidad no válida' });
        }

        const query = 'UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?';
        const [resultado] = await db.query(query, [parseInt(cantidad_sumar), id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.json({ success: true, message: 'Stock actualizado correctamente en MySQL' });
    } catch (error) {
        console.error("Error al actualizar el stock:", error);
        next(error);
    }
};

const eliminarProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerProductos,
    obtenerCategorias,
    buscarPorCodigo,
    crearProducto,
    actualizarProducto,
    ajustarStock,
    eliminarProducto
};