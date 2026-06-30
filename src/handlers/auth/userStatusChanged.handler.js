const metricsRepository = require('../../repositories/metricsRepository');

async function handle(event) {
  const status = event.payload?.status;
  const previousStatus = event.payload?.previous_status;
  const date = event.event_timestamp.slice(0, 10);

  if (status === 'active' && previousStatus === 'pending') {
    await metricsRepository.incrementDailyMetric(date, 'users_approved', 1);
  } else if (status === 'rejected') {
    await metricsRepository.incrementDailyMetric(date, 'users_rejected', 1);
  }
}

module.exports = { handle };
