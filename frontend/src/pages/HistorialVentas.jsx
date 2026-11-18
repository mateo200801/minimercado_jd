// frontend/src/pages/HistorialVentas.jsx
import { useState, useEffect } from 'react';

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const cargarVentas = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/ventas');
      const data = await res.json();
      if (data.success) {
        setVentas(data.ventas);
        if (data.ventas.length > 0 && !ventaSeleccionada) {
          setVentaSeleccionada(data.ventas[0]);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { cargarVentas(); }, []);

  const cancelarVentaActual = async () => {
    if (!ventaSeleccionada) return;
    if (ventaSeleccionada.estado === 'CANCELADA') return alert('Esta venta ya está cancelada');
    
    if (!window.confirm(`¿Estás seguro de cancelar el ticket #${ventaSeleccionada.idVenta}? Los productos volverán al inventario.`)) return;

    try {
      const res = await fetch(`http://localhost:4000/api/ventas/${ventaSeleccionada.idVenta}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Venta cancelada con éxito');
        await cargarVentas();
        setVentaSeleccionada(data.venta);
      } else { alert(data.message); }
    } catch (err) { alert('Error de conexión'); }
  };

  // Filtrar tickets de manera segura
  const ventasFiltradas = ventas.filter(v => {
    const folioMatch = String(v.idVenta).includes(busqueda);
    const cajeroStr = v.cajero || v.nombre_cajero || '';
    const cajeroMatch = cajeroStr.toLowerCase().includes(busqueda.toLowerCase());
    return folioMatch || cajeroMatch;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 50px)', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* COLUMNA IZQUIERDA: Lista de Tickets y Buscador */}
      <div style={{ width: '450px', backgroundColor: 'white', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1f3b58' }}>HISTORIAL DE VENTAS</h3>
        <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Puedes buscar por folio o nombre del cajero:</span>

        <input 
          type="text" 
          placeholder="🔍 Buscar folio o cajero..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '15px' }}
        />

        {/* Tabla / Lista de Tickets */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, borderBottom: '1px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '8px' }}>Folio</th>
                <th style={{ padding: '8px' }}>Arts</th>
                <th style={{ padding: '8px' }}>Hora</th>
                <th style={{ padding: '8px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No hay tickets encontrados.</td></tr>
              ) : (
                ventasFiltradas.map(v => {
                  const esSeleccionado = ventaSeleccionada?.idVenta === v.idVenta;
                  // CORRECCIÓN PROTEGIDA CONTRA UNDEFINED
                  const totalArts = v.items && Array.isArray(v.items) 
                    ? v.items.reduce((acc, item) => acc + item.cantidad, 0) 
                    : 0;

                  return (
                    <tr 
                      key={v.idVenta} 
                      onClick={() => setVentaSeleccionada(v)}
                      style={{ 
                        backgroundColor: esSeleccionado ? '#dbeafe' : (v.estado === 'CANCELADA' ? '#fee2e2' : 'white'), 
                        borderBottom: '1px solid #f1f5f9', cursor: 'pointer' 
                      }}
                    >
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{v.idVenta}</td>
                      <td style={{ padding: '8px' }}>{totalArts}</td>
                      <td style={{ padding: '8px', fontSize: '11px' }}>{v.fecha}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>${Number(v.total || 0).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Filtro inferior informativo */}
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '4px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
          <div>📅 Mostrando registros del sistema</div>
          <div style={{ marginTop: '4px' }}>👤 Cajero activo: <strong>Todos</strong></div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Detalle del Ticket Seleccionado */}
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {ventaSeleccionada ? (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#1f3b58' }}>Ticket {ventaSeleccionada.idVenta}</h2>
              {ventaSeleccionada.estado === 'CANCELADA' && (
                <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px' }}>❌ TICKET CANCELADO</span>
              )}
            </div>

            <div style={{ fontSize: '14px', marginBottom: '15px', color: '#334155' }}>
              <div><strong>Cajero:</strong> {ventaSeleccionada.cajero || ventaSeleccionada.nombre_cajero || 'Ex-empleado (Despedido)'}</div>
              <div><strong>Cliente:</strong> Público en general</div>
              <div><strong>Fecha y Hora:</strong> {ventaSeleccionada.fecha}</div>
              <div><strong>Método de Pago:</strong> {ventaSeleccionada.metodo}</div>
            </div>

            {/* Tabla de artículos del ticket */}
            <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', overflowY: 'auto', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <tr>
                    <th style={{ padding: '8px' }}>Cant.</th>
                    <th style={{ padding: '8px' }}>Descripción</th>
                    <th style={{ padding: '8px' }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {ventaSeleccionada.items && Array.isArray(ventaSeleccionada.items) ? (
                    ventaSeleccionada.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.cantidad}</td>
                        <td style={{ padding: '8px' }}>{item.descripcion}</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>${Number(item.importe || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: '#64748b' }}>No hay detalles para este ticket.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales y Botones de Acción */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '15px' }}>
              <div>
                {ventaSeleccionada.estado !== 'CANCELADA' && (
                  <button 
                    onClick={cancelarVentaActual}
                    style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🗑️ Cancelar Venta (Reintegrar Stock)
                  </button>
                )}
              </div>

              <div style={{ textAlign: 'right', fontSize: '14px', color: '#334155' }}>
                <div style={{ marginBottom: '4px' }}>Pago con: <strong>${Number(ventaSeleccionada.pagoCon || 0).toLocaleString()}</strong></div>
                <div style={{ marginBottom: '4px' }}>Cambio devuelto: <strong>${Number(ventaSeleccionada.cambio || 0).toLocaleString()}</strong></div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', marginTop: '5px' }}>
                  Total: ${Number(ventaSeleccionada.total || 0).toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
            Selecciona un ticket de la izquierda para ver su detalle.
          </div>
        )}
      </div>

    </div>
  );
}