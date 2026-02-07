const { buildResponse } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      return res.status(400).json(
        buildResponse({
          success: false,
          error: { code: 'VALIDATION_ERROR', message },
          requestId: req.id,
        })
      );
    }
    req.validated = result.data;
    return next();
  };
}

module.exports = validate;
