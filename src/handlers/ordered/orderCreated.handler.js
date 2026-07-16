/* eslint-disable camelcase */

const dashboardRepo = require('../../repositories/dashboardRepository');
const enrichment = require('../../services/enrichmentService');

async function handle(event) {
  const { payload, event_timestamp: eventTimestamp } = event;

  await dashboardRepo.insertOrderMaster({
    id_orden: payload.id_orden,
    total: payload.total,
    fecha: payload.fecha,
    event_timestamp: eventTimestamp,
  });

  for (const sub of payload.sub_ordenes || []) {
    const vendorName = await enrichment.getVendorName(sub.id_vendedor);

    const subOrder = await dashboardRepo.insertSubOrder({
      id_orden: payload.id_orden,
      vendor_id: sub.id_vendedor,
      vendor_name: vendorName,
      monto: sub.monto,
      status: 1,
    });

    const items = sub.items || [];
    const totalQty = items.reduce((sum, item) => sum + item.cantidad, 0);

    for (const item of items) {
      const info = await enrichment.getProductInfo(sub.id_vendedor, item.id_producto);
      const itemRevenue = totalQty > 0 ? (item.cantidad / totalQty) * sub.monto : 0;

      await dashboardRepo.insertOrderItem({
        sub_order_id: subOrder.id,
        product_id: item.id_producto,
        product_name: info.product_name,
        category: info.category,
        quantity: item.cantidad,
        revenue: Math.round(itemRevenue * 100) / 100,
      });
    }
  }
}

module.exports = { handle };
