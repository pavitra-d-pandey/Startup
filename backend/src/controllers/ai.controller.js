const { scoreMessage, trainSyntheticModel, getModelStatus, submitFeedback } = require('../services/ai.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');

async function scoreController(req, res, next) {
  try {
    const payload = {
      channel: req.body?.channel,
      message: req.body?.message,
      sendAt: req.body?.sendAt,
      recipientStats: req.body?.recipientStats,
    };
    const data = scoreMessage(payload);
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'AI_SCORE',
      metadata: { band: data.band, decision: data.decision },
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function trainController(req, res, next) {
  try {
    const rawIterations = Number(req.body?.iterations || 4000);
    const iterations = Math.max(1000, Math.min(20000, rawIterations));
    const learningRate = Number(req.body?.learningRate || 0.08);
    const data = trainSyntheticModel({ iterations, learningRate });
    await auditLog({
      tenantId: req.tenant.tenantId,
      actorId: req.user.userId,
      action: 'AI_TRAIN',
      metadata: { iterations, learningRate, version: data.version },
      requestId: req.id,
    });
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function statusController(req, res, next) {
  try {
    const data = getModelStatus();
    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function feedbackController(req, res, next) {
  try {
    const { features, label, source } = req.body || {};
    if (!features || typeof label !== 'number') {
      return res.status(400).json(
        buildResponse({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Missing features or label' },
          requestId: req.id,
        })
      );
    }
    await submitFeedback({ tenantId: req.tenant.tenantId, features, label, source });
    return res.json(buildResponse({ success: true, data: { ok: true }, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { scoreController, trainController, statusController, feedbackController };
