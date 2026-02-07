const Tenant = require('../models/Tenant');

async function listAssets(tenantId) {
  const tenant = await Tenant.findById(tenantId).select('brand.logoAssets');
  return tenant?.brand?.logoAssets || [];
}

async function addAsset({ tenantId, asset }) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;

  const nextVersion = (tenant.brand.logoAssets?.length || 0) + 1;
  const newAsset = {
    ...asset,
    version: nextVersion,
    activeVersion: true,
  };

  // deactivate previous
  tenant.brand.logoAssets = (tenant.brand.logoAssets || []).map((a) => ({
    ...a.toObject(),
    activeVersion: false,
  }));

  tenant.brand.logoAssets.push(newAsset);
  await tenant.save();
  return newAsset;
}

async function activateAsset({ tenantId, version }) {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  tenant.brand.logoAssets = (tenant.brand.logoAssets || []).map((a) => ({
    ...a.toObject(),
    activeVersion: a.version === version,
  }));
  await tenant.save();
  return tenant.brand.logoAssets.find((a) => a.version === version);
}

module.exports = { listAssets, addAsset, activateAsset };
