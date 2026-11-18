const db = require('../config/db');

// Obtener la lista completa de usuarios
const obtenerUsuarios = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id_usuario, u.nombre, u.usuario, u.id_rol,
                   CASE WHEN u.id_rol = 1 THEN 'ADMIN' ELSE 'CAJERO' END AS rol 
            FROM usuarios u
        `);
        res.json({ success: true, usuarios: rows });
    } catch (error) {
        next(error);
    }
};

// Iniciar sesión (Login seguro)
const login = async (req, res, next) => {
    try {
        const { usuario, password, contrasena } = req.body;
        const passIngresada = password || contrasena;

        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.usuario, u.contrasena, u.id_rol,
                    CASE WHEN u.id_rol = 1 THEN 'ADMIN' ELSE 'CAJERO' END AS rol 
             FROM usuarios u 
             WHERE u.usuario = ?`, 
            [usuario]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const user = rows[0];

        if (String(user.contrasena).trim() !== String(passIngresada).trim()) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        res.json({
            success: true,
            token: 'token-mysql-ok',
            usuario: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                usuario: user.usuario,
                rol: user.rol,
                id_rol: user.id_rol
            }
        });
    } catch (error) {
        next(error);
    }
};

// Contratar un nuevo cajero (Desde el panel de Administrador)
const crearUsuario = async (req, res, next) => {
    try {
        const { nombre, usuario, contrasena, id_rol } = req.body;
        
        const nombreUsuarioGenerado = usuario || nombre.toLowerCase().trim().replace(/\s+/g, '_');
        
        const [existente] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [nombreUsuarioGenerado]);
        if (existente.length > 0) {
            return res.json({ success: false, message: 'El nombre de usuario ya está en uso.' });
        }

        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, usuario, contrasena, id_rol) VALUES (?, ?, ?, ?)',
            [nombre, nombreUsuarioGenerado, contrasena, id_rol || 2]
        );
        
        res.status(201).json({ success: true, message: 'Cajero contratado con éxito', id: resultado.insertId });
    } catch (error) {
        console.error("Error al contratar usuario:", error);
        next(error);
    }
};

// Despedir / Eliminar un cajero manteniendo sus ventas en el historial
const eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id == 1) {
            return res.json({ success: false, message: 'No se puede eliminar al Administrador principal.' });
        }

        // Si tu base de datos tiene ON DELETE SET NULL, esto borrará al usuario 
        // pero sus ventas en la tabla 'ventas' no se borran, solo su id_cajero pasará a NULL
        await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

        res.json({ success: true, message: 'Personal despedido correctamente. Su historial de ventas se ha conservado.' });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        next(error);
    }
};

// Modificar / Actualizar usuario o contraseña
const actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, usuario, contrasena, id_rol } = req.body;

        if (contrasena && contrasena.trim() !== '') {
            // Si colocaron contraseña nueva, la actualizamos también
            await db.query(
                'UPDATE usuarios SET nombre = ?, usuario = ?, contrasena = ?, id_rol = ? WHERE id_usuario = ?',
                [nombre, usuario, contrasena, id_rol, id]
            );
        } else {
            // Si dejaron la contraseña vacía, actualizamos los datos sin tocar la contraseña
            await db.query(
                'UPDATE usuarios SET nombre = ?, usuario = ?, id_rol = ? WHERE id_usuario = ?',
                [nombre, usuario, id_rol, id]
            );
        }

        res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        next(error);
    }
};

module.exports = {
    obtenerUsuarios,
    login,
    crearUsuario,
    eliminarUsuario,
    actualizarUsuario
};