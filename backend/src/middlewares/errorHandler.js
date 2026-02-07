const { buildResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  return res.status(status).json(
    buildResponse({
      success: false,
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Unexpected error' },
      requestId: req.id,
    })
  );
}

module.exports = errorHandler;
