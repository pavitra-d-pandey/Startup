const mongoose = require('mongoose');
const { Schema } = mongoose;

const RequestAssessmentSchema = new Schema(
  {
    company: { type: String, required: true },
    domain: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
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

module.exports = mongoose.model('RequestAssessment', RequestAssessmentSchema);
