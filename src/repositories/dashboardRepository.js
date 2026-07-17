/* eslint-disable camelcase, no-plusplus, no-nested-ternary, max-len, no-unused-vars */

const supabase = require('../config/supabase');

async function insertOrderMaster(data) {
  const {
    id_orden, total, fecha, event_timestamp,
  } = data;
  const { data: result, error } = await supabase
    .from('orders_master')
    .insert([{
      id_orden, total, fecha, event_timestamp,
    }])
    .select();
  if (error) throw error;
  return result;
}

async function insertSubOrder(data) {
  const {
    id_orden, vendor_id, vendor_name, monto, status,
  } = data;
  const { data: result, error } = await supabase
    .from('sub_orders')
    .insert([{
      id_orden, vendor_id, vendor_name, monto, status,
    }])
    .select();
  if (error) throw error;
  return result[0];
}

async function insertOrderItem(data) {
  const {
    sub_order_id, product_id, product_name, category, quantity, revenue,
  } = data;
  const { data: result, error } = await supabase
    .from('order_items')
    .insert([{
      sub_order_id, product_id, product_name, category, quantity, revenue,
    }])
    .select();
  if (error) throw error;
  return result;
}

async function insertStatusHistory(data) {
  const {
    sub_order_id, status_anterior, status_nuevo, fecha,
  } = data;
  const { data: result, error } = await supabase
    .from('sub_order_status_history')
    .insert([{
      sub_order_id, status_anterior, status_nuevo, fecha,
    }])
    .select();
  if (error) throw error;
  return result;
}

async function updateSubOrderStatus(idOrdenMaestra, vendorId, newStatus) {
  const { data, error } = await supabase
    .from('sub_orders')
    .update({ status: newStatus })
    .eq('id_orden', idOrdenMaestra)
    .eq('vendor_id', vendorId)
    .select();
  if (error) throw error;
  return data;
}

async function findSubOrder(idOrdenMaestra, vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('id')
    .eq('id_orden', idOrdenMaestra)
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertTicket(data) {
  const {
    id_ticket, id_orden_maestra, tipo_solicitud, motivo, fecha, items_count, fecha_aprobacion, status,
  } = data;
  if (fecha_aprobacion || status === 'approved') {
    const { data: result, error } = await supabase
      .from('tickets')
      .update({ fecha_aprobacion, status: 'approved' })
      .eq('id_ticket', id_ticket)
      .select();
    if (error) throw error;
    return result;
  }
  const { data: result, error } = await supabase
    .from('tickets')
    .insert([{
      id_ticket, id_orden_maestra, tipo_solicitud, motivo, fecha, items_count, status: 'pending',
    }])
    .select();
  if (error) throw error;
  return result;
}

async function getTotalRevenue() {
  const { data, error } = await supabase.from('orders_master').select('total');
  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + Number(r.total), 0);
}

async function getOrderCount() {
  const { count, error } = await supabase
    .from('orders_master')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

async function getAvgOrderValue() {
  const total = await getTotalRevenue();
  const count = await getOrderCount();
  return count > 0 ? Math.round(total / count) : 0;
}

async function getTotalVendors() {
  const { data, error } = await supabase.from('sub_orders').select('vendor_id');
  if (error) throw error;
  return new Set((data || []).map((r) => r.vendor_id)).size;
}

async function getActiveVendors() {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('vendor_id')
    .not('status', 'in', '(5,7)');
  if (error) throw error;
  return new Set((data || []).map((r) => r.vendor_id)).size;
}

async function getVendorNames() {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('vendor_id, vendor_name')
    .not('vendor_name', 'is', null);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    const vid = String(row.vendor_id);
    if (!map[vid]) map[vid] = row.vendor_name;
  }
  return map;
}

async function getRevenueByQuarter() {
  const { data, error } = await supabase.from('orders_master').select('total, fecha');
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.fecha);
    const year = d.getFullYear();
    const q = `Q${Math.floor(d.getMonth() / 3) + 1}`;
    const key = `${year}-${q}`;
    if (!grouped[key]) grouped[key] = { year: String(year), quarter: q, revenue: 0 };
    grouped[key].revenue += Number(row.total);
  }
  const result = {};
  for (const g of Object.values(grouped)) {
    if (!result[g.year]) result[g.year] = [];
    result[g.year].push({ quarter: g.quarter, revenue: Math.round(g.revenue) });
  }
  for (const year of Object.keys(result)) {
    result[year].sort((a, b) => a.quarter.localeCompare(b.quarter));
  }
  return result;
}

async function getRevenueByMonth() {
  const { data, error } = await supabase.from('orders_master').select('total, fecha');
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = { month: key, revenue: 0 };
    grouped[key].revenue += Number(row.total);
  }
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

async function getRevenueByMonthForVendor(vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('monto, orders_master!inner(fecha)')
    .eq('vendor_id', vendorId);
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.orders_master.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = { month: key, revenue: 0 };
    grouped[key].revenue += Number(row.monto);
  }
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

async function getOrdersDistribution() {
  const { data, error } = await supabase.from('sub_orders').select('status');
  if (error) throw error;
  let pending = 0; let completed = 0; let cancelled = 0; let
    reclamo = 0;
  for (const row of data || []) {
    if (row.status === 1 || row.status === 2) pending++;
    else if (row.status === 3 || row.status === 4) completed++;
    else if (row.status === 5 || row.status === 7) cancelled++;
    else if (row.status === 6) reclamo++;
  }
  return {
    pending, completed, cancelled, reclamo,
  };
}

async function getOrdersDistributionForVendor(vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('status')
    .eq('vendor_id', vendorId);
  if (error) throw error;
  let pending = 0; let completed = 0; let cancelled = 0; let
    reclamo = 0;
  for (const row of data || []) {
    if (row.status === 1 || row.status === 2) pending++;
    else if (row.status === 3 || row.status === 4) completed++;
    else if (row.status === 5 || row.status === 7) cancelled++;
    else if (row.status === 6) reclamo++;
  }
  return {
    pending, completed, cancelled, reclamo,
  };
}

async function getTopProducts(limit = 10) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, category, quantity, revenue');
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const key = row.product_name;
    if (!grouped[key]) {
      grouped[key] = {
        name: row.product_name, category: row.category || 'Sin categoría', sales: 0, revenue: 0,
      };
    }
    grouped[key].sales += row.quantity;
    grouped[key].revenue += Number(row.revenue);
  }
  return Object.values(grouped)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({ ...p, sales: p.sales, revenue: Math.round(p.revenue) }));
}

async function getTopProductsForVendor(vendorId, limit = 10) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, category, quantity, revenue, sub_orders!inner(vendor_id)')
    .eq('sub_orders.vendor_id', vendorId);
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const key = row.product_name;
    if (!grouped[key]) {
      grouped[key] = {
        name: row.product_name, category: row.category || 'Sin categoría', sales: 0, revenue: 0,
      };
    }
    grouped[key].sales += row.quantity;
    grouped[key].revenue += Number(row.revenue);
  }
  return Object.values(grouped)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((p) => ({ ...p, sales: p.sales, revenue: Math.round(p.revenue) }));
}

async function getProductPerformanceForVendor(vendorId, limit = 10) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, revenue, quantity, sub_orders!inner(vendor_id, orders_master!inner(fecha))')
    .eq('sub_orders.vendor_id', vendorId);
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const key = row.product_name;
    if (!grouped[key]) {
      grouped[key] = {
        productName: row.product_name, totalRevenue: 0, totalOrders: 0, monthData: {},
      };
    }
    grouped[key].totalRevenue += Number(row.revenue);
    grouped[key].totalOrders += row.quantity;
    if (!row.sub_orders?.orders_master) continue;
    const d = new Date(row.sub_orders.orders_master.fecha);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key].monthData[monthKey]) grouped[key].monthData[monthKey] = 0;
    grouped[key].monthData[monthKey] += Number(row.revenue);
  }
  const products = Object.values(grouped).map((p) => {
    const months = Object.keys(p.monthData).sort();
    const latestMonth = months[months.length - 1];
    const prevMonth = months.length > 1 ? months[months.length - 2] : null;
    const latestRevenue = p.monthData[latestMonth];
    const prevRevenue = prevMonth ? p.monthData[prevMonth] : 0;
    return {
      productName: p.productName,
      revenue: Math.round(p.totalRevenue),
      orders: p.totalOrders,
      growth: prevRevenue > 0 ?
        Math.round(((latestRevenue - prevRevenue) / prevRevenue) * 100) : 0,
    };
  });
  products.sort((a, b) => b.revenue - a.revenue);
  return products.slice(0, limit);
}

