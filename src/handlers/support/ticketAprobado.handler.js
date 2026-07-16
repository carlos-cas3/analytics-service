const dashboardRepo = require('../../repositories/dashboardRepository');

async function handle(event) {
  const { payload } = event;

  await dashboardRepo.upsertTicket({
    id_ticket: payload.id_ticket,
    tipo_solicitud: payload.tipo_solicitud,
    fecha: payload.fecha,
    fecha_aprobacion: payload.fecha_aprobacion,
    status: 'approved',
  });
}

module.exports = { handle };
