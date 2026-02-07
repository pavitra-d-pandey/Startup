const Tenant = require('../models/Tenant');
const { buildResponse } = require('../utils/response');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function tenantResolver(req, res, next) {
  try {
    const { tenantSlug } = req.params;
    if (!tenantSlug || !slugRegex.test(tenantSlug)) {
      return res.status(400).json(
        buildResponse({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid tenant slug' },
          requestId: req.id,
        })
      );
    }

    const tenant = await Tenant.findOne({ tenantSlug }).select('_id tenantSlug status');
    if (!tenant || tenant.status !== 'active') {
      return res.status(404).json(
        buildResponse({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Tenant not found' },
          requestId: req.id,
        })
      );
    }

    req.tenant = { tenantId: tenant._id.toString(), tenantSlug: tenant.tenantSlug };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = tenantResolver;
