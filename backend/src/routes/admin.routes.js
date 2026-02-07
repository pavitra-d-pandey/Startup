const express = require('express');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const { listRequestsController, approveRequestController, rejectRequestController } = require('../controllers/admin.controller');

const router = express.Router();

router.use('/admin', auth, requireRole('SUPER_ADMIN'));

router.get('/admin/requests', listRequestsController);
router.post('/admin/requests/:requestId/approve', approveRequestController);
router.post('/admin/requests/:requestId/reject', rejectRequestController);

module.exports = router;
