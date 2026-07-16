const repo = require('../repositories/dashboardRepository');

async function getSuperAdminDashboard(req, res, next) {
  try {
    const [
      totalRevenue, totalOrders, avgOrderValue,
      totalVendors, activeVendors,
      revenueQuarterly, ordersDistribution,
      topProducts, alerts,
    ] = await Promise.all([
      repo.getTotalRevenue(),
      repo.getOrderCount(),
      repo.getAvgOrderValue(),
      repo.getTotalVendors(),
      repo.getActiveVendors(),
      repo.getRevenueByQuarter(),
      repo.getOrdersDistribution(),
      repo.getTopProducts(10),
      repo.getRecentAlerts(10),
    ]);

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalVendors,
        activeVendors,
        avgOrderValue,
      },
      revenueQuarterly,
      ordersDistribution,
      topProducts,
      operationalAlerts: alerts,
    });
  } catch (err) {
    next(err);
  }
}

async function getSuperAdminAnalytics(req, res, next) {
  try {
    const [
      totalRevenue, totalOrders, totalVendors,
      comparisonTrends, ordersTrend,
      categories, vendorRanking,
      trendHistory, tickets,
      ordersDistribution,
    ] = await Promise.all([
      repo.getTotalRevenue(),
      repo.getOrderCount(),
      repo.getTotalVendors(),
      repo.getComparisonTrends(),
      repo.getOrdersTrend(),
      repo.getCategoryRevenue(),
      repo.getVendorRanking(),
      repo.getTrendHistory(),
      repo.getTicketStats(),
      repo.getOrdersDistribution(),
    ]);

    const trends = comparisonTrends;
    const lastTwo = trends.slice(-2);
    const revenueGrowth = lastTwo.length >= 2 ? lastTwo[1].diffPercent : 0;
    const ordersGrowth = (() => {
      const ot = ordersTrend;
      const last2 = ot.slice(-2);
      if (last2.length < 2) return 0;
      const prev = last2[0].completed + last2[0].pending;
      const curr = last2[1].completed + last2[1].pending;
      return prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
    })();
    const vendorGrowth = comparisonTrends.length >= 2 ?
      Math.round(((totalVendors - 5) / 5) * 100) :
      0;

    const insights = [];
    if (revenueGrowth > 10) {
      insights.push({
        type: 'positive',
        title: 'Crecimiento de ingresos',
        description: `Los ingresos crecieron ${revenueGrowth}% este mes`,
      });
    } else if (revenueGrowth < -10) {
      insights.push({
        type: 'critical',
        title: 'Caída de ingresos',
        description: `Los ingresos cayeron ${Math.abs(revenueGrowth)}% este mes`,
      });
    }

    if (ordersDistribution) {
      const totalOrdersAll = Object.values(ordersDistribution).reduce((s, v) => s + v, 0);
      const cancelledPct = totalOrdersAll > 0 ?
        Math.round((ordersDistribution.cancelled / totalOrdersAll) * 100) : 0;
      if (cancelledPct > 15) {
        insights.push({
          type: 'critical',
          title: 'Alta tasa de anulación',
          description: `${cancelledPct}% de órdenes fueron anuladas o devueltas`,
        });
      }
    }

    if (tickets.pending > 0) {
      insights.push({
        type: 'info',
        title: 'Tickets pendientes',
        description: `${tickets.pending} tickets de soporte sin resolver`,
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Sin novedades',
        description: 'No se detectaron alertas en este período',
      });
    }

    res.json({
      summary: [
        {
          label: 'Ingresos', value: totalRevenue, growth: revenueGrowth, prefix: 'S/',
        },
        {
          label: 'Órdenes', value: totalOrders, growth: ordersGrowth, prefix: '',
        },
        {
          label: 'Vendedores', value: totalVendors, growth: vendorGrowth, prefix: '',
        },
      ],
      comparisonTrends: trends,
      ordersTrend,
      categories,
      topVendors: vendorRanking.slice(0, 10).map((v) => ({
        vendorName: v.vendorName,
        totalRevenue: v.totalRevenue,
        orders: v.orders,
        status: 'active',
      })),
      insights,
      trendHistory,
    });
  } catch (err) {
    next(err);
  }
}

