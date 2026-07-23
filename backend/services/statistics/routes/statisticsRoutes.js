const express = require('express');
const router = express.Router();

const { getOverview, getDailyTimeseries } = require('../controllers/statsController');
const { protect, isAdmin } = require('../../../middleware/authMiddleware');

router.use(protect, isAdmin);

router.get('/overview', getOverview);
router.get('/timeseries', getDailyTimeseries);

module.exports = router;