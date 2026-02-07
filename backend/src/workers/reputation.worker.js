const { connectDb } = require('../config/db');
const ReputationFlag = require('../models/ReputationFlag');
const Tenant = require('../models/Tenant');

async function seedFlagsForTenant(tenantId) {
  const existing = await ReputationFlag.find({ tenantId });
  if (existing.length > 0) return;
  const sample = ['+1-212-555-0101', '+1-212-555-0199', '+1-415-555-0177'];
  await ReputationFlag.insertMany(
    sample.map((phoneNumber) => ({ tenantId, phoneNumber, status: 'clean', history: [] }))
  );
}

async function runCycle() {
  const tenants = await Tenant.find().select('_id');
  for (const tenant of tenants) {
    await seedFlagsForTenant(tenant._id);
    const flags = await ReputationFlag.find({ tenantId: tenant._id });
    for (const flag of flags) {
      const flagged = Math.random() > 0.8;
      const status = flagged ? 'flagged' : 'clean';
      flag.status = status;
      flag.lastCheckedAt = new Date();
      flag.history.push({
        status,
        evidence: flagged ? 'External spam report' : 'No issues',
        source: 'simulator',
      });
      await flag.save();
    }
  }
}

async function start() {
  await connectDb();
  console.log('Reputation monitor worker running...');
  setInterval(runCycle, 60 * 1000);
  await runCycle();
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
