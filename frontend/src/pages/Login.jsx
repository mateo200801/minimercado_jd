import { useState, useEffect } from 'react';

export default function Login({ onLogin }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/usuarios')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.usuarios) {
          setUsuarios(data.usuarios);
        }
      })
      .catch(err => console.error('Error al cargar usuarios:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioSeleccionado, contrasena: password })
      });

      const data = await res.json();

      if (data.success) {
        const sesion = {
          token: data.token || 'token-mysql-ok',
          usuario: {
            id_usuario: data.usuario.id_usuario || data.usuario.id,
            nombre: data.usuario.nombre,
            usuario: data.usuario.usuario,
            rol: (data.usuario.id_rol === 1 || data.usuario.rol === 'ADMIN') ? 'ADMIN' : 'CAJERO'
          }
        };
        localStorage.setItem('sesion_pos', JSON.stringify(sesion));
        onLogin(sesion);
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor backend');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f3b58', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '30px 40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', width: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0', color: '#1f3b58' }}>Minimercado JD</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Sistema Punto de Venta POS - MySQL</span>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Selecciona tu usuario</label>
            <select
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: 'white' }}
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.usuario}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}