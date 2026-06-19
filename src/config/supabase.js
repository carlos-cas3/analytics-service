const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase client singleton.
 *
 * Initializes and exports a single Supabase client instance using
 * `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.
 * The process exits with code 1 if either variable is missing.
 *
 * @constant
 * @type {import('@supabase/supabase-js').SupabaseClient}
 * @throws {process.exit} If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set
 *
 * @example
 * const supabase = require('./config/supabase');
 * const { data, error } = await supabase.from('events').select('*');
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Supabase client initialized (mode: ${process.env.NODE_ENV || 'development'})`);

module.exports = supabase;
