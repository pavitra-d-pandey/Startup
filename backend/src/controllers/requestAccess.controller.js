const { createRequest } = require('../services/requestAccess.service');
const { buildResponse } = require('../utils/response');
const RequestAssessment = require('../models/RequestAssessment');

async function requestAccessController(req, res, next) {
  try {
    const exists = await RequestAssessment.findOne({
      reviewStatus: 'new',
      $or: [
        { email: req.validated.email },
        { domain: req.validated.domain },
        { company: req.validated.company },
      ],
    });
    if (exists) {
      return res.status(409).json(
        buildResponse({
          success: false,
          error: { code: 'DUPLICATE_REQUEST', message: 'Request already submitted' },
          requestId: req.id,
        })
      );
    }

    const request = await createRequest(req.validated);
    return res.status(201).json(
      buildResponse({
        success: true,
        data: { id: request._id },
        requestId: req.id,
      })
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { requestAccessController };
