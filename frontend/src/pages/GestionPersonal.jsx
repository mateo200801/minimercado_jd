import React, { useState, useEffect } from 'react';

export default function GestionPersonal() {
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState({ nombre: '', usuario: '', contrasena: '', id_rol: 2 });
    const [editandoId, setEditandoId] = useState(null); // Guarda el ID del usuario que se está editando
    const [loading, setLoading] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const cargarUsuarios = () => {
        fetch('http://localhost:4000/api/usuarios')
            .then(res => res.json())
            .then(data => { 
                if (data.success) setUsuarios(data.usuarios); 
            })
            .catch(err => console.error("Error al cargar usuarios:", err));
    };

    useEffect(() => { 
        cargarUsuarios(); 
    }, []);

    // Guardar (Crear o Actualizar)
    const guardarUsuario = async (e) => {
        e.preventDefault();
        setLoading(true);

        const url = editandoId 
            ? `http://localhost:4000/api/usuarios/${editandoId}` 
            : 'http://localhost:4000/api/usuarios';
        
        const metodo = editandoId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            
            if (data.success) {
                alert(editandoId ? '¡Usuario modificado con éxito!' : '¡Personal contratado con éxito!');
                setForm({ nombre: '', usuario: '', contrasena: '', id_rol: 2 });
                setEditandoId(null);
                setMostrarFormulario(false);
                cargarUsuarios();
            } else {
                alert(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            alert('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const iniciarEdicion = (u) => {
        setEditandoId(u.id_usuario);
        setForm({
            nombre: u.nombre,
            usuario: u.usuario,
            contrasena: '', // Se deja vacía por si no desea cambiar la contraseña
            id_rol: u.id_rol
        });
        setMostrarFormulario(true);
    };

    const despedirCajero = async (id, nombre) => {
        if (window.confirm(`¿Estás seguro de despedir y eliminar del sistema a ${nombre}?`)) {
            try {
                const res = await fetch(`http://localhost:4000/api/usuarios/${id}`, { 
                    method: 'DELETE' 
                });
                const data = await res.json();
                if (data.success) {
                    alert('Personal despedido correctamente.');
                    cargarUsuarios();
                } else {
                    alert(data.message || 'No se pudo eliminar el usuario');
                }
            } catch (error) {
                alert('Error de conexión con el servidor');
            }
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>👥 Gestión de Personal</h2>

            {/* TABLA DE EMPLEADOS */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '15px' }}>📋 Personal Registrado en el Sistema</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>NOMBRE COMPLETO</th>
                            <th style={thStyle}>USUARIO</th>
                            <th style={thStyle}>ROL</th>
                            <th style={{...thStyle, textAlign: 'center'}}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id_usuario} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={tdStyle}>{u.id_usuario}</td>
                                <td style={{...tdStyle, fontWeight: 'bold', color: '#1e293b'}}>{u.nombre}</td>
                                <td style={tdStyle}>{u.usuario}</td>
                                <td style={tdStyle}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: u.id_rol === 1 ? '#dbeafe' : '#f1f5f9', color: u.id_rol === 1 ? '#1d4ed8' : '#475569', fontWeight: 'bold' }}>
                                        {u.id_rol === 1 ? 'ADMIN' : 'CAJERO'}
                                    </span>
                                </td>
                                <td style={{...tdStyle, textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => iniciarEdicion(u)} 
                                        style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        ✏️ Modificar
                                    </button>
                                    {u.id_usuario !== 1 && (
                                        <button 
                                            onClick={() => despedirCajero(u.id_usuario, u.nombre)} 
                                            style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            🗑️ Despedir
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!mostrarFormulario && (
                    <div style={{ textAlign: 'center', marginTop: '25px' }}>
                        <button 
                            onClick={() => {
                                setEditandoId(null);
                                setForm({ nombre: '', usuario: '', contrasena: '', id_rol: 2 });
                                setMostrarFormulario(true);
                            }}
                            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        >
                            ➕ Contratar Nuevo Personal (Admin o Cajero)
                        </button>
                    </div>
                )}
            </div>

            {/* FORMULARIO DE CONTRATACIÓN / EDICIÓN */}
            {mostrarFormulario && (
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', border: '2px solid #16a34a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#16a34a' }}>
                            {editandoId ? '✏️ Modificar Datos de Personal' : '➕ Formulario de Contratación'}
                        </h3>
                        <button 
                            onClick={() => { setMostrarFormulario(false); setEditandoId(null); }}
                            style={{ background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                            ✕ Cancelar
                        </button>
                    </div>
                    
                    <form onSubmit={guardarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Nombre Completo:</label>
                            <input 
                                type="text" 
                                placeholder="Ej. Carlos Pérez" 
                                value={form.nombre} 
                                onChange={e => setForm({...form, nombre: e.target.value})} 
                                required 
                                style={inputStyle} 
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Usuario de Acceso:</label>
                            <input 
                                type="text" 
                                placeholder="Ej. cperez" 
                                value={form.usuario} 
                                onChange={e => setForm({...form, usuario: e.target.value})} 
                                style={inputStyle} 
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                {editandoId ? 'Nueva Contraseña (Dejar en blanco si no se cambia):' : 'Contraseña Inicial:'}
                            </label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={form.contrasena} 
                                onChange={e => setForm({...form, contrasena: e.target.value})} 
                                required={!editandoId} 
                                style={inputStyle} 
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Rol en el Sistema:</label>
                            <select 
                                value={form.id_rol} 
                                onChange={e => setForm({...form, id_rol: parseInt(e.target.value)})}
                                style={inputStyle}
                            >
                                <option value={2}>CAJERO (Solo ventas e inventario de lectura)</option>
                                <option value={1}>ADMINISTRADOR (Acceso total, reportes y gestión)</option>
                            </select>
                        </div>

                        <button type="submit" style={{ background: '#16a34a', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                            {loading ? 'Guardando...' : (editandoId ? 'Guardar Cambios' : 'Confirmar Contratación')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#475569' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box', background: 'white' };
const thStyle = { padding: '12px 15px', color: '#475569', fontSize: '13px' };
const tdStyle = { padding: '12px 15px', color: '#475569', verticalAlign: 'middle' };