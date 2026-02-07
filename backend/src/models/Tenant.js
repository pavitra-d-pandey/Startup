const mongoose = require('mongoose');
const { Schema } = mongoose;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

module.exports = mongoose.model('Tenant', TenantSchema);
