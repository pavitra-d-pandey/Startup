const AuditLog = require('../models/AuditLog');

async function auditLog({ tenantId, actorId, action, target, metadata, requestId }) {
  try {
    await AuditLog.create({ tenantId, actorId, action, target, metadata, requestId });
  } catch (err) {
    // Do not block requests on audit logging failures
  }
}

module.exports = { auditLog };
