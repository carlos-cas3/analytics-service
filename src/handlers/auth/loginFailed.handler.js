const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const date = event.event_timestamp.slice(0, 10);
  await metricsRepository.incrementDailyMetric(date, 'login_failed_count', 1);
}

module.exports = { handle };
