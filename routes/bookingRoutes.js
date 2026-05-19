const express = require('express');
const router = express.Router();
const { confirmBooking, completeBooking, fileDispute, getHistory, simulateCancel, getProviderAnalytics } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/history', protect, getHistory);
router.post('/confirm', protect, confirmBooking);
router.post('/complete', protect, completeBooking);
router.post('/dispute', protect, fileDispute);
router.post('/simulate-cancel', protect, simulateCancel);
router.get('/provider-analytics/:id', protect, getProviderAnalytics);

module.exports = router;
