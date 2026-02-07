const express = require('express');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');
const gatekeeper = require('../middlewares/gatekeeper');
const { PERMISSIONS } = require('../utils/permissions');
const {
  listAssetsController,
  addAssetController,
  activateAssetController,
  getUploadSignature,
} = require('../controllers/assets.controller');
const {
  listVerificationController,
  addPhoneController,
  addEmailController,
  addSenderController,
  updateStatusController,
} = require('../controllers/verification.controller');
const { listReputationController, recheckController } = require('../controllers/reputation.controller');
const { listLogsController } = require('../controllers/logs.controller');
const {
  listUsersController,
  inviteUserController,
  disableUserController,
  updateRoleController,
} = require('../controllers/users.controller');
const { updateBrandingController } = require('../controllers/tenant.controller');
const { overviewController } = require('../controllers/overview.controller');

const router = express.Router();

router.use('/dashboard/:tenantSlug', auth, tenantResolver);

router.get(
  '/dashboard/:tenantSlug/overview',
  gatekeeper([PERMISSIONS.TENANT_READ]),
  overviewController
);

router.get(
  '/dashboard/:tenantSlug/assets',
  gatekeeper([PERMISSIONS.TENANT_READ]),
  listAssetsController
);
router.post(
  '/dashboard/:tenantSlug/assets',
  gatekeeper([PERMISSIONS.ASSET_UPLOAD]),
  addAssetController
);
router.post(
  '/dashboard/:tenantSlug/assets/activate/:version',
  gatekeeper([PERMISSIONS.ASSET_VERSION_ROLLBACK]),
  activateAssetController
);
router.post(
  '/dashboard/:tenantSlug/assets/signature',
  gatekeeper([PERMISSIONS.ASSET_UPLOAD]),
  getUploadSignature
);

router.get(
  '/dashboard/:tenantSlug/verification',
  gatekeeper([PERMISSIONS.TENANT_READ]),
  listVerificationController
);
router.post(
  '/dashboard/:tenantSlug/verification/phone',
  gatekeeper([PERMISSIONS.VERIFICATION_REQUEST]),
  addPhoneController
);
router.post(
  '/dashboard/:tenantSlug/verification/email',
  gatekeeper([PERMISSIONS.VERIFICATION_REQUEST]),
  addEmailController
);
router.post(
  '/dashboard/:tenantSlug/verification/sender',
  gatekeeper([PERMISSIONS.VERIFICATION_REQUEST]),
  addSenderController
);
router.patch(
  '/dashboard/:tenantSlug/verification/:type/:index',
  gatekeeper([PERMISSIONS.VERIFICATION_APPROVE]),
  updateStatusController
);

router.get(
  '/dashboard/:tenantSlug/reputation',
  gatekeeper([PERMISSIONS.TENANT_READ]),
  listReputationController
);
router.post(
  '/dashboard/:tenantSlug/reputation/recheck',
  gatekeeper([PERMISSIONS.TENANT_UPDATE]),
  recheckController
);

router.get(
  '/dashboard/:tenantSlug/logs',
  gatekeeper([PERMISSIONS.LOG_VIEW]),
  listLogsController
);

router.get(
  '/dashboard/:tenantSlug/users',
  gatekeeper([PERMISSIONS.USER_INVITE]),
  listUsersController
);
router.post(
  '/dashboard/:tenantSlug/users',
  gatekeeper([PERMISSIONS.USER_INVITE]),
  inviteUserController
);
router.patch(
  '/dashboard/:tenantSlug/users/:userId/disable',
  gatekeeper([PERMISSIONS.USER_DISABLE]),
  disableUserController
);
router.patch(
  '/dashboard/:tenantSlug/users/:userId/role',
  gatekeeper([PERMISSIONS.USER_ROLE_UPDATE]),
  updateRoleController
);

router.patch(
  '/dashboard/:tenantSlug/settings/branding',
  gatekeeper([PERMISSIONS.TENANT_UPDATE]),
  updateBrandingController
);

module.exports = router;
