// frontend/src/pages/Register.jsx
import { useState } from 'react';

export default function Register({ onVolverLogin }) {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idRol, setIdRol] = useState('2'); // Por defecto Empleado / Cajero (ej: id_rol 2)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Registrando usuario...', tipo: 'info' });

    try {
      const res = await fetch('http://localhost:4000/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),          // Ej: "Mateo Madrid" (El backend genera el usuario "mateo_madrid")
          contrasena: contrasena,
          id_rol: parseInt(idRol)         // 1 para Admin, 2 para Empleado
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMensaje({ 
          texto: `¡Registro exitoso! Tu usuario generado es: "${data.usuarioGenerado}". Ya puedes iniciar sesión.`, 
          tipo: 'success' 
        });
        // Limpiar formulario
        setNombre('');
        setContrasena('');
      } else {
        setMensaje({ texto: `Error: ${data.message || 'No se pudo registrar'}`, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión con el servidor backend', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f3b58', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '30px 40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', width: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0', color: '#1f3b58' }}>Minimercado JD</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Registro de Nuevo Usuario</span>
        </div>

        {mensaje.texto && (
          <div style={{ 
            backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : mensaje.tipo === 'error' ? '#fee2e2' : '#e2e3e5', 
            color: mensaje.tipo === 'success' ? '#155724' : mensaje.tipo === 'error' ? '#991b1b' : '#383d41', 
            padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px' 
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nombre Completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Usuario"
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
            <small style={{ color: '#64748b', fontSize: '11px' }}>El sistema creará tu usuario automáticamente (ej: mateo_madrid).</small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rol</label>
            <select
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: 'white' }}
            >
              <option value="1">Administrador</option>
              <option value="2">Cajero / Empleado</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '10px' }}>
            Registrar Cuenta
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            onClick={onVolverLogin} 
            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
          >
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}