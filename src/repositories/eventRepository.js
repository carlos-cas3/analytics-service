const supabase = require('../config/supabase');

/**
 * Persists an analytic event to the database.
 *
 * Inserts a single event row into the `events` table. Uses
 * `onConflict: 'event_id'` with `ignoreDuplicates: true` so that
 * re-inserting the same `event_id` is a no-op rather than a failure.
 *
 * @async
 * @function
 * @param {Object} data - The event data to persist
 * @param {string} data.event_id - Unique event identifier (UUID v4)
 * @param {string} data.type - Event type (e.g. `USER_CREATED`)
 * @param {string} data.service - Name of the originating service
 * @param {string} data.aggregate_type - Domain aggregate type (e.g. `user`)
 * @param {string} data.aggregate_id - Domain aggregate identifier
 * @param {string|null} [data.vendor_id=null] - Optional vendor identifier
 * @param {Object} data.payload - Arbitrary event payload
 * @param {string} data.event_timestamp - ISO-8601 timestamp of the event
 * @param {string} [data.source_ip=null] - Originating IP address
 * @returns {Promise<Object[]>} Array containing the inserted row(s)
 * @throws {Error} If the Supabase insert operation fails
 *
 * @example
 * const result = await eventRepository.save({
 *   event_id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'USER_CREATED',
 *   service: 'user-service',
 *   aggregate_type: 'user',
 *   aggregate_id: 'user-123',
 *   payload: { email: 'test@example.com' },
 *   event_timestamp: '2024-01-15T10:30:00.000Z',
 * });
 */
async function save(data) {
  const { data: result, error } = await supabase
    .from('events')
    .insert([{
      event_id: data.event_id,
      type: data.type,
      service: data.service,
      aggregate_type: data.aggregate_type,
      aggregate_id: data.aggregate_id,
      vendor_id: data.vendor_id || null,
      payload: data.payload,
      event_timestamp: data.event_timestamp,
      source_ip: data.source_ip || null,
    }], {
      onConflict: 'event_id',
      ignoreDuplicates: true,
    })
    .select();

  if (error) throw error;

  return result;
}

module.exports = { save };
