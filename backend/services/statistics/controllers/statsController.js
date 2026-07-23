const StatEvent = require('../models/StatEvent');

const getOverview = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, orderTotals, newUsersLast7Days, ordersLast7Days] = await Promise.all([
      StatEvent.countDocuments({ type: 'user_registered' }),
      StatEvent.aggregate([
        { $match: { type: 'order_placed' } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
      ]),
      StatEvent.countDocuments({ type: 'user_registered', createdAt: { $gte: sevenDaysAgo } }),
      StatEvent.countDocuments({ type: 'order_placed', createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      totalUsers,
      totalOrders: orderTotals[0]?.totalOrders || 0,
      totalRevenue: Number((orderTotals[0]?.totalRevenue || 0).toFixed(2)),
      newUsersLast7Days,
      ordersLast7Days,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing statistics', error: error.message });
  }
};

const getDailyTimeseries = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 14, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const series = await StatEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.day': 1 } },
    ]);

    res.json({ days, series });
  } catch (error) {
    res.status(500).json({ message: 'Error computing statistics timeseries', error: error.message });
  }
};

module.exports = { getOverview, getDailyTimeseries };