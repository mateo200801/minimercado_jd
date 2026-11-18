const db = require('../config/db'); // Conexión a tu MySQL Workbench

// 1. Registrar una venta, guardar sus detalles y descontar stock en MySQL
const registrarVenta = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Recibimos los datos que manda el frontend (carrito, totales, cajero, método)
        const { numero_factura, id_cajero, metodo_pago, subtotal, total, monto_recibido, devuelta, carrito } = req.body;

        if (!carrito || carrito.length === 0) {
            await connection.release();
            return res.status(400).json({ success: false, message: 'El carrito de venta está vacío' });
        }

        // Validación estricta: si no llega el id_cajero, detenemos la venta para evitar valores por defecto erróneos
        if (!id_cajero) {
            await connection.release();
            return res.status(400).json({ success: false, message: 'Error: No se detectó el ID del cajero en sesión' });
        }

        // Generar número de factura automático si no viene incluido
        const folioFactura = numero_factura || 'FAC-' + Date.now();

        // Insertar la venta principal en la tabla 'ventas' de MySQL usando el id_cajero exacto
        const [ventaResult] = await connection.query(
            `INSERT INTO ventas (numero_factura, id_cajero, metodo_pago, subtotal, total, monto_recibido, devuelta, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETADA')`,
            [folioFactura, id_cajero, metodo_pago || 'Efectivo', subtotal || total, total, monto_recibido || total, devuelta || 0]
        );

        const idVentaGenerado = ventaResult.insertId;

        // Recorrer el carrito para insertar cada producto en 'detalle_ventas' y descontar stock
        for (let item of carrito) {
            await connection.query(
                `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [idVentaGenerado, item.id_producto, item.cantidad, item.precio_venta, item.subtotal]
            );

            // Descontar el stock actual del producto directamente en MySQL
            await connection.query(
                `UPDATE productos SET stock_actual = stock_actual - ? WHERE id_producto = ?`,
                [item.cantidad, item.id_producto]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            success: true, 
            message: 'Venta registrada con éxito y stock actualizado en MySQL',
            ticket: { idVenta: idVentaGenerado, total }
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error al registrar venta en MySQL:", error);
        next(error);
    }
};

// 2. Obtener el historial de ventas directamente desde las tablas de MySQL
const obtenerVentas = async (req, res, next) => {
    try {
        const [ventas] = await db.query(`
            SELECT 
                v.id_venta AS idVenta, 
                v.numero_factura, 
                v.fecha_hora AS fecha, 
                v.total, 
                v.metodo_pago AS metodo,
                v.total AS pagoCon,
                0 AS cambio,
                COALESCE(v.estado, 'COMPLETADA') AS estado,
                COALESCE(u.nombre, 'Ex-empleado (Despedido)') AS cajero
            FROM ventas v
            LEFT JOIN usuarios u ON v.id_cajero = u.id_usuario
            ORDER BY v.fecha_hora DESC
        `);

        // Recorrer cada venta para traer sus artículos
        for (let venta of ventas) {
            const [detalles] = await db.query(`
                SELECT dv.cantidad, p.descripcion, dv.subtotal AS importe, dv.precio_unitario
                FROM detalle_ventas dv
                JOIN productos p ON dv.id_producto = p.id_producto
                WHERE dv.id_venta = ?
            `, [venta.idVenta]);
            
            venta.items = detalles;
        }

        res.json({ success: true, ventas });
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        next(error);
    }
};

// 3. Cancelar una venta y devolver el stock a las tablas de MySQL
const cancelarVenta = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        const { idVenta } = req.params;
        
        // Verificar si la venta existe
        const [ventaRows] = await connection.query('SELECT * FROM ventas WHERE id_venta = ?', [idVenta]);
        if (ventaRows.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Venta no encontrada en MySQL' });
        }

        const venta = ventaRows[0];
        if (venta.estado === 'CANCELADA' || venta.estado === 'Anulada') {
            connection.release();
            return res.status(400).json({ success: false, message: 'La venta ya estaba cancelada' });
        }

        await connection.beginTransaction();

        // Obtener los productos y cantidades de esa venta para devolverlos al inventario
        const [detalles] = await connection.query('SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = ?', [idVenta]);

        for (let item of detalles) {
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        // Marcar la venta como cancelada en MySQL
        await connection.query("UPDATE ventas SET estado = 'CANCELADA' WHERE id_venta = ?", [idVenta]);

        await connection.commit();
        connection.release();

        res.json({ success: true, message: 'Venta cancelada y stock devuelto exitosamente en MySQL' });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error al cancelar venta:", error);
        next(error);
    }
};

module.exports = { registrarVenta, obtenerVentas, cancelarVenta };