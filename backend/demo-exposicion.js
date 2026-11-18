const db = require('./src/config/db'); // Asegúrate de que apunte a tu conexión

async function ejecutarDemoExposicion() {
    try {
        console.log('--- 🚀 INICIANDO DEMOSTRACIÓN DEL MÓDULO DE PRODUCTOS ---');

        // 1. Demostrar la Interacción con la BD y el Registro (INSERT)
        console.log('\n1️⃣ Registrando un nuevo producto en la base de datos...');
        const nuevoProducto = {
            codigo_barras: '7709999999999',
            descripcion: 'Café Sello Rojo 500g',
            id_categoria: 1, // Abarrotes
            costo_unitario: 8000.00,
            precio_venta: 10500.00,
            stock_actual: 25,
            stock_minimo: 5,
            es_perecedero: false
        };

        const queryInsert = `
            INSERT INTO productos (codigo_barras, descripcion, id_categoria, costo_unitario, precio_venta, stock_actual, stock_minimo, es_perecedero) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(queryInsert, [
            nuevoProducto.codigo_barras,
            nuevoProducto.descripcion,
            nuevoProducto.id_categoria,
            nuevoProducto.costo_unitario,
            nuevoProducto.precio_venta,
            nuevoProducto.stock_actual,
            nuevoProducto.stock_minimo,
            nuevoProducto.es_perecedero
        ]);
        console.log('✅ ¡Producto registrado exitosamente mediante Node.js en MySQL!');

        // 2. Demostrar Consulta Compuesta (JOIN con Categorías)
        console.log('\n2️⃣ Consultando inventario con consulta compuesta (JOIN con Categorías)...');
        const queryJoin = `
            SELECT p.id_producto, p.codigo_barras, p.descripcion, c.nombre AS categoria, 
                   p.precio_venta, p.stock_actual, p.stock_minimo 
            FROM productos p
            INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        `;
        const [productos] = await db.query(queryJoin);
        console.table(productos);

        // 3. Demostrar Restricciones (Vista de Alertas de Stock)
        console.log('\n3️⃣ Verificando restricciones y alertas de stock mínimo (Vista SQL)...');
        const [alertas] = await db.query('SELECT * FROM vista_alertas_stock');
        if (alertas.length > 0) {
            console.log('⚠️ Productos que cumplen la condición de stock bajo:');
            console.table(alertas);
        } else {
            console.log('✨ Todo el stock está por encima del mínimo.');
        }

    } catch (error) {
        console.error('❌ Error en la ejecución:', error.message);
    } finally {
        process.exit();
    }
}

ejecutarDemoExposicion();