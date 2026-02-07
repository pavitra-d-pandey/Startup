const { listAssets, addAsset, activateAsset } = require('../services/assets.service');
const { getSignature } = require('../services/cloudinary.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');

async function listAssetsController(req, res, next) {
  try {
    const assets = await listAssets(req.tenant.tenantId);
    return res.json(buildResponse({ success: true, data: assets, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function getUploadSignature(req, res, next) {
  try {
    const { folder = 'sentinelbrand/logos', publicId = undefined } = req.body || {};
    const data = getSignature({ folder, publicId });
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function addAssetController(req, res, next) {
  try {
    const assetPayload = {
      publicId: req.body.publicId,
      url: req.body.url,
      hash: req.body.hash,
      createdBy: req.user.userId,
    };
    const asset = await addAsset({ tenantId: req.tenant.tenantId, asset: assetPayload });
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'ASSET_UPLOAD',
      target: asset?.publicId,
      requestId: req.id,
    });
    return res.status(201).json(buildResponse({ success: true, data: asset, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function activateAssetController(req, res, next) {
  try {
    const version = Number(req.params.version);
    const asset = await activateAsset({ tenantId: req.tenant.tenantId, version });
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'ASSET_VERSION_ROLLBACK',
      target: `version:${version}`,
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data: asset, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listAssetsController,
  getUploadSignature,
  addAssetController,
  activateAssetController,
};
