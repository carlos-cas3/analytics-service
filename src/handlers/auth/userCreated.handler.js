const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const date = event.event_timestamp.slice(0, 10);
  await metricsRepository.incrementDailyMetric(date, 'new_users', 1);
}

module.exports = { handle };
