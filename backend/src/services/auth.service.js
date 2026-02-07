const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { PERMISSIONS } = require('../utils/permissions');

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  CLIENT_ADMIN: [
    PERMISSIONS.TENANT_READ,
    PERMISSIONS.TENANT_UPDATE,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.ASSET_VERSION_ROLLBACK,
    PERMISSIONS.VERIFICATION_REQUEST,
    PERMISSIONS.VERIFICATION_APPROVE,
    PERMISSIONS.LOG_VIEW,
    PERMISSIONS.LOG_EXPORT,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_DISABLE,
    PERMISSIONS.USER_ROLE_UPDATE,
  ],
  CLIENT_USER: [
    PERMISSIONS.TENANT_READ,
    PERMISSIONS.ASSET_UPLOAD,
    PERMISSIONS.VERIFICATION_REQUEST,
    PERMISSIONS.LOG_VIEW,
  ],
};

function buildJwt(user) {
  const permissions = [...new Set([...(ROLE_PERMISSIONS[user.role] || []), ...(user.permissions || [])])];
  const payload = {
    sub: user._id.toString(),
    tenantId: user.tenantId?.toString(),
    role: user.role,
    permissions,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function login({ email, password }) {
  const user = await User.findOne({ email, status: 'active' });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  user.lastLoginAt = new Date();
  await user.save();
  const token = buildJwt(user);
  return { user, token };
}

module.exports = { login, buildJwt, ROLE_PERMISSIONS };
