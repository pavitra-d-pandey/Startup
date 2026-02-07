const { listFlags, recheckNow } = require('../services/reputation.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');

async function listReputationController(req, res, next) {
  try {
    const flags = await listFlags(req.tenant.tenantId);
    return res.json(buildResponse({ success: true, data: flags, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function recheckController(req, res, next) {
  try {
    const updated = await recheckNow(req.tenant.tenantId);
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'REPUTATION_RECHECK',
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data: updated, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { listReputationController, recheckController };
