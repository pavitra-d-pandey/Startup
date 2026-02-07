const mongoose = require('mongoose');
const { Schema } = mongoose;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

module.exports = mongoose.model('User', UserSchema);
