const Tenant = require('../models/Tenant');

async function listVerification(tenantId) {
  const tenant = await Tenant.findById(tenantId).select('verifiedAssets');
  return tenant?.verifiedAssets || {};
}

async function addPhoneNumber(tenantId, number) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  tenant.verifiedAssets.phoneNumbers.push({ number, status: 'pending', history: [] });
  await tenant.save();
  return tenant.verifiedAssets.phoneNumbers;
}

async function addEmailDomain(tenantId, domain) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  tenant.verifiedAssets.emailDomains.push({ domain, status: 'pending', history: [] });
  await tenant.save();
  return tenant.verifiedAssets.emailDomains;
}

async function addSenderIdentity(tenantId, sender) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  tenant.verifiedAssets.senderIdentities.push({ sender, status: 'pending', history: [] });
  await tenant.save();
  return tenant.verifiedAssets.senderIdentities;
}

async function updateVerificationStatus(tenantId, type, index, status, actorId, reason) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  let list;
  if (type === 'phone') list = tenant.verifiedAssets.phoneNumbers;
  if (type === 'email') list = tenant.verifiedAssets.emailDomains;
  if (type === 'sender') list = tenant.verifiedAssets.senderIdentities;
  if (!list || !list[index]) return null;
  list[index].status = status;
  list[index].history.push({ status, changedBy: actorId, reason });
  await tenant.save();
  return list[index];
}

module.exports = {
  listVerification,
  addPhoneNumber,
  addEmailDomain,
  addSenderIdentity,
  updateVerificationStatus,
};
