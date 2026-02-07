const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReputationFlagSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['clean', 'flagged'], default: 'clean' },
    evidence: { type: String },
    source: { type: String },
    lastCheckedAt: { type: Date, default: Date.now },
    history: {
      type: [
        {
          status: { type: String, enum: ['clean', 'flagged'] },
          changedAt: { type: Date, default: Date.now },
          evidence: { type: String },
          source: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

ReputationFlagSchema.index({ tenantId: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('ReputationFlag', ReputationFlagSchema);
