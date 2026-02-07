const bcrypt = require('bcryptjs');
const { connectDb } = require('../config/db');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

async function seed() {
  await connectDb();

  const existing = await User.findOne({ role: 'SUPER_ADMIN' });
  if (existing) {
    console.log('Seed already applied');
    process.exit(0);
  }

  const superAdminPassword = 'SuperAdmin123!';
  const passwordHash = await bcrypt.hash(superAdminPassword, 10);
  const tenant = await Tenant.create({
    name: 'SimpleID',
    tenantSlug: 'simpleid',
    status: 'active',
    planTier: 'enterprise',
  });

  const superAdmin = await User.create({
    tenantId: tenant._id,
    email: 'superadmin@sentinelbrand.cloud',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    passwordHash,
  });

  console.log('Seed complete');
  console.log(`SUPER_ADMIN email: ${superAdmin.email}`);
  console.log(`SUPER_ADMIN password: ${superAdminPassword}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
