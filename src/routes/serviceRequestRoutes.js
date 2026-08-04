const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
} = require('../controllers/serviceRequestController');

router.post('/', createServiceRequest);
router.get('/', getAllServiceRequests);
router.get('/:id', getServiceRequestById);
router.patch('/:id', updateServiceRequestStatus);

module.exports = router;