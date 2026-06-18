const supabase = require('../config/supabase');

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
