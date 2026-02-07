const { login } = require('../services/auth.service');
const Tenant = require('../models/Tenant');
const { buildResponse } = require('../utils/response');

async function loginController(req, res, next) {
  try {
    const { email, password } = req.validated;
    const result = await login({ email, password });
    if (!result) {
      return res.status(401).json(
        buildResponse({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
          requestId: req.id,
        })
      );
    }

    const { user, token } = result;
    const tenant = await Tenant.findById(user.tenantId).select('tenantSlug');
    return res.json(
      buildResponse({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            mustResetPassword: user.mustResetPassword,
            tenantSlug: tenant?.tenantSlug,
          },
        },
        requestId: req.id,
      })
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { loginController };
