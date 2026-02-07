const ReputationFlag = require('../models/ReputationFlag');

async function listFlags(tenantId) {
  return ReputationFlag.find({ tenantId }).sort({ lastCheckedAt: -1 });
}

async function recheckNow(tenantId) {
  // Simulate a recheck by updating lastCheckedAt and random flags
  const items = await ReputationFlag.find({ tenantId });
  const updated = [];
  for (const item of items) {
    const flagged = Math.random() > 0.75;
    const status = flagged ? 'flagged' : 'clean';
    item.status = status;
    item.lastCheckedAt = new Date();
    item.history.push({ status, evidence: flagged ? 'Carrier spam report' : 'No issues', source: 'simulator' });
    await item.save();
    updated.push(item);
  }
  return updated;
}

module.exports = { listFlags, recheckNow };
