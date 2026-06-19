const supabase = require('../config/supabase');

/**
 * Health check handler.
 *
 * Returns the current service status including uptime, environment,
 * and database connectivity. Responds with 200 when healthy or 503
 * when the database is unreachable.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with status information
 *
 * @example
 * // Response (200):
 * {
 *   "status": "ok",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "uptime": 1234.56,
 *   "environment": "production",
 *   "database": "connected"
 * }
 */
async function check(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const { error } = await supabase.from('events').select('id').limit(1);
    if (error) throw error;
    health.database = 'connected';
  } catch (err) {
    health.status = 'degraded';
    health.database = 'disconnected';
  }

  const httpStatus = health.status === 'ok' ? 200 : 503;
  return res.status(httpStatus).json(health);
}

module.exports = { check };
