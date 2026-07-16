const dashboardRepo = require('../../repositories/dashboardRepository');

async function handle(event) {
  const { payload } = event;

  await dashboardRepo.upsertTicket({
    id_ticket: payload.id_ticket,
    id_orden_maestra: payload.id_orden_maestra,
    tipo_solicitud: payload.tipo_solicitud,
    motivo: payload.motivo,
    fecha: payload.fecha,
    items_count: payload.items_count,
  });
}

module.exports = { handle };
