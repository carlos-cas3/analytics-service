const supabase = require('../config/supabase');

const ALLOWED_COLUMNS = new Set([
  'new_users',
  'users_approved',
  'users_rejected',
  'login_failed_count',
  'new_vendors',
  'branches_count',
  'total_vendors',
]);

function assertAllowedColumn(column) {
  if (!ALLOWED_COLUMNS.has(column)) {
    throw new Error(`Invalid metric column: "${column}"`);
  }
}

async function incrementDailyMetric(date, column, amount) {
  assertAllowedColumn(column);
  const { error } = await supabase.rpc('increment_daily_metric', {
    p_date: date,
    p_column: column,
    p_amount: amount,
  });
  if (error) throw error;
}

async function incrementMonthlyMetric(month, column, amount) {
  assertAllowedColumn(column);
  const { error } = await supabase.rpc('increment_monthly_metric', {
    p_month: month,
    p_column: column,
    p_amount: amount,
  });
  if (error) throw error;
}

async function incrementVendorDailyMetric(vendorId, date, column, amount) {
  assertAllowedColumn(column);
  const { error } = await supabase.rpc('increment_vendor_daily_metric', {
    p_vendor_id: vendorId,
    p_date: date,
    p_column: column,
    p_amount: amount,
  });
  if (error) throw error;
}

module.exports = {
  incrementDailyMetric,
  incrementMonthlyMetric,
  incrementVendorDailyMetric,
  ALLOWED_COLUMNS,
};
