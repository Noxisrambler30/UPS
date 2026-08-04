const express = require('express');
const router = express.Router();
const { createQuote, getQuoteByCode, getAllQuotes, updateQuoteStatus } = require('../controllers/quoteController');

router.post('/', createQuote);
router.get('/', getAllQuotes);
router.get('/:uniqueCode', getQuoteByCode);
router.patch('/:uniqueCode', updateQuoteStatus);

module.exports = router;