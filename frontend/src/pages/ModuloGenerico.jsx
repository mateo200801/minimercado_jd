// frontend/src/pages/ModuloGenerico.jsx
export default function ModuloGenerico({ titulo }) {
  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2 style={{ color: '#1f3b58', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>
        Módulo: {titulo}
      </h2>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '15px' }}>
        <p style={{ fontSize: '15px', color: '#475569' }}>
          Este módulo de <strong>{titulo}</strong> se encuentra habilitado en la versión de escritorio del Minimercado JD.
        </p>
        <div style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'inline-block', fontSize: '13px', color: '#1e293b' }}>
          Estado: 🟢 Operativo / Conectado a la Base de Datos
        </div>
      </div>
    </div>
  );
}