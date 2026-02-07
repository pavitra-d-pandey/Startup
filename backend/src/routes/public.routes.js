const express = require('express');
const { loginController } = require('../controllers/auth.controller');
const { requestAccessController } = require('../controllers/requestAccess.controller');
const { secretAdminLogin } = require('../controllers/admin.controller');
const { getBranding } = require('../controllers/tenant.controller');
const validate = require('../middlewares/validate');
const { loginSchema } = require('../validators/auth.validator');
const { requestAccessSchema } = require('../validators/requestAccess.validator');
const { requestAccessLimiter } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/auth/login', validate(loginSchema), loginController);
router.post('/request-access', requestAccessLimiter, validate(requestAccessSchema), requestAccessController);
router.post('/secret-admin/login', secretAdminLogin);
router.get('/tenants/:tenantSlug/branding', getBranding);

module.exports = router;
