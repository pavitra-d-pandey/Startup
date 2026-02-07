const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { listRequests, updateRequest } = require('../services/requestAccess.service');
const { buildResponse } = require('../utils/response');
const { auditLog } = require('../utils/audit');
const CommunicationLog = require('../models/CommunicationLog');
const ReputationFlag = require('../models/ReputationFlag');
const env = require('../config/env');
const jwt = require('jsonwebtoken');

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uniqueSlug(base) {
  let slug = base;
  let i = 1;
  while (await Tenant.findOne({ tenantSlug: slug })) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

async function seedTenantData(tenantId) {
  const sampleLogs = [
    { channel: 'voice', recipient: '+1-212-555-0101', spamScore: 8, answerRate: 0.62, deliveryStatus: 'completed' },
    { channel: 'sms', recipient: '+1-415-555-0199', spamScore: 14, answerRate: 0.78, deliveryStatus: 'delivered' },
    { channel: 'email', recipient: 'ops@customer.com', spamScore: 4, answerRate: 0.92, deliveryStatus: 'delivered' },
  ];
  await CommunicationLog.insertMany(
    sampleLogs.map((item) => ({
      tenantId,
      senderIdentityRef: 'seed',
      campaignTag: 'onboarding',
      occurredAt: new Date(),
      metadata: {},
      ...item,
    }))
  );
  await ReputationFlag.insertMany([
    { tenantId, phoneNumber: '+1-212-555-0101', status: 'clean', history: [] },
    { tenantId, phoneNumber: '+1-415-555-0199', status: 'flagged', history: [{ status: 'flagged', evidence: 'Carrier report', source: 'seed' }] },
  ]);
}

async function listRequestsController(req, res, next) {
  try {
    const requests = await listRequests();
    return res.json(buildResponse({ success: true, data: requests, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

async function approveRequestController(req, res, next) {
  try {
    const { requestId } = req.params;
    const { planTier = 'starter' } = req.body;
    const reviewer =
      req.user?.userId && req.user.userId !== 'secret-admin' ? req.user.userId : undefined;
    const request = await updateRequest(requestId, {
      reviewStatus: 'approved',
      reviewedBy: reviewer,
    });
    if (!request) {
      return res.status(404).json(
        buildResponse({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Request not found' },
          requestId: req.id,
        })
      );
    }

    const baseSlug = slugify(request.company);
    const tenantSlug = await uniqueSlug(baseSlug);
    const creator =
      req.user?.userId && req.user.userId !== 'secret-admin' ? req.user.userId : undefined;
    const tenant = await Tenant.create({
      name: request.company,
      tenantSlug,
      status: 'active',
      planTier,
      createdBy: creator,
    });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const adminEmail =
      request.email || (request.domain ? `admin@${request.domain}` : undefined);
    if (!adminEmail) {
      return res.status(400).json(
        buildResponse({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Request missing admin email' },
          requestId: req.id,
        })
      );
    }

    const adminUser = await User.create({
      tenantId: tenant._id,
      email: adminEmail,
      name: `${request.company} Admin`,
      role: 'CLIENT_ADMIN',
      passwordHash,
      mustResetPassword: true,
    });
    await seedTenantData(tenant._id);

    await auditLog({
      tenantId: tenant._id,
      actorId: req.user.userId,
      action: 'TENANT_CREATE',
      target: tenant.tenantSlug,
      requestId: req.id,
    });

    return res.json(
      buildResponse({
        success: true,
        data: {
          tenantId: tenant._id,
          tenantSlug: tenant.tenantSlug,
          adminUserId: adminUser._id,
          adminEmail: adminUser.email,
          contactPhone: request.phone,
          tempPassword,
        },
        requestId: req.id,
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function rejectRequestController(req, res, next) {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const reviewer =
      req.user?.userId && req.user.userId !== 'secret-admin' ? req.user.userId : undefined;
    const request = await updateRequest(requestId, {
      reviewStatus: 'rejected',
      reviewedBy: reviewer,
      notes,
    });
    if (!request) {
      return res.status(404).json(
        buildResponse({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Request not found' },
          requestId: req.id,
        })
      );
    }
    return res.json(buildResponse({ success: true, data: request, requestId: req.id }));
  } catch (err) {
    return next(err);
  }
}

function secretAdminLogin(req, res) {
  const { password } = req.body || {};
  if (!password || password !== env.secretAdminPassword) {
    return res.status(401).json(
      buildResponse({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid password' },
        requestId: req.id,
      })
    );
  }

  const token = jwt.sign(
    {
      sub: 'secret-admin',
      tenantId: null,
      role: 'SUPER_ADMIN',
      permissions: [],
    },
    env.jwtSecret,
    { expiresIn: '6h' }
  );

  return res.json(
    buildResponse({
      success: true,
      data: { token },
      requestId: req.id,
    })
  );
}

module.exports = {
  listRequestsController,
  approveRequestController,
  rejectRequestController,
  secretAdminLogin,
};