async function getVendorDashboard(req, res, next) {
  try {
    const vendorId = req.query.vendor_id;
    if (!vendorId) {
      return res.status(400).json({ error: 'vendor_id query parameter is required' });
    }

    const [
      vendorMetrics, revenueMonthly,
      ordersDistribution, topProducts, alerts,
    ] = await Promise.all([
      repo.getVendorMetrics(vendorId),
      repo.getRevenueByMonthForVendor(vendorId),
      repo.getOrdersDistributionForVendor(vendorId),
      repo.getTopProductsForVendor(vendorId, 10),
      repo.getAlertsForVendor(vendorId, 10),
    ]);

    const revenueMonthlyFormatted = { 2026: [] };
    for (const m of revenueMonthly) {
      const [year, monthNum] = m.month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthIdx = parseInt(monthNum, 10) - 1;
      revenueMonthlyFormatted[year] = revenueMonthlyFormatted[year] || [];
      revenueMonthlyFormatted[year].push({
        quarter: monthNames[monthIdx],
        revenue: m.revenue,
        date: `${m.month}-01`,
      });
    }

    res.json({
      metrics: {
        totalRevenue: vendorMetrics.totalRevenue,
        totalOrders: vendorMetrics.totalOrders,
        activeProducts: topProducts.length,
        avgOrderValue: vendorMetrics.avgOrderValue,
      },
      revenueMonthly: revenueMonthlyFormatted,
      ordersDistribution,
      topProducts,
      vendorAlerts: alerts,
    });
  } catch (err) {
    next(err);
  }
}

async function getVendorAnalytics(req, res, next) {
  try {
    const vendorId = req.query.vendor_id;
    if (!vendorId) {
      return res.status(400).json({ error: 'vendor_id query parameter is required' });
    }

    const [
      vendorMetrics, revenueByMonth,
      ordersTrend, categories,
      topProductsWithGrowth,
    ] = await Promise.all([
      repo.getVendorMetrics(vendorId),
      repo.getRevenueByMonthForVendor(vendorId),
      repo.getOrdersTrendForVendor(vendorId),
      repo.getCategoryRevenueForVendor(vendorId),
      repo.getProductPerformanceForVendor(vendorId, 10),
    ]);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const comparisonTrends = revenueByMonth.map((m, i) => {
      const monthIdx = parseInt(m.month.split('-')[1], 10) - 1;
      const current = m.revenue;
      const previous = i > 0 ? revenueByMonth[i - 1].revenue : 0;
      const diff = current - previous;
      return {
        month: monthNames[monthIdx],
        current,
        previous,
        diff,
        diffPercent: previous > 0 ? Math.round((diff / previous) * 1000) / 10 : 0,
      };
    });

    const trendHistory = revenueByMonth.map((m) => ({
      month: monthNames[parseInt(m.month.split('-')[1], 10) - 1],
      value: m.revenue,
    }));

    const lastTwo = comparisonTrends.slice(-2);
    const revenueGrowth = lastTwo.length >= 2 ? lastTwo[1].diffPercent : 0;
    const ordersGrowth = (() => {
      const ot = ordersTrend;
      const last2 = ot.slice(-2);
      if (last2.length < 2) return 0;
      const prev = last2[0].completed + last2[0].pending;
      const curr = last2[1].completed + last2[1].pending;
      return prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : 0;
    })();

    const avgGrowth = vendorMetrics.avgOrderValue > 0 ?
      Math.round(((vendorMetrics.avgOrderValue - 400) / 400) * 100) :
      0;

    const insights = [];
    if (revenueGrowth > 10) {
      insights.push({
        type: 'positive',
        title: 'Crecimiento de ingresos',
        description: `Tus ingresos crecieron ${revenueGrowth}% este mes`,
      });
    }
    const distData = await repo.getOrdersDistributionForVendor(vendorId);
    const totalOrdersDist = Object.values(distData).reduce((s, v) => s + v, 0);
    if (totalOrdersDist > 0) {
      const pendingOrders = await repo.getOrdersDistributionForVendor(vendorId);
      if (pendingOrders.pending > 0) {
        insights.push({
          type: 'info',
          title: 'Órdenes pendientes',
          description: `Tienes ${pendingOrders.pending} órdenes pendientes de preparar`,
        });
      }
    }
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Sin novedades',
        description: 'No se detectaron alertas en este período',
      });
    }

    res.json({
      summary: [
        {
          label: 'Ingresos', value: vendorMetrics.totalRevenue, growth: revenueGrowth, prefix: 'S/',
        },
        {
          label: 'Órdenes', value: vendorMetrics.totalOrders, growth: ordersGrowth, prefix: '',
        },
        {
          label: 'Ticket Prom', value: vendorMetrics.avgOrderValue, growth: avgGrowth, prefix: 'S/',
        },
      ],
      comparisonTrends,
      ordersTrend,
      categories,
      topProducts: topProductsWithGrowth,
      insights,
      trendHistory,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSuperAdminDashboard,
  getSuperAdminAnalytics,
  getVendorDashboard,
  getVendorAnalytics,
};
