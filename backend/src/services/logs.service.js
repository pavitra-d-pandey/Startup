const CommunicationLog = require('../models/CommunicationLog');

async function listLogs(tenantId, filters = {}) {
  const query = { tenantId, ...filters };
  return CommunicationLog.find(query).sort({ occurredAt: -1 }).limit(200);
}

module.exports = { listLogs };
