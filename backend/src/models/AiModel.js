const mongoose = require('mongoose');
const { Schema } = mongoose;

const AiModelSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    version: { type: Number, default: 1 },
    samples: { type: Number, default: 0 },
    trainedAt: { type: Date },
    weights: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiModel', AiModelSchema);
