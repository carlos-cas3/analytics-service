const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const status = event.payload?.status;

  if (status === 'INACTIVE') {
    const month = `${event.event_timestamp.slice(0, 7)}-01`;
    await metricsRepository.incrementMonthlyMetric(month, 'total_vendors', -1);
  }
}

module.exports = { handle };
