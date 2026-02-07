const { getBrandingBySlug, updateBranding } = require('../services/tenant.service');
const { buildResponse } = require('../utils/response');

async function getBranding(req, res, next) {
  try {
    const { tenantSlug } = req.params;
    const tenant = await getBrandingBySlug(tenantSlug);
    if (!tenant) {
      return res.status(404).json(
        buildResponse({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tenant not found' },
          requestId: req.id,
        })
      );
    }
    return res.json(
      buildResponse({
        success: true,
        data: {
          name: tenant.name,
          tenantSlug: tenant.tenantSlug,
          brand: tenant.brand,
        },
        requestId: req.id,
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function updateBrandingController(req, res, next) {
  try {
    const updated = await updateBranding(req.tenant.tenantId, req.body.theme);
    return res.json(
      buildResponse({
        success: true,
        data: updated,
        requestId: req.id,
      })
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { getBranding, updateBrandingController };
