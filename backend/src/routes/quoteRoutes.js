const express = require('express');
const router = express.Router();
const { createQuote, getQuoteByCode, getAllQuotes, updateQuoteStatus } = require('../controllers/quoteController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/', verifyToken, createQuote);
router.get('/', verifyToken, requireAdmin, getAllQuotes);
router.get('/:uniqueCode', getQuoteByCode); // stays public — tracking by code needs no login
router.patch('/:uniqueCode', verifyToken, requireAdmin, updateQuoteStatus);

module.exports = router;