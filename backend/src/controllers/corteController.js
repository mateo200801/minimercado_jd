const db = require('../config/db');

const obtenerCorteDetallado = async (req, res, next) => {
    try {
        const { fechaInicio, fechaFin, id_cajero } = req.query;
        const hoy = new Date().toISOString().split('T')[0];
        
        // Definimos las fechas de inicio y fin obligatoriamente
        const inicio = fechaInicio || hoy;
        const fin = fechaFin || hoy;

        // 1. Consulta de totales principales filtrada estrictamente por fecha
        let queryVentas = `
            SELECT 
                COUNT(*) AS cantidadVentas,
                COALESCE(SUM(total), 0) AS ventasTotales,
                COALESCE(SUM(CASE 
                    WHEN LOWER(metodo_pago) = 'efectivo' THEN total 
                    WHEN LOWER(metodo_pago) = 'mixto' THEN total / 2 
                    ELSE 0 
                END), 0) AS efectivo,
                COALESCE(SUM(CASE 
                    WHEN LOWER(metodo_pago) = 'transferencia' THEN total 
                    WHEN LOWER(metodo_pago) = 'mixto' THEN total / 2 
                    ELSE 0 
                END), 0) AS transferencia
            FROM ventas
            WHERE DATE(fecha_hora) BETWEEN ? AND ?
        `;
        let params = [inicio, fin];

        if (id_cajero && id_cajero !== '' && id_cajero !== 'undefined' && id_cajero !== 'null') {
            queryVentas += ' AND id_cajero = ?';
            params.push(id_cajero);
        }
        const [rowsVentas] = await db.query(queryVentas, params);

        // 2. Ganancia estimada filtrada estrictamente por fecha
        let queryGanancia = `
            SELECT COALESCE(SUM((dv.precio_unitario - p.costo_unitario) * dv.cantidad), 0) AS gananciaTotal
            FROM detalle_ventas dv
            JOIN ventas v ON dv.id_venta = v.id_venta
            JOIN productos p ON dv.id_producto = p.id_producto
            WHERE DATE(v.fecha_hora) BETWEEN ? AND ?
        `;
        let paramsGanancia = [inicio, fin];
        if (id_cajero && id_cajero !== '' && id_cajero !== 'undefined' && id_cajero !== 'null') {
            queryGanancia += ' AND v.id_cajero = ?';
            paramsGanancia.push(id_cajero);
        }
        const [rowsGanancia] = await db.query(queryGanancia, paramsGanancia);

        // 3. Consulta de productos vendidos con respaldo para ex-empleados
        let queryProductosVendidos = `
            SELECT 
                p.descripcion AS producto,
                SUM(dv.cantidad) AS cantidad_total,
                SUM(dv.subtotal) AS importe_total,
                COALESCE(u.nombre, 'Ex-empleado (Despedido)') AS cajero
            FROM detalle_ventas dv
            JOIN ventas v ON dv.id_venta = v.id_venta
            JOIN productos p ON dv.id_producto = p.id_producto
            LEFT JOIN usuarios u ON v.id_cajero = u.id_usuario
            WHERE DATE(v.fecha_hora) BETWEEN ? AND ?
        `;
        let paramsProductos = [inicio, fin];
        if (id_cajero && id_cajero !== '' && id_cajero !== 'undefined' && id_cajero !== 'null') {
            queryProductosVendidos += ' AND v.id_cajero = ?';
            paramsProductos.push(id_cajero);
        }
        queryProductosVendidos += ' GROUP BY p.id_producto, p.descripcion, cajero ORDER BY cantidad_total DESC';
        const [rowsProductos] = await db.query(queryProductosVendidos, paramsProductos);

        res.json({
            success: true,
            corte: {
                ventasTotales: rowsVentas[0]?.ventasTotales || 0,
                efectivo: rowsVentas[0]?.efectivo || 0,
                transferencia: rowsVentas[0]?.transferencia || 0,
                cantidadVentas: rowsVentas[0]?.cantidadVentas || 0,
                gananciaTotal: rowsGanancia[0]?.gananciaTotal || 0,
                productosVendidos: rowsProductos || []
            }
        });
    } catch (error) {
        console.error("Error en corte detallado MySQL:", error);
        next(error);
    }
};

module.exports = { obtenerCorteDetallado };