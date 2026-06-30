const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const vendorId = event.vendor_ids?.[0];
  if (!vendorId) {
    console.log(`[SKIP] ${event.event_id} vendor-service:BRANCH_STATUS_CHANGED → sin vendor_id, no se puede escribir en vendor_daily_metrics`);
    return;
  }

  const status = event.payload?.status;
  const date = event.event_timestamp.slice(0, 10);

  if (status === 'INACTIVE') {
    await metricsRepository.incrementVendorDailyMetric(vendorId, date, 'branches_count', -1);
    return;
  }

  if (status === 'ACTIVE') {
    await metricsRepository.incrementVendorDailyMetric(vendorId, date, 'branches_count', 1);
  }
}

module.exports = { handle };
