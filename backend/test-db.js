const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        console.error('Verifica si el nombre de la BD, usuario o contraseña en tu .env son correctos.');
        return;
    }
    console.log('✅ ¡Conexión exitosa a MySQL Workbench!');
    console.log(`📦 Conectado a la base de datos: ${process.env.DB_NAME}`);
    connection.end();
});