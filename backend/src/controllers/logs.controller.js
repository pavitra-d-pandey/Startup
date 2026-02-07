const { listLogs } = require('../services/logs.service');
const { buildResponse } = require('../utils/response');

async function listLogsController(req, res, next) {
  try {
    const { channel } = req.query;
    const filters = {};
    if (channel) filters.channel = channel;
    const logs = await listLogs(req.tenant.tenantId, filters);
    return res.json(buildResponse({ success: true, data: logs, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { listLogsController };
