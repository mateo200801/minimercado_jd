import { useState, useEffect } from 'react';

export default function PuntoDeVenta() {
    const [busqueda, setBusqueda] = useState('');
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [mostrarModalCobro, setMostrarModalCobro] = useState(false);
    
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');
    
    // ESTADOS PARA PAGO MIXTO
    const [montoEfectivoMixto, setMontoEfectivoMixto] = useState('');
    const [montoTransferenciaMixto, setMontoTransferenciaMixto] = useState('');

    // LECTURA DE SESIÓN Y ROL
    const sesionGuardada = JSON.parse(localStorage.getItem('sesion_pos')) || {};
    const usuarioActivo = sesionGuardada.usuario || sesionGuardada;
    const idCajero = usuarioActivo.id_usuario || usuarioActivo.id || 1;
    const nombreCajero = usuarioActivo.nombre || 'Administrador';
    const esAdmin = usuarioActivo.rol && usuarioActivo.rol.toUpperCase() === 'ADMIN';

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = () => {
        fetch('http://localhost:4000/api/productos')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProductosDisponibles(data.productos);
                }
            })
            .catch(err => console.error("Error al cargar productos:", err));
    };

    const handleBusquedaChange = (e) => {
        const texto = e.target.value;
        setBusqueda(texto);

        if (texto.trim() === '') {
            setSugerencias([]);
        } else {
            const filtrados = productosDisponibles.filter(p => 
                p.descripcion.toLowerCase().includes(texto.toLowerCase()) ||
                (p.codigo_barras && p.codigo_barras.includes(texto))
            );
            setSugerencias(filtrados);
        }
    };

    const agregarAlCarrito = (prod) => {
        if (prod.stock_actual <= 0) {
            alert('¡No hay stock disponible de este producto!');
            return;
        }

        const existe = carrito.find(item => item.id_producto === prod.id_producto);
        if (existe) {
            if (existe.cantidad >= prod.stock_actual) {
                alert('No puedes agregar más de la cantidad disponible en stock.');
                return;
            }
            setCarrito(carrito.map(item => 
                item.id_producto === prod.id_producto 
                ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_venta }
                : item
            ));
        } else {
            setCarrito([...carrito, { 
                id_producto: prod.id_producto,
                codigo_barras: prod.codigo_barras || 'N/A',
                descripcion: prod.descripcion,
                precio_venta: parseFloat(prod.precio_venta),
                cantidad: 1,
                subtotal: parseFloat(prod.precio_venta),
                stock_actual: prod.stock_actual
            }]);
        }
        setBusqueda('');
        setSugerencias([]);
    };

    const cambiarCantidad = (id_producto, nuevaCantidad) => {
        const cantidadInt = parseInt(nuevaCantidad);
        if (isNaN(cantidadInt) || cantidadInt <= 0) {
            setCarrito(carrito.filter(item => item.id_producto !== id_producto));
            return;
        }

        const productoBase = productosDisponibles.find(p => p.id_producto === id_producto);
        if (productoBase && cantidadInt > productoBase.stock_actual) {
            alert(`Stock insuficiente. Solo hay ${productoBase.stock_actual} unidades disponibles.`);
            return;
        }

        setCarrito(carrito.map(item => 
            item.id_producto === id_producto 
            ? { ...item, cantidad: cantidadInt, subtotal: cantidadInt * item.precio_venta }
            : item
        ));
    };

    const totalPagar = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    const parseMonto = (valor) => parseFloat(String(valor).replace(',', '.')) || 0;
    const dineroIngresado = parseMonto(montoRecibido);
    const cambio = dineroIngresado - totalPagar;

    const confirmarCobro = async () => {
        if (carrito.length === 0) return alert('El carrito está vacío');

        // Validaciones estrictas para el pago en efectivo
        if (metodoPago === 'Efectivo') {
            if (montoRecibido === '' || isNaN(dineroIngresado)) {
                return alert('⚠️ Por favor ingresa el dinero entregado por el cliente antes de cobrar.');
            }
            if (dineroIngresado < totalPagar) {
                return alert('❌ Dinero insuficiente. El cliente debe entregar una cantidad mayor o igual al total a pagar.');
            }
        }

        let efectivoFinal = totalPagar;
        let transferenciaFinal = 0;

        if (metodoPago === 'Efectivo') {
            efectivoFinal = dineroIngresado;
        } else if (metodoPago === 'Transferencia') {
            efectivoFinal = 0;
            transferenciaFinal = totalPagar;
        } else if (metodoPago === 'Mixto') {
            efectivoFinal = parseMonto(montoEfectivoMixto);
            transferenciaFinal = parseMonto(montoTransferenciaMixto);

            if ((efectivoFinal + transferenciaFinal) < totalPagar) {
                alert("La suma del efectivo y transferencia es menor al total a pagar.");
                return;
            }
        }

        try {
            const numeroFactura = 'FAC-' + Date.now();
            const response = await fetch('http://localhost:4000/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numero_factura: numeroFactura,
                    id_cajero: idCajero,
                    metodo_pago: metodoPago,
                    monto_efectivo: efectivoFinal,
                    monto_transferencia: transferenciaFinal,
                    subtotal: totalPagar,
                    total: totalPagar,
                    monto_recibido: metodoPago === 'Mixto' ? totalPagar : dineroIngresado,
                    devuelta: metodoPago === 'Efectivo' && cambio > 0 ? cambio : 0,
                    carrito: carrito
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert('¡Venta cobrada con éxito y stock descontado en MySQL!');
                setCarrito([]);
                setMostrarModalCobro(false);
                setMontoRecibido('');
                setMontoEfectivoMixto('');
                setMontoTransferenciaMixto('');
                setMetodoPago('Efectivo');
                cargarProductos(); 
            } else {
                alert('Error al cobrar: ' + (data.message || 'Error del servidor'));
            }
        } catch (error) {
            alert('Error de conexión con el servidor');
        }
    };

    return (
        <div style={{ fontFamily: 'Segoe UI, sans-serif', background: '#eef2f5', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <div style={{ background: '#1f3b58', color: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>🛒 Punto de Venta - Minimercado JD</h2>
                <span style={{ fontSize: '14px', background: '#2c5282', padding: '5px 10px', borderRadius: '4px' }}>
                    {esAdmin ? 'Administrador:' : 'Cajero:'} <strong>{nombreCajero}</strong>
                </span>
            </div>

            {/* BUSCADOR */}
            <div style={{ padding: '15px 20px', background: 'white', margin: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold', color: '#1f3b58' }}>Buscar Producto:</label>
                    <input 
                        type="text" 
                        value={busqueda} 
                        onChange={handleBusquedaChange} 
                        placeholder="Escribe el nombre o código de barras..." 
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '15px' }} 
                    />
                </div>

                {sugerencias.length > 0 && (
                    <div style={{ position: 'absolute', top: '60px', left: '15px', right: '15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 99, maxHeight: '200px', overflowY: 'auto' }}>
                        {sugerencias.map(prod => (
                            <div 
                                key={prod.id_producto}
                                onClick={() => agregarAlCarrito(prod)}
                                style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: '#fff' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                            >
                                <span><strong>{prod.descripcion}</strong> (Código: {prod.codigo_barras})</span>
                                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>${prod.precio_venta} | Stock: {prod.stock_actual}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TABLA DEL TICKET */}
            <div style={{ flex: 1, margin: '0 15px 15px 15px', background: 'white', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ background: '#1f3b58', color: 'white', padding: '8px 15px', fontSize: '14px', fontWeight: 'bold' }}>
                    Ticket Actual de Venta
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ padding: '10px' }}>Código</th>
                                <th style={{ padding: '10px' }}>Descripción</th>
                                <th style={{ padding: '10px' }}>Precio Venta</th>
                                <th style={{ padding: '10px' }}>Cantidad</th>
                                <th style={{ padding: '10px' }}>Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carrito.length === 0 ? (
                               <tr>
                                   <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                       El carrito está vacío. Usa el buscador superior para agregar productos.
                                   </td>
                               </tr>
                            ) : (
                                carrito.map((item) => (
                                    <tr key={item.id_producto} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px' }}>{item.codigo_barras}</td>
                                        <td style={{ padding: '10px' }}>{item.descripcion}</td>
                                        <td style={{ padding: '10px' }}>${item.precio_venta.toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <button 
                                                    onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}
                                                    style={{ background: '#cbd5e1', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={item.cantidad} 
                                                    onChange={(e) => cambiarCantidad(item.id_producto, e.target.value)}
                                                    style={{ width: '50px', textAlign: 'center', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                />
                                                <button 
                                                    onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}
                                                    style={{ background: '#cbd5e1', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#28a745' }}>${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PANEL INFERIOR */}
                <div style={{ background: '#f8fafc', padding: '15px 20px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Total Artículos: <strong>{carrito.reduce((acc, i) => acc + i.cantidad, 0)}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>TOTAL A PAGAR</span>
                            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>${totalPagar.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={() => { if(carrito.length > 0) setMostrarModalCobro(true); else alert('Agrega productos primero'); }}
                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE COBRO */}
            {mostrarModalCobro && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '500px', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0, color: '#1f3b58', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Cobrar Venta</h3>
                        
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>Total a pagar:</span>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff' }}>${totalPagar.toFixed(2)}</div>
                        </div>

                        <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Método de Pago:</label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            {['Efectivo', 'Transferencia', 'Mixto'].map((metodo) => (
                                <button
                                    key={metodo}
                                    type="button"
                                    onClick={() => setMetodoPago(metodo)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: metodoPago === metodo ? '2px solid #007bff' : '1px solid #cbd5e1',
                                        background: metodoPago === metodo ? '#ebf8ff' : 'white',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        color: metodoPago === metodo ? '#007bff' : '#334155'
                                    }}
                                >
                                    {metodo}
                                </button>
                            ))}
                        </div>

                        {metodoPago === 'Efectivo' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Monto Recibido:</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={montoRecibido} 
                                    onChange={(e) => setMontoRecibido(e.target.value)} 
                                    placeholder="Dinero entregado"
                                    style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                                <div style={{ marginTop: '10px', fontSize: '16px' }}>
                                    {montoRecibido === '' ? (
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>⚠️ Ingrese el dinero entregado por el cliente</span>
                                    ) : dineroIngresado < totalPagar ? (
                                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Dinero insuficiente (Faltan ${(totalPagar - dineroIngresado).toFixed(2)})</span>
                                    ) : (
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Cambio a devolver: ${cambio.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {metodoPago === 'Mixto' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Monto en Efectivo:</label>
                                <input 
                                    type="text" 
                                    value={montoEfectivoMixto} 
                                    onChange={(e) => {
                                        let valor = e.target.value;
                                        setMontoEfectivoMixto(valor);
                                        const efectivo = parseMonto(valor);
                                        const restante = totalPagar - efectivo;
                                        setMontoTransferenciaMixto(restante > 0 ? restante.toFixed(2) : 0);
                                    }} 
                                    placeholder="Ej. 1000"
                                    style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '10px' }}
                                />
                                
                                <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Monto en Transferencia:</label>
                                <input 
                                    type="text" 
                                    value={montoTransferenciaMixto} 
                                    onChange={(e) => setMontoTransferenciaMixto(e.target.value)} 
                                    placeholder="Ej. 1500"
                                    style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button 
                                onClick={confirmarCobro} 
                                style={{ 
                                    flex: 2, 
                                    background: (metodoPago === 'Efectivo' && (montoRecibido === '' || dineroIngresado < totalPagar)) ? '#94a3b8' : '#28a745', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '12px', 
                                    borderRadius: '6px', 
                                    fontWeight: 'bold', 
                                    fontSize: '16px', 
                                    cursor: (metodoPago === 'Efectivo' && (montoRecibido === '' || dineroIngresado < totalPagar)) ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                Confirmar y Cobrar
                            </button>
                            <button onClick={() => setMostrarModalCobro(false)} style={{ flex: 1, background: '#64748b', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}