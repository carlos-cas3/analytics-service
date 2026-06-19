const eventRepository = require('../repositories/eventRepository');

/**
 * Processes and persists an analytic event.
 *
 * Delegates to the repository layer to save the event. Returns a
 * result object indicating whether a new record was created or an
 * existing duplicate was detected.
 *
 * @async
 * @function
 * @param {Object} data - The event data to process
 * @param {string} data.event_id - Unique event identifier (UUID v4)
 * @param {string} data.type - Event type (e.g. `USER_CREATED`)
 * @param {string} data.service - Name of the originating service
 * @param {string} data.aggregate_type - Domain aggregate type
 * @param {string} data.aggregate_id - Domain aggregate identifier
 * @param {string[]} [data.vendor_ids=[]] - Optional vendor identifiers
 * @param {Object} data.payload - Arbitrary event payload
 * @param {string} data.event_timestamp - ISO-8601 timestamp of the event
 * @param {string} [data.source_ip=null] - Originating IP address
 * @returns {Promise<{success: boolean, created: boolean}>}
 *   - `{ success: true, created: true }` when a new row is inserted
 *   - `{ success: true, created: false }` when the event_id already exists
 * @throws {Error} If the underlying repository save fails
 *
 * @example
 * const result = await eventService.processEvent(eventData);
 * // result => { success: true, created: true }
 */
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
