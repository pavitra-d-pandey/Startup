const mongoose = require('mongoose');
const { Schema } = mongoose;

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

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);
