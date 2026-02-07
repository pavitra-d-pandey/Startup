const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

async function listUsers(tenantId) {
  return User.find({ tenantId }).select('-passwordHash -resetTokenHash');
}

async function inviteUser({ tenantId, email, name, role }) {
  const tempPassword = crypto.randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await User.create({
    tenantId,
    email,
    name,
    role,
    passwordHash,
    mustResetPassword: true,
  });
  return { user, tempPassword };
}

async function disableUser({ tenantId, userId }) {
  return User.findOneAndUpdate({ _id: userId, tenantId }, { status: 'disabled' }, { new: true });
}

async function updateRole({ tenantId, userId, role }) {
  return User.findOneAndUpdate({ _id: userId, tenantId }, { role }, { new: true });
}

module.exports = { listUsers, inviteUser, disableUser, updateRole };