async function getCategoryRevenue() {
  const { data, error } = await supabase
    .from('order_items')
    .select('category, revenue');
  if (error) throw error;
  const grouped = {};
  let total = 0;
  for (const row of data || []) {
    const cat = row.category || 'Sin categoría';
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat] += Number(row.revenue);
    total += Number(row.revenue);
  }
  return Object.entries(grouped)
    .map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue),
      percentage: total > 0 ? Math.round((revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function getCategoryRevenueForVendor(vendorId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('category, revenue, sub_orders!inner(vendor_id)')
    .eq('sub_orders.vendor_id', vendorId);
  if (error) throw error;
  const grouped = {};
  let total = 0;
  for (const row of data || []) {
    const cat = row.category || 'Sin categoría';
    if (!grouped[cat]) grouped[cat] = 0;
    grouped[cat] += Number(row.revenue);
    total += Number(row.revenue);
  }
  return Object.entries(grouped)
    .map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue),
      percentage: total > 0 ? Math.round((revenue / total) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function getComparisonTrends() {
  const { data, error } = await supabase.from('orders_master').select('total, fecha');
  if (error) throw error;
  const months = [];
  for (const row of data || []) {
    const d = new Date(row.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, total: Number(row.total) });
  }
  const grouped = {};
  for (const m of months) {
    if (!grouped[m.key]) grouped[m.key] = 0;
    grouped[m.key] += m.total;
  }
  const sortedKeys = Object.keys(grouped).sort();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return sortedKeys.map((key, i) => {
    const mIdx = parseInt(key.split('-')[1], 10) - 1;
    const current = Math.round(grouped[key]);
    const previous = i > 0 ? Math.round(grouped[sortedKeys[i - 1]]) : 0;
    return {
      month: monthNames[mIdx],
      current,
      previous,
      diff: current - previous,
      diffPercent: previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : 0,
    };
  });
}

async function getTrendHistory() {
  const { data, error } = await supabase.from('orders_master').select('total, fecha');
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += Number(row.total);
  }
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return Object.keys(grouped).sort().map((key) => ({
    month: monthNames[parseInt(key.split('-')[1], 10) - 1],
    value: Math.round(grouped[key]),
  }));
}

async function getOrdersTrend() {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('status, orders_master!inner(fecha)');
  if (error) throw error;
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.orders_master.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) {
      grouped[key] = {
        completed: 0, pending: 0, cancelled: 0, reclamo: 0,
      };
    }
    const s = row.status;
    if (s === 3 || s === 4) grouped[key].completed++;
    else if (s === 1 || s === 2) grouped[key].pending++;
    else if (s === 5 || s === 7) grouped[key].cancelled++;
    else if (s === 6) grouped[key].reclamo++;
  }
  return Object.keys(grouped).sort().map((key) => ({
    month: monthNames[parseInt(key.split('-')[1], 10) - 1],
    ...grouped[key],
  }));
}

async function getOrdersTrendForVendor(vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('status, orders_master!inner(fecha)')
    .eq('vendor_id', vendorId);
  if (error) throw error;
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.orders_master.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = { completed: 0, pending: 0, cancelled: 0 };
    const s = row.status;
    if (s === 3 || s === 4) grouped[key].completed++;
    else if (s === 1 || s === 2) grouped[key].pending++;
    else if (s === 5 || s === 7) grouped[key].cancelled++;
  }
  return Object.keys(grouped).sort().map((key) => ({
    month: monthNames[parseInt(key.split('-')[1], 10) - 1],
    ...grouped[key],
  }));
}

async function getVendorTrend() {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('vendor_id, orders_master!inner(fecha)');
  if (error) throw error;
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.orders_master.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = new Set();
    grouped[key].add(row.vendor_id);
  }
  return Object.keys(grouped).sort().map((key) => {
    const mIdx = parseInt(key.split('-')[1], 10) - 1;
    return { month: monthNames[mIdx], vendors: grouped[key].size };
  });
}

