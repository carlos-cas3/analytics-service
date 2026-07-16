const dashboardRepo = require('../../repositories/dashboardRepository');

async function handle(event) {
  const { payload } = event;

  const subOrder = await dashboardRepo.findSubOrder(payload.id_orden_maestra, payload.id_vendedor);
  if (!subOrder) {
    console.log(`[SKIP] ORDER_STATUS_CHANGED: sub_order not found for order ${payload.id_orden_maestra}, vendor ${payload.id_vendedor}`);
    return;
  }

  await dashboardRepo.insertStatusHistory({
    sub_order_id: subOrder.id,
    status_anterior: payload.estado_anterior,
    status_nuevo: payload.estado_nuevo,
    fecha: payload.fecha,
  });

  await dashboardRepo.updateSubOrderStatus(
    payload.id_orden_maestra,
    payload.id_vendedor,
    payload.estado_nuevo,
  );
}

module.exports = { handle };
