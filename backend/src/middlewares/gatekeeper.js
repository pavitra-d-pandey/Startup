const { buildResponse } = require('../utils/response');

function gatekeeper(requiredPermissions = []) {
  return (req, res, next) => {
    if (!req.user || !req.tenant) {
      return res.status(401).json(
        buildResponse({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing auth context' },
          requestId: req.id,
        })
      );
    }

    if (req.user.tenantId !== req.tenant.tenantId) {
      return res.status(403).json(
        buildResponse({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Tenant mismatch' },
          requestId: req.id,
        })
      );
    }

    if (requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every((p) => req.user.permissions.includes(p));
      if (!hasAll) {
        return res.status(403).json(
          buildResponse({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
            requestId: req.id,
          })
        );
      }
    }

    return next();
  };
}

module.exports = gatekeeper;
