const eventRepository = require('../repositories/eventRepository');
const { validateEvent } = require('./validators/eventValidator');
const { HANDLERS } = require('../handlers');

async function processEvent(event) {
  const { valid, reason } = validateEvent(event);

  if (!valid) {
    console.log(`[INVALID] ${event.event_id} ${event.service}:${event.type} → ${reason}, marcado processed sin actualizar métricas`);
    await eventRepository.markProcessed(event.id);
    return;
  }

  const handler = HANDLERS[event.type];

  if (!handler) {
    console.log(`[SKIP] ${event.event_id} ${event.service}:${event.type} → sin handler implementado`);
    await eventRepository.markProcessed(event.id);
    return;
  }

  try {
    await handler.handle(event);
    console.log(`[OK] ${event.event_id} ${event.service}:${event.type}`);
    await eventRepository.markProcessed(event.id);
  } catch (err) {
    console.log(`[ERROR] ${event.event_id} ${event.service}:${event.type} → fallo DB: ${err.message}`);
  }
}

module.exports = { processEvent };
