// src/controllers/pedidoController.js
const { asignarRecursosLogistica } = require('../services/logisticaService');

const crearPedido = async (req, res, next) => {
    try {
        const { clienteLat, clienteLon, productos } = req.body;

        // Ejecutamos el algoritmo de la Fase 6
        const datosLogistica = await asignarRecursosLogistica(clienteLat, clienteLon);

        // NOTA: Aquí insertarías el pedido en tu tabla MySQL guardando bodegaId y repartidorId

        res.status(201).json({
            success: true,
            message: 'Pedido recibido y asignado por logística',
            datosEnvio: datosLogistica
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { crearPedido };