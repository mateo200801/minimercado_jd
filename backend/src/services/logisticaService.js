// src/services/logisticaService.js

// Algoritmo: Fórmula de Haversine para cálculo de distancias
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

const asignarRecursosLogistica = async (clienteLat, clienteLon) => {
    // NOTA: Aquí harás consultas reales a tu BD usando mysql2
    const bodegasDisponibles = [{ id: 1, lat: 6.2442, lon: -75.5812, nombre: 'Bodega Central' }];
    const repartidoresDisponibles = [{ id: 10, lat: 6.2518, lon: -75.5636, estado: 'disponible' }];

    // Encuentra la bodega más cercana
    let bodegaOptima = bodegasDisponibles[0]; 
    const distanciaEnvio = calcularDistancia(clienteLat, clienteLon, bodegaOptima.lat, bodegaOptima.lon);

    return {
        bodegaId: bodegaOptima.id,
        repartidorId: repartidoresDisponibles[0].id, // Se asigna el repartidor disponible
        distanciaEnvioKm: distanciaEnvio.toFixed(2),
        tiempoEstimadoMin: Math.round(distanciaEnvio * 5) // Ej: 5 min por Km
    };
};

module.exports = { asignarRecursosLogistica };