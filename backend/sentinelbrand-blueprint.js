/*
  SentinelBrand Cloud - Backend Blueprint (Simulation-Ready)
  Purpose: Provide build-ready Mongoose schemas + core middlewares for multi-tenant isolation.
*/

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ------------------------------
// Utils
// ------------------------------
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildResponse({ success, data = null, error = null, requestId = null }) {
  return { success, data, error, requestId };
}

// ------------------------------
// Schemas
// ------------------------------
const LogoAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    version: { type: Number, required: true },
    hash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activeVersion: { type: Boolean, default: false },
  },
  { _id: false }
);

const VerificationHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
  },
  { _id: false }
);

const PhoneNumberSchema = new Schema(
  {
    number: { type: String, required: true },
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    history: { type: [VerificationHistorySchema], default: [] },
  },
  { _id: false }
);

const EmailDomainSchema = new Schema(
  {
    domain: { type: String, required: true },
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    history: { type: [VerificationHistorySchema], default: [] },
  },
  { _id: false }
);

const SenderIdentitySchema = new Schema(
  {
    sender: { type: String, required: true },
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    history: { type: [VerificationHistorySchema], default: [] },
  },
  { _id: false }
);

const TenantSchema = new Schema(
  {
    name: { type: String, required: true },
    tenantSlug: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => slugRegex.test(v),
        message: 'Invalid slug format',
      },
      index: true,
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    planTier: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'starter',
    },
    brand: {
      logoAssets: { type: [LogoAssetSchema], default: [] },
      theme: {
        primary: { type: String, default: '#0B5FFF' },
        accent: { type: String, default: '#00BFA6' },
        mode: { type: String, enum: ['light', 'dark'], default: 'light' },
        typography: {
          heading: { type: String },
          body: { type: String },
        },
      },
    },
    verifiedAssets: {
      phoneNumbers: { type: [PhoneNumberSchema], default: [] },
      emailDomains: { type: [EmailDomainSchema], default: [] },
      senderIdentities: { type: [SenderIdentitySchema], default: [] },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TenantSchema.index({ tenantSlug: 1 }, { unique: true });

const UserSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v) => emailRegex.test(v),
        message: 'Invalid email',
      },
    },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'CLIENT_USER'],
      required: true,
    },
    permissions: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    mustResetPassword: { type: Boolean, default: false },
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const CommunicationLogSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    channel: { type: String, enum: ['voice', 'sms', 'email'], required: true },
    senderIdentityRef: { type: String, required: true },
    recipient: { type: String, required: true },
    campaignTag: { type: String },
    spamScore: { type: Number, min: 0, max: 100 },
    answerRate: { type: Number, min: 0, max: 1 },
    deliveryStatus: { type: String, required: true },
    occurredAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CommunicationLogSchema.index({ tenantId: 1, occurredAt: -1 });
CommunicationLogSchema.index({ tenantId: 1, channel: 1, occurredAt: -1 });

const RequestAssessmentSchema = new Schema(
  {
    company: { type: String, required: true },
    domain: { type: String, required: true },
    phone: { type: String, required: true },
    industry: { type: String, required: true },
    volume: { type: String, required: true },
    reason: { type: String, required: true },
    reviewStatus: {
      type: String,
      enum: ['new', 'approved', 'rejected'],
      default: 'new',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

RequestAssessmentSchema.index({ reviewStatus: 1, createdAt: -1 });

// ------------------------------
// Middlewares
// ------------------------------
function authMiddleware(jwtVerifyFn) {
  return (req, res, next) => {
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

      const payload = jwtVerifyFn(token); // should throw if invalid
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
  };
}

function tenantResolver(tenantModel) {
  return async (req, res, next) => {
    try {
      const { tenantSlug } = req.params;
      if (!tenantSlug || !slugRegex.test(tenantSlug)) {
        return res.status(400).json(
          buildResponse({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Invalid tenant slug' },
            requestId: req.id,
          })
        );
      }

      const tenant = await tenantModel.findOne({ tenantSlug }).select('_id tenantSlug status');
      if (!tenant || tenant.status !== 'active') {
        return res.status(404).json(
          buildResponse({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Tenant not found' },
            requestId: req.id,
          })
        );
      }

      req.tenant = { tenantId: tenant._id.toString(), tenantSlug: tenant.tenantSlug };
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

function gatekeeper(requiredPermissions = []) {
  return (req, res, next) => {
    if (!req.user || !req.tenant) {
      return res.status(401).json(
        buildResponse({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Missing auth context' },
          requestId: req.id,
        })
      );
    }

    if (req.user.tenantId !== req.tenant.tenantId) {
      return res.status(403).json(
        buildResponse({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Tenant mismatch' },
          requestId: req.id,
        })
      );
    }

    if (requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every((p) => req.user.permissions.includes(p));
      if (!hasAll) {
        return res.status(403).json(
          buildResponse({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
            requestId: req.id,
          })
        );
      }
    }

    return next();
  };
}

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

module.exports = {
  models: {
    Tenant: mongoose.model('Tenant', TenantSchema),
    User: mongoose.model('User', UserSchema),
    CommunicationLog: mongoose.model('CommunicationLog', CommunicationLogSchema),
    RequestAssessment: mongoose.model('RequestAssessment', RequestAssessmentSchema),
  },
  middlewares: {
    authMiddleware,
    tenantResolver,
    gatekeeper,
    errorHandler,
  },
  utils: {
    buildResponse,
  },
};
