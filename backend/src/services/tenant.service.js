const Tenant = require('../models/Tenant');

async function getBrandingBySlug(tenantSlug) {
  return Tenant.findOne({ tenantSlug }).select('name tenantSlug brand');
}

async function updateBranding(tenantId, theme) {
  return Tenant.findByIdAndUpdate(
    tenantId,
    { $set: { 'brand.theme': theme } },
    { new: true }
  ).select('name tenantSlug brand');
}

module.exports = { getBrandingBySlug, updateBranding };
