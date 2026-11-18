// src/pages/Catalogo.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Datos simulados mientras creamos el endpoint real en el backend
    setProductos([
      { id: 1, nombre: 'Manzanas (1kg)', precio: 4500 },
      { id: 2, nombre: 'Pan de Molde', precio: 6000 },
      { id: 3, nombre: 'Leche Deslactosada', precio: 4200 }
    ]);
    
    // Más adelante usaremos esta línea para traerlos de tu base de datos:
    // axios.get('http://localhost:4000/api/productos').then(res => setProductos(res.data));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Catálogo del Minimercado</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {productos.map(producto => (
          <div key={producto.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>{producto.nombre}</h3>
            <p style={{ color: 'green', fontWeight: 'bold' }}>${producto.precio}</p>
            <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}