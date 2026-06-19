const supabase = require('../config/supabase');

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
