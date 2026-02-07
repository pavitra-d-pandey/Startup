const jwt = require('jsonwebtoken');
const { buildResponse } = require('../utils/response');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json(
        buildResponse({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing token' },
          requestId: req.id,
        })
      );
    }

    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      permissions: payload.permissions || [],
    };

    return next();
  } catch (err) {
    return res.status(401).json(
      buildResponse({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
        requestId: req.id,
      })
    );
  }
}

module.exports = authMiddleware;
