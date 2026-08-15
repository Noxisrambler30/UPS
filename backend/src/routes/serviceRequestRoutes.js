const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
} = require('../controllers/serviceRequestController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/', verifyToken, createServiceRequest);
router.get('/', verifyToken, requireAdmin, getAllServiceRequests);
router.get('/:id', verifyToken, requireAdmin, getServiceRequestById);
router.patch('/:id', verifyToken, requireAdmin, updateServiceRequestStatus);

module.exports = router;