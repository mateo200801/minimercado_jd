
const db = require('./src/config/db'); // O ajusta la ruta si tu archivo de conexión está en otra parte

async function consultarProductos() {
    try {
        // Hacemos una consulta SELECT a tu tabla de productos
        const [rows] = await db.query('SELECT * FROM productos');
        
        console.log('📦 Productos encontrados en tu base de datos de MySQL Workbench:');
        console.table(rows); // Esto imprime los datos en formato de tablita en la consola
        
    } catch (error) {
        console.error('❌ Error al consultar los productos:', error.message);
    } finally {
        process.exit();
    }
}

consultarProductos();