import { useState } from 'react';
import Login from './pages/Login';
import PuntoDeVenta from './pages/PuntoDeVenta';
import Inventario from './pages/Inventario';
import HistorialVentas from './pages/HistorialVentas';
import CorteCaja from './pages/CorteCaja';
import GestionPersonal from './pages/GestionPersonal'; // <-- 1. Importado correctamente

export default function App() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [vistaActual, setVistaActual] = useState('pos');

  // Si NO hay sesión activa, pantalla de Login exclusivamente (sin registro público)
  if (!sesionActiva) {
    return (
      <div style={{ background: '#1f3b58', minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ width: '100%', maxWidth: '450px', padding: '20px', boxSizing: 'border-box' }}>
          <Login onLogin={(sesion) => setSesionActiva(sesion)} />
        </div>
      </div>
    );
  }

  // Verificamos si el usuario actual es Administrador
  const esAdmin = sesionActiva.usuario.rol && sesionActiva.usuario.rol.toUpperCase() === 'ADMIN';

  // Interfaz Principal POS Fija
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Menú Lateral Fijo */}
      <div style={{ width: '260px', minWidth: '260px', background: '#1f3b58', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', height: '100vh' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>Minimercado JD</h3>
        <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '25px', borderBottom: '1px solid #2c5282', paddingBottom: '10px' }}>
          👤 {sesionActiva.usuario.nombre} <br/>
          <span style={{ fontSize: '11px', background: '#2c5282', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
            Rol: {sesionActiva.usuario.rol}
          </span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setVistaActual('pos')} style={btnMenuStyle(vistaActual === 'pos')}>🛒 Punto de Venta</button>
          <button onClick={() => setVistaActual('inventario')} style={btnMenuStyle(vistaActual === 'inventario')}>📦 Inventario y Modificar</button>
          <button onClick={() => setVistaActual('historial')} style={btnMenuStyle(vistaActual === 'historial')}>📜 Historial de Ventas</button>
          <button onClick={() => setVistaActual('corte')} style={btnMenuStyle(vistaActual === 'corte')}>💰 Corte de Caja</button>

          {/* Botón de Gestión de Personal visible EXCLUSIVAMENTE para administradores */}
          {esAdmin && (
            <button onClick={() => setVistaActual('personal')} style={btnMenuStyle(vistaActual === 'personal')}>
              👥 Gestión de Personal
            </button>
          )}
        </div>

        <div>
          <button 
            onClick={() => setSesionActiva(null)} 
            style={{ width: '100%', padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Área de Trabajo Flexible */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', background: '#eef2f5' }}>
        {vistaActual === 'pos' && <PuntoDeVenta />}
        {vistaActual === 'inventario' && <Inventario />}
        {vistaActual === 'historial' && <HistorialVentas />}
        {vistaActual === 'corte' && <CorteCaja />}
        {vistaActual === 'personal' && <GestionPersonal />}
      </div>

    </div>
  );
}

const btnMenuStyle = (activo) => ({
  width: '100%', 
  textAlign: 'left', 
  padding: '12px 15px', 
  background: activo ? '#007bff' : 'transparent', 
  color: 'white', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer', 
  fontSize: '14px', 
  fontWeight: 'bold'
});