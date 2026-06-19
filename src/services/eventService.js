const eventRepository = require('../repositories/eventRepository');

async function processEvent(data) {
  console.log({
    event_id: data.event_id,
    type: data.type,
    service: data.service,
    status: 'PROCESSING',
  });

  const result = await eventRepository.save(data);

  if (!result || result.length === 0) {
    console.log({
      event_id: data.event_id,
      type: data.type,
      service: data.service,
      status: 'DUPLICATE',
    });

    return { success: true, created: false };
  }

  console.log({
    event_id: data.event_id,
    type: data.type,
    service: data.service,
    status: 'CREATED',
  });

  return { success: true, created: true };
}

module.exports = { processEvent };
