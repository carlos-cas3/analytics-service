const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const date = event.event_timestamp.slice(0, 10);
  const month = `${date.slice(0, 7)}-01`;

  await metricsRepository.incrementDailyMetric(date, 'new_vendors', 1);
  await metricsRepository.incrementMonthlyMetric(month, 'total_vendors', 1);
}

module.exports = { handle };
