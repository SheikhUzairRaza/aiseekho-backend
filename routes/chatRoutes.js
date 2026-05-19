const express = require('express');
const router = express.Router();
const { processChat, getTraces } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/', protect, processChat);
router.get('/traces', protect, getTraces);

module.exports = router;
