import React, { useState, useEffect } from 'react';

export default function CorteCaja() {
    const sesion = JSON.parse(localStorage.getItem('sesion_pos')) || { usuario: { rol: 'CAJERO' } };
    const esAdmin = sesion.usuario.rol.toUpperCase() === 'ADMIN';

    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [cajeroSeleccionado, setCajeroSeleccionado] = useState('');
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [datosCorte, setDatosCorte] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (esAdmin) {
            fetch('http://localhost:4000/api/usuarios')
                .then(res => res.json())
                .then(data => { if (data.success) setListaUsuarios(data.usuarios); })
                .catch(err => console.error(err));
        }
    }, [esAdmin]);

    const generarCorte = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                fechaInicio, fechaFin, ...(cajeroSeleccionado ? { id_cajero: cajeroSeleccionado } : {})
            });
            const res = await fetch(`http://localhost:4000/api/corte/detalle?${queryParams}`);
            const data = await res.json();
            if (data.success) setDatosCorte(data.corte);
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (!esAdmin) return <div style={{ padding: '30px' }}><div style={{ background: '#fee2e2', color: '#dc2626', padding: '20px', borderRadius: '8px', fontWeight: 'bold' }}>⚠️ Solo el Administrador puede ver cortes.</div></div>;

    return (
        <div style={{ fontFamily: 'Segoe UI, sans-serif', padding: '30px', boxSizing: 'border-box', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                <h2 style={{ marginTop: 0, color: '#1e293b' }}>📊 Centro de Informes Financieros</h2>
                <form onSubmit={generarCorte} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end', marginTop: '20px' }}>
                    <div>
                        <label style={labelStyle}>Cajero:</label>
                        <select value={cajeroSeleccionado} onChange={(e) => setCajeroSeleccionado(e.target.value)} style={inputStyle}>
                            <option value="">-- Todos los cajeros --</option>
                            {listaUsuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Desde:</label>
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Hasta:</label>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={inputStyle} required />
                    </div>
                    <button type="submit" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {loading ? 'Consultando...' : 'Generar Reporte'}
                    </button>
                </form>
            </div>

            {datosCorte && (
                <div>
                    {/* TARJETAS DE RESUMEN */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                        <div style={{...cardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}>
                            <div style={cardTitle}>INGRESOS BRUTOS</div>
                            <div style={cardAmount}>${parseFloat(datosCorte.ventasTotales).toFixed(2)}</div>
                        </div>
                        <div style={{...cardStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                            <div style={cardTitle}>UTILIDAD NETA (GANANCIA)</div>
                            <div style={cardAmount}>${parseFloat(datosCorte.gananciaTotal).toFixed(2)}</div>
                        </div>
                        <div style={{...cardStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                            <div style={cardTitle}>COBRADO EN EFECTIVO</div>
                            <div style={cardAmount}>${parseFloat(datosCorte.efectivo).toFixed(2)}</div>
                        </div>
                        <div style={{...cardStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'}}>
                            <div style={cardTitle}>COBRADO POR TRANSFERENCIA</div>
                            <div style={cardAmount}>${parseFloat(datosCorte.transferencia).toFixed(2)}</div>
                        </div>
                    </div>

                    {/* TABLA DE PRODUCTOS VENDIDOS */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '15px' }}>🛒 Detalle de Productos Vendidos</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                    <th style={thStyle}>PRODUCTO</th>
                                    <th style={thStyle}>CANTIDAD VENDIDA</th>
                                    <th style={thStyle}>IMPORTE TOTAL</th>
                                    <th style={thStyle}>ATENDIDO POR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosCorte.productosVendidos && datosCorte.productosVendidos.length > 0 ? (
                                    datosCorte.productosVendidos.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1e293b' }}>{item.producto}</td>
                                            <td style={tdStyle}>
                                                <span style={{ background: '#ebf8ff', color: '#007bff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                    {item.cantidad_total} unidades
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 'bold' }}>
                                                ${parseFloat(item.importe_total).toFixed(2)}
                                            </td>
                                            <td style={tdStyle}>
                                                {/* Se asegura de mostrar el nombre o la etiqueta protegida por si viene nulo */}
                                                {item.cajero || 'Ex-empleado (Despedido)'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                            No hay registros de productos vendidos en este rango de fechas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#475569' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const cardStyle = { padding: '25px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const cardTitle = { fontSize: '13px', fontWeight: '700', letterSpacing: '1px', opacity: 0.9, marginBottom: '10px' };
const cardAmount = { fontSize: '32px', fontWeight: '900' };
const thStyle = { padding: '12px 15px', color: '#475569', fontSize: '13px' };
const tdStyle = { padding: '12px 15px', color: '#475569' };