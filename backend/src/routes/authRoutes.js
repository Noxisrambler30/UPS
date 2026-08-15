const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, adminLogin } = require('../controllers/authController');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin-login', adminLogin);

module.exports = router;