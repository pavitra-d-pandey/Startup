const { buildResponse } = require('../utils/response');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json(
        buildResponse({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Role not permitted' },
          requestId: req.id,
        })
      );
    }
    return next();
  };
}

module.exports = requireRole;
