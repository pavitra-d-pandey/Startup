const {
  listVerification,
  addPhoneNumber,
  addEmailDomain,
  addSenderIdentity,
  updateVerificationStatus,
} = require('../services/verification.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');

async function listVerificationController(req, res, next) {
  try {
    const data = await listVerification(req.tenant.tenantId);
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function addPhoneController(req, res, next) {
  try {
    const data = await addPhoneNumber(req.tenant.tenantId, req.body.number);
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'VERIFICATION_REQUEST',
      target: `phone:${req.body.number}`,
      requestId: req.id,
    });
    return res.status(201).json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function addEmailController(req, res, next) {
  try {
    const data = await addEmailDomain(req.tenant.tenantId, req.body.domain);
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'VERIFICATION_REQUEST',
      target: `email:${req.body.domain}`,
      requestId: req.id,
    });
    return res.status(201).json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function addSenderController(req, res, next) {
  try {
    const data = await addSenderIdentity(req.tenant.tenantId, req.body.sender);
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'VERIFICATION_REQUEST',
      target: `sender:${req.body.sender}`,
      requestId: req.id,
    });
    return res.status(201).json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function updateStatusController(req, res, next) {
  try {
    const { type, index } = req.params;
    const { status, reason } = req.body;
    const data = await updateVerificationStatus(
      req.tenant.tenantId,
      type,
      Number(index),
      status,
      req.user.userId,
      reason
    );
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'VERIFICATION_APPROVE',
      target: `${type}:${index}`,
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listVerificationController,
  addPhoneController,
  addEmailController,
  addSenderController,
  updateStatusController,
};
