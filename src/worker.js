require('dotenv').config();

const eventRepository = require('./repositories/eventRepository');
const { processEvent } = require('./services/analyticsProcessor');

const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5000;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 10;
const RUN_ONCE = process.argv.includes('--once');

let shuttingDown = false;

process.on('SIGINT', () => {
  console.log('[WORKER] SIGINT recibido, terminando batch actual...');
  shuttingDown = true;
});

process.on('SIGTERM', () => {
  console.log('[WORKER] SIGTERM recibido, terminando batch actual...');
  shuttingDown = true;
});

async function poll() {
  do {
    try {
      const events = await eventRepository.getUnprocessedBatch(BATCH_SIZE);

      if (events.length === 0) {
        if (RUN_ONCE) {
          console.log('[WORKER] sin eventos pendientes, modo --once completado');
          break;
        }
        console.log(`[WAIT] sin eventos pendientes, esperando ${POLL_INTERVAL_MS}ms...`);
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      console.log(`[BATCH] ${events.length} eventos encontrados`);

      for (const event of events) {
        if (shuttingDown) break;
        await processEvent(event);
      }
    } catch (err) {
      console.log(`[WORKER] Error inesperado en el loop: ${err.message}`);
      if (RUN_ONCE) break;
      await sleep(POLL_INTERVAL_MS);
    }
  } while (!RUN_ONCE && !shuttingDown);

  console.log('[WORKER] loop terminado limpiamente');
  process.exit(0);
}

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

poll();
