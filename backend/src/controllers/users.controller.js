const { listUsers, inviteUser, disableUser, updateRole } = require('../services/users.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');

async function listUsersController(req, res, next) {
  try {
    const users = await listUsers(req.tenant.tenantId);
    return res.json(buildResponse({ success: true, data: users, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function inviteUserController(req, res, next) {
  try {
    const { email, name, role } = req.body;
    const { user, tempPassword } = await inviteUser({
      tenantId: req.tenant.tenantId,
      email,
      name,
      role,
    });

    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'USER_INVITE',
      target: user.email,
      requestId: req.id,
    });

    return res
      .status(201)
      .json(buildResponse({ success: true, data: { user, tempPassword }, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function disableUserController(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await disableUser({ tenantId: req.tenant.tenantId, userId });
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'USER_DISABLE',
      target: userId,
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data: user, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function updateRoleController(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await updateRole({ tenantId: req.tenant.tenantId, userId, role });
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'USER_ROLE_UPDATE',
      target: userId,
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data: user, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsersController,
  inviteUserController,
  disableUserController,
  updateRoleController,
};
