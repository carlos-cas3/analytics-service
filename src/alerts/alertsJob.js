require('dotenv').config();

const supabase = require('../config/supabase');

const ALERTS_INTERVAL_MS = Number(process.env.ALERTS_INTERVAL_MS) || 300000;
const RUN_ONCE = process.argv.includes('--once');

let shuttingDown = false;

process.on('SIGINT', () => {
  console.log('[ALERTS] SIGINT recibido, terminando batch actual...');
  shuttingDown = true;
});

process.on('SIGTERM', () => {
  console.log('[ALERTS] SIGTERM recibido, terminando batch actual...');
  shuttingDown = true;
});

async function runAlerts() {
  console.log('[ALERTS] ejecutando detección de alertas...');
  const alerts = [];

  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: zeroBranchVendors, error: err1 } = await supabase
      .from('vendor_daily_metrics')
      .select('vendor_id')
      .eq('date', today)
      .eq('branches_count', 0);

    if (err1) throw err1;

    for (const row of zeroBranchVendors || []) {
      alerts.push({
        alert_type: 'ZERO_BRANCHES',
        description: `Vendor ${row.vendor_id} tiene 0 branches activas hoy`,
        severity: 'warning',
        metadata: { vendor_id: row.vendor_id, date: today },
        detected_at: new Date().toISOString(),
      });
    }

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: failedLogins, error: err2 } = await supabase
      .from('events')
      .select('aggregate_id')
      .eq('type', 'LOGIN_FAILED')
      .gte('event_timestamp', fifteenMinAgo);

    if (err2) throw err2;

    const failCounts = {};
    for (const row of failedLogins || []) {
      const key = row.aggregate_id;
      failCounts[key] = (failCounts[key] || 0) + 1;
    }

    for (const [aggregateId, count] of Object.entries(failCounts)) {
      if (count >= 5) {
        alerts.push({
          alert_type: 'BRUTE_FORCE',
          description: `${count} LOGIN_FAILED en 15 min para ${aggregateId}`,
          severity: 'critical',
          metadata: { aggregate_id: aggregateId, fail_count: count, window_minutes: 15 },
          detected_at: new Date().toISOString(),
        });
      }
    }

    if (alerts.length > 0) {
      const { error: delErr } = await supabase.from('alerts_snapshot').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) throw delErr;

      const { error: insErr } = await supabase.from('alerts_snapshot').insert(alerts);
      if (insErr) throw insErr;

      console.log(`[ALERTS] ${alerts.length} alertas actualizadas en alerts_snapshot`);
    } else {
      console.log('[ALERTS] sin alertas detectadas');
    }
  } catch (err) {
    console.log(`[ALERTS] Error: ${err.message}`);
  }
}

async function main() {
  await runAlerts();

  if (RUN_ONCE) {
    console.log('[ALERTS] modo --once completado');
    process.exit(0);
  }

  const interval = setInterval(async () => {
    if (shuttingDown) {
      clearInterval(interval);
      console.log('[ALERTS] loop terminado limpiamente');
      process.exit(0);
      return;
    }
    await runAlerts();
  }, ALERTS_INTERVAL_MS);
}

main();
