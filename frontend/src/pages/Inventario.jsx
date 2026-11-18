import React, { useState, useEffect } from 'react';

export default function Inventario() {
    const sesion = JSON.parse(localStorage.getItem('sesion_pos')) || { usuario: { rol: 'CAJERO' } };
    const esAdmin = sesion.usuario.rol.toUpperCase() === 'ADMIN';

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [vistaModulo, setVistaModulo] = useState('catalogo'); 
    const [productoSelec, setProductoSelec] = useState(null);
    const [form, setForm] = useState({ 
        codigo_barras: '', 
        descripcion: '', 
        id_categoria: 1, 
        costo_unitario: '', 
        precio_venta: '', 
        stock_actual: '', 
        stock_minimo: '',
        es_perecedero: 0 
    });

    const cargarDatos = () => {
        fetch('http://localhost:4000/api/productos')
            .then(res => res.json())
            .then(data => { if (data.success) setProductos(data.productos); })
            .catch(err => console.error(err));
            
        fetch('http://localhost:4000/api/categorias')
            .then(res => res.json())
            .then(data => { if (data.success) setCategorias(data.categorias); })
            .catch(err => console.error(err));
    };

    useEffect(() => { cargarDatos(); }, []);

    // AQUÍ ESTÁ EL CAMBIO: Se agregó .sort() para ordenar alfabéticamente de la A a la Z ignorando mayúsculas/minúsculas
    const productosFiltrados = productos
        .filter(p => 
            p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || 
            p.codigo_barras.includes(busqueda)
        )
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' }));

    const guardarNuevo = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:4000/api/productos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
        alert('Producto creado con exito');
        setVistaModulo('catalogo');
        cargarDatos();
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        await fetch(`http://localhost:4000/api/productos/${productoSelec.id_producto}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
        alert('Producto actualizado con exito');
        setVistaModulo('catalogo');
        cargarDatos();
    };

    const eliminarProducto = async (id) => {
        if(window.confirm('¿Eliminar producto permanentemente?')) {
            await fetch(`http://localhost:4000/api/productos/${id}`, { method: 'DELETE' });
            cargarDatos();
        }
    };

    if ((vistaModulo === 'crear' || vistaModulo === 'editar') && esAdmin) {
        return (
            <div style={{ padding: '30px' }}>
                <button onClick={() => setVistaModulo('catalogo')} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>⬅ Volver al Catálogo</button>
                <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', margin: '0 auto' }}>
                    <h2>{vistaModulo === 'crear' ? '📦 Crear Nuevo Producto' : '✏️ Editar Producto'}</h2>
                    <form onSubmit={vistaModulo === 'crear' ? guardarNuevo : guardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" placeholder="Código de barras" value={form.codigo_barras} onChange={e => setForm({...form, codigo_barras: e.target.value})} required style={inputStyle} />
                        <input type="text" placeholder="Descripción / Nombre" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required style={inputStyle} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Categoría (MySQL):</label>
                            <select value={form.id_categoria} onChange={e => setForm({...form, id_categoria: parseInt(e.target.value)})} style={inputStyle}>
                                {categorias.map(cat => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.id_categoria} - {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="Costo Unitario" value={form.costo_unitario} onChange={e => setForm({...form, costo_unitario: e.target.value})} required style={inputStyle} />
                            <input type="number" placeholder="Precio de Venta" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} required style={inputStyle} />
                        </div>

                        {vistaModulo === 'crear' && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="number" placeholder="Stock Inicial" value={form.stock_actual} onChange={e => setForm({...form, stock_actual: e.target.value})} required style={inputStyle} />
                                <input type="number" placeholder="Stock Mínimo" value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: e.target.value})} required style={inputStyle} />
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
                            <input 
                                type="checkbox" 
                                id="es_perecedero"
                                checked={form.es_perecedero === 1} 
                                onChange={e => setForm({...form, es_perecedero: e.target.checked ? 1 : 0})} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="es_perecedero" style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>
                                ¿Es un producto perecedero?
                            </label>
                        </div>

                        <button type="submit" style={{ background: '#16a34a', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#f8fafc', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar producto por nombre o código..." 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                    style={{ width: '400px', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                />
                
                {esAdmin && (
                    <button 
                        onClick={() => { setForm({ codigo_barras: '', descripcion: '', id_categoria: 1, costo_unitario: '', precio_venta: '', stock_actual: '', stock_minimo: '', es_perecedero: 0 }); setVistaModulo('crear'); }} 
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        ➕ Nuevo Producto
                    </button>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px' }}>
                        <tr>
                            <th style={thStyle}>CÓDIGO</th>
                            <th style={thStyle}>DESCRIPCIÓN</th>
                            <th style={thStyle}>PRECIO</th>
                            <th style={thStyle}>STOCK</th>
                            {esAdmin && <th style={{...thStyle, textAlign: 'center'}}>ACCIONES</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(p => {
                            const valorStock = p.stock_actual !== undefined ? p.stock_actual : 0;
                            const minimoStock = p.stock_minimo !== undefined ? p.stock_minimo : 5;

                            return (
                                <tr key={p.id_producto} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={tdStyle}>{p.codigo_barras}</td>
                                    <td style={{...tdStyle, fontWeight: 'bold', color: '#1e293b'}}>{p.descripcion}</td>
                                    <td style={{...tdStyle, color: '#16a34a', fontWeight: 'bold'}}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            background: valorStock <= minimoStock ? '#fee2e2' : '#dcfce3', 
                                            color: valorStock <= minimoStock ? '#dc2626' : '#16a34a', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {valorStock}
                                        </span>
                                    </td>
                                    
                                    {esAdmin && (
                                        <td style={{...tdStyle, textAlign: 'center'}}>
                                            <button onClick={() => { setForm(p); setProductoSelec(p); setVistaModulo('editar'); }} style={actionBtn} title="Editar Producto">✏️</button>
                                            <button onClick={() => { 
                                                const cant = prompt(`¿Cuántas unidades nuevas vas a sumar al stock de ${p.descripcion}?`);
                                                if(cant && !isNaN(cant)) {
                                                    fetch(`http://localhost:4000/api/productos/${p.id_producto}/stock`, { 
                                                        method: 'PUT', 
                                                        headers: { 'Content-Type': 'application/json' }, 
                                                        body: JSON.stringify({ cantidad_sumar: parseInt(cant) }) 
                                                    })
                                                    .then(() => cargarDatos())
                                                    .catch(err => alert('Error al actualizar stock'));
                                                }
                                            }} style={actionBtn} title="Añadir Stock">➕</button>
                                            <button onClick={() => eliminarProducto(p.id_producto)} style={actionBtn} title="Eliminar">🗑️</button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
const thStyle = { padding: '15px', borderBottom: '2px solid #e2e8f0' };
const tdStyle = { padding: '15px', color: '#475569', fontSize: '14px' };
const actionBtn = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 5px', transition: 'transform 0.2s' };