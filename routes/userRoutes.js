const express = require('express');
const router = express.Router();
const { updateLocation, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/location', protect, updateLocation);
router.get('/me', protect, getMe);

module.exports = router;
