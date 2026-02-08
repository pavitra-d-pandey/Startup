const mongoose = require('mongoose');
const { Schema } = mongoose;

const AiTrainingSampleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    features: { type: Schema.Types.Mixed, required: true },
    label: { type: Number, enum: [0, 1], required: true },
    source: { type: String, default: 'synthetic' },
  },
  { timestamps: true }
);

AiTrainingSampleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AiTrainingSample', AiTrainingSampleSchema);
