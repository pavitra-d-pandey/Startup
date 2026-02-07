const Tenant = require('../models/Tenant');
const CommunicationLog = require('../models/CommunicationLog');
const ReputationFlag = require('../models/ReputationFlag');
const { buildResponse } = require('../utils/response');

async function overviewController(req, res, next) {
  try {
    const tenant = await Tenant.findById(req.tenant.tenantId).select('verifiedAssets');
    const logs = await CommunicationLog.find({ tenantId: req.tenant.tenantId }).limit(200);
    const flags = await ReputationFlag.find({ tenantId: req.tenant.tenantId, status: 'flagged' });

    const phone = tenant?.verifiedAssets?.phoneNumbers || [];
    const email = tenant?.verifiedAssets?.emailDomains || [];
    const sender = tenant?.verifiedAssets?.senderIdentities || [];

    const statusCount = (list, status) => list.filter((i) => i.status === status).length;

    const spamScores = logs.map((l) => l.spamScore || 0);
    const avgSpam = spamScores.length ? spamScores.reduce((a, b) => a + b, 0) / spamScores.length : 0;
    const avgAnswer = logs.length ? logs.reduce((a, b) => a + (b.answerRate || 0), 0) / logs.length : 0;

    const data = {
      verification: {
        phone: { total: phone.length, verified: statusCount(phone, 'verified'), pending: statusCount(phone, 'pending') },
        email: { total: email.length, verified: statusCount(email, 'verified'), pending: statusCount(email, 'pending') },
        sender: { total: sender.length, verified: statusCount(sender, 'verified'), pending: statusCount(sender, 'pending') },
      },
      reputation: {
        flaggedCount: flags.length,
      },
      communications: {
        total: logs.length,
        avgSpamScore: Number(avgSpam.toFixed(1)),
        avgAnswerRate: Number(avgAnswer.toFixed(2)),
      },
    };

    return res.json(buildResponse({ success: true, data, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { overviewController };