async function getAvgOrderTrendForVendor(vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('monto, orders_master!inner(fecha)')
    .eq('vendor_id', vendorId);
  if (error) throw error;
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const grouped = {};
  for (const row of data || []) {
    const d = new Date(row.orders_master.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = { revenue: 0, orders: 0 };
    grouped[key].revenue += Number(row.monto);
    grouped[key].orders += 1;
  }
  return Object.keys(grouped).sort().map((key) => {
    const mIdx = parseInt(key.split('-')[1], 10) - 1;
    return {
      month: monthNames[mIdx],
      avgOrderValue: grouped[key].orders > 0 ?
        Math.round(grouped[key].revenue / grouped[key].orders) : 0,
    };
  });
}

async function getVendorRanking() {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('vendor_id, vendor_name, monto');
  if (error) throw error;
  const grouped = {};
  for (const row of data || []) {
    const vid = String(row.vendor_id);
    if (!grouped[vid]) {
      grouped[vid] = {
        vendorName: row.vendor_name || `Vendor #${vid}`, totalRevenue: 0, orders: 0, vendor_id: vid,
      };
    }
    grouped[vid].totalRevenue += Number(row.monto);
    grouped[vid].orders++;
  }
  return Object.values(grouped)
    .map((v) => ({ ...v, totalRevenue: Math.round(v.totalRevenue) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

async function getActiveProductsCount(vendorId) {
  const { error } = await supabase
    .from('order_items')
    .select('product_id')
    .eq('sub_orders.vendor_id', vendorId)
    .limit(1);
  if (error) return 0;
  const { count, error: err2 } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true });
  if (err2) return 0;
  return count || 0;
}

async function getRecentAlerts(limit = 10) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id_ticket,
    type: 'stock',
    severity: t.items_count > 3 ? 'high' : t.items_count > 1 ? 'medium' : 'low',
    description: t.motivo || `Ticket #${t.id_ticket}`,
    ticketId: t.id_ticket,
  }));
}

async function getAlertsForVendor(vendorId, limit = 10) {
  const { data: orderIds, error: err1 } = await supabase
    .from('sub_orders')
    .select('id_orden')
    .eq('vendor_id', vendorId);
  if (err1) throw err1;
  const ids = (orderIds || []).map((r) => r.id_orden);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .in('id_orden_maestra', ids)
    .order('fecha', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id_ticket,
    type: t.status === 'approved' ? 'positive' : 'warning',
    title: t.motivo || `Ticket #${t.id_ticket}`,
    description: `Orden #${t.id_orden_maestra} - ${t.tipo_solicitud === 1 ? 'Reclamo' : 'Devolución'}`,
  }));
}

async function getTicketStats() {
  const { data, error } = await supabase
    .from('tickets')
    .select('status, tipo_solicitud');
  if (error) throw error;
  const total = (data || []).length;
  const pending = (data || []).filter((t) => t.status === 'pending').length;
  const approved = (data || []).filter((t) => t.status === 'approved').length;
  return { total, pending, approved };
}

async function getVendorMetrics(vendorId) {
  const { data, error } = await supabase
    .from('sub_orders')
    .select('monto, status')
    .eq('vendor_id', vendorId);
  if (error) throw error;
  const rows = data || [];
  const totalRevenue = rows.reduce((s, r) => s + Number(r.monto), 0);
  const totalOrders = rows.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  return {
    totalRevenue: Math.round(totalRevenue),
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue),
  };
}

module.exports = {
  insertOrderMaster,
  insertSubOrder,
  insertOrderItem,
  insertStatusHistory,
  updateSubOrderStatus,
  findSubOrder,
  upsertTicket,
  getTotalRevenue,
  getOrderCount,
  getAvgOrderValue,
  getTotalVendors,
  getActiveVendors,
  getVendorNames,
  getRevenueByQuarter,
  getRevenueByMonth,
  getRevenueByMonthForVendor,
  getOrdersDistribution,
  getOrdersDistributionForVendor,
  getTopProducts,
  getTopProductsForVendor,
  getProductPerformanceForVendor,
  getCategoryRevenue,
  getCategoryRevenueForVendor,
  getComparisonTrends,
  getTrendHistory,
  getOrdersTrend,
  getOrdersTrendForVendor,
  getVendorTrend,
  getAvgOrderTrendForVendor,
  getVendorRanking,
  getRecentAlerts,
  getAlertsForVendor,
  getTicketStats,
  getVendorMetrics,
};
