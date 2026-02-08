const crypto = require('crypto');
const AiModel = require('../models/AiModel');
const AiTrainingSample = require('../models/AiTrainingSample');

const MODEL_KEY = 'risk-guard-v1';

const DEFAULT_WEIGHTS = {
  bias: -0.2,
  linkCount: 0.9,
  spamWordRate: 1.2,
  capsRatio: 0.8,
  exclamations: 0.5,
  lengthRatio: 0.3,
  timeRisk: 0.6,
  complaintRate: 2.2,
  bounceRate: 1.4,
  replyRate: -1.1,
  optInAgeRatio: -0.7,
  channelRisk: 0.8,
};

const TRUE_WEIGHTS = {
  bias: -0.4,
  linkCount: 1.1,
  spamWordRate: 1.4,
  capsRatio: 0.9,
  exclamations: 0.6,
  lengthRatio: 0.35,
  timeRisk: 0.7,
  complaintRate: 2.4,
  bounceRate: 1.5,
  replyRate: -1.2,
  optInAgeRatio: -0.8,
  channelRisk: 0.9,
};

const MODEL_STATE = {
  weights: { ...DEFAULT_WEIGHTS },
  trainedAt: null,
  samples: 0,
  version: 1,
  seed: crypto.randomBytes(6).toString('hex'),
  loaded: false,
};

const SPAM_WORDS = [
  'free',
  'urgent',
  'winner',
  'cash',
  'limited',
  'act now',
  'click',
  'guaranteed',
  'risk-free',
  'exclusive',
  'offer',
  'deal',
  'promo',
];

const CHANNEL_RISK = {
  voice: 0.2,
  sms: 0.35,
  email: 0.15,
};

let trainerHandle = null;

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function loadModel() {
  if (MODEL_STATE.loaded) return MODEL_STATE;
  const existing = await AiModel.findOne({ key: MODEL_KEY });
  if (existing) {
    MODEL_STATE.weights = existing.weights || { ...DEFAULT_WEIGHTS };
    MODEL_STATE.trainedAt = existing.trainedAt;
    MODEL_STATE.samples = existing.samples || 0;
    MODEL_STATE.version = existing.version || 1;
  } else {
    await AiModel.create({
      key: MODEL_KEY,
      version: MODEL_STATE.version,
      samples: MODEL_STATE.samples,
      trainedAt: MODEL_STATE.trainedAt,
      weights: MODEL_STATE.weights,
    });
  }
  MODEL_STATE.loaded = true;
  return MODEL_STATE;
}

async function persistModel() {
  await AiModel.updateOne(
    { key: MODEL_KEY },
    {
      $set: {
        version: MODEL_STATE.version,
        samples: MODEL_STATE.samples,
        trainedAt: MODEL_STATE.trainedAt,
        weights: MODEL_STATE.weights,
      },
    }
  );
}

function extractFeatures({ channel, message, sendAt, recipientStats }) {
  const text = (message || '').toString();
  const lower = text.toLowerCase();
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  const alpha = text.match(/[a-zA-Z]/g) || [];
  const upper = text.match(/[A-Z]/g) || [];
  const capsRatio = alpha.length ? upper.length / alpha.length : 0;
  const spamMatches = SPAM_WORDS.reduce((count, word) => (lower.includes(word) ? count + 1 : count), 0);
  const spamWordRate = clamp(spamMatches / 5, 0, 1);
  const lengthRatio = clamp(text.length / 500, 0, 1);

  let timeRisk = 0.25;
  if (sendAt) {
    const hour = new Date(sendAt).getHours();
    timeRisk = hour < 8 || hour > 20 ? 0.9 : hour < 10 || hour > 18 ? 0.6 : 0.2;
  }

  const stats = recipientStats || {};
  const complaintRate = clamp(stats.complaintRate ?? 0.01, 0, 1);
  const bounceRate = clamp(stats.bounceRate ?? 0.02, 0, 1);
  const replyRate = clamp(stats.replyRate ?? 0.18, 0, 1);
  const optInAgeRatio = clamp((stats.optInAgeDays ?? 60) / 365, 0, 1);
  const channelRisk = CHANNEL_RISK[channel] ?? 0.3;

  return {
    linkCount,
    spamWordRate,
    capsRatio,
    exclamations: clamp(exclamations / 6, 0, 1),
    lengthRatio,
    timeRisk,
    complaintRate,
    bounceRate,
    replyRate,
    optInAgeRatio,
    channelRisk,
  };
}

function scoreWithWeights(features, weights) {
  const z =
    weights.bias +
    features.linkCount * weights.linkCount +
    features.spamWordRate * weights.spamWordRate +
    features.capsRatio * weights.capsRatio +
    features.exclamations * weights.exclamations +
    features.lengthRatio * weights.lengthRatio +
    features.timeRisk * weights.timeRisk +
    features.complaintRate * weights.complaintRate +
    features.bounceRate * weights.bounceRate +
    features.replyRate * weights.replyRate +
    features.optInAgeRatio * weights.optInAgeRatio +
    features.channelRisk * weights.channelRisk;
  return sigmoid(z);
}

function buildRecommendation(features) {
  const tips = [];
  if (features.spamWordRate > 0.4) tips.push('Reduce promotional keywords and aggressive urgency.');
  if (features.linkCount > 1) tips.push('Limit to one link and avoid link shorteners.');
  if (features.capsRatio > 0.25) tips.push('Lower capitalization to reduce spam signals.');
  if (features.exclamations > 0.4) tips.push('Reduce exclamation marks.');
  if (features.timeRisk > 0.7) tips.push('Shift sends to business hours.');
  if (features.complaintRate > 0.05) tips.push('Suppress users with recent complaints.');
  if (features.bounceRate > 0.08) tips.push('Clean the list before sending.');
  if (features.replyRate < 0.1) tips.push('Test a softer CTA to improve engagement.');
  if (features.optInAgeRatio < 0.2) tips.push('Use fresh opt-ins or re-consent older users.');
  return tips.length ? tips : ['Looks safe. Proceed with current message.'];
}

function riskBand(score) {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

async function scoreMessage(payload) {
  await loadModel();
  const features = extractFeatures(payload);
  const probability = scoreWithWeights(features, MODEL_STATE.weights);
  const score = Math.round(probability * 100);
  const band = riskBand(probability);
  const decision = probability >= 0.65 ? 'block' : probability >= 0.45 ? 'review' : 'allow';
  const recommendations = buildRecommendation(features);

  return {
    score,
    band,
    decision,
    recommendations,
    features,
    model: {
      version: MODEL_STATE.version,
      trainedAt: MODEL_STATE.trainedAt,
      samples: MODEL_STATE.samples,
    },
  };
}

function generateSyntheticSample() {
  const features = {
    linkCount: Math.random() > 0.7 ? 2 : Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 1 : 0,
    spamWordRate: Math.random(),
    capsRatio: Math.random(),
    exclamations: Math.random(),
    lengthRatio: Math.random(),
    timeRisk: Math.random(),
    complaintRate: Math.random() * 0.2,
    bounceRate: Math.random() * 0.15,
    replyRate: Math.random() * 0.5,
    optInAgeRatio: Math.random(),
    channelRisk: [0.2, 0.35, 0.15][Math.floor(Math.random() * 3)],
  };

  const noise = (Math.random() - 0.5) * 0.3;
  const probability = scoreWithWeights(features, TRUE_WEIGHTS) + noise;
  const label = probability > 0.5 ? 1 : 0;
  return { features, label };
}

async function appendSyntheticSamples(count = 200) {
  const docs = [];
  for (let i = 0; i < count; i += 1) {
    const sample = generateSyntheticSample();
    docs.push({ features: sample.features, label: sample.label, source: 'synthetic' });
  }
  if (docs.length) {
    await AiTrainingSample.insertMany(docs);
  }
  return docs.length;
}

function trainOnSamples(samples, learningRate = 0.08) {
  const weights = { ...MODEL_STATE.weights };

  for (const sample of samples) {
    const pred = scoreWithWeights(sample.features, weights);
    const error = pred - sample.label;

    weights.bias -= learningRate * error;
    weights.linkCount -= learningRate * error * sample.features.linkCount;
    weights.spamWordRate -= learningRate * error * sample.features.spamWordRate;
    weights.capsRatio -= learningRate * error * sample.features.capsRatio;
    weights.exclamations -= learningRate * error * sample.features.exclamations;
    weights.lengthRatio -= learningRate * error * sample.features.lengthRatio;
    weights.timeRisk -= learningRate * error * sample.features.timeRisk;
    weights.complaintRate -= learningRate * error * sample.features.complaintRate;
    weights.bounceRate -= learningRate * error * sample.features.bounceRate;
    weights.replyRate -= learningRate * error * sample.features.replyRate;
    weights.optInAgeRatio -= learningRate * error * sample.features.optInAgeRatio;
    weights.channelRisk -= learningRate * error * sample.features.channelRisk;
  }

  MODEL_STATE.weights = weights;
  MODEL_STATE.trainedAt = new Date();
  MODEL_STATE.samples += samples.length;
  MODEL_STATE.version += 1;
}

async function trainSyntheticModel({ iterations = 4000, learningRate = 0.08 } = {}) {
  await loadModel();
  const batch = [];
  for (let i = 0; i < iterations; i += 1) {
    const sample = generateSyntheticSample();
    batch.push(sample);
  }
  trainOnSamples(batch, learningRate);
  await persistModel();
  return getModelStatus();
}

async function trainFromStoredSamples({ limit = 500, learningRate = 0.06 } = {}) {
  await loadModel();
  const samples = await AiTrainingSample.find().sort({ createdAt: -1 }).limit(limit).lean();
  if (!samples.length) return getModelStatus();
  trainOnSamples(samples, learningRate);
  await persistModel();
  return getModelStatus();
}

async function submitFeedback({ tenantId, features, label, source = 'feedback' }) {
  await AiTrainingSample.create({ tenantId, features, label, source });
}

async function startTrainer({ intervalMs = 5 * 60 * 1000, syntheticBatch = 200 } = {}) {
  if (trainerHandle) return;
  await loadModel();
  trainerHandle = setInterval(async () => {
    try {
      await appendSyntheticSamples(syntheticBatch);
      await trainFromStoredSamples({ limit: 800, learningRate: 0.05 });
    } catch (err) {
      console.error('AI trainer error', err);
    }
  }, intervalMs);
}

function stopTrainer() {
  if (trainerHandle) clearInterval(trainerHandle);
  trainerHandle = null;
}

function getModelStatus() {
  return {
    trainedAt: MODEL_STATE.trainedAt,
    samples: MODEL_STATE.samples,
    version: MODEL_STATE.version,
    seed: MODEL_STATE.seed,
    weights: MODEL_STATE.weights,
  };
}

module.exports = {
  scoreMessage,
  trainSyntheticModel,
  trainFromStoredSamples,
  submitFeedback,
  startTrainer,
  stopTrainer,
  getModelStatus,
};
