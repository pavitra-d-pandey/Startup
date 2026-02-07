const RequestAssessment = require('../models/RequestAssessment');

async function createRequest(payload) {
  return RequestAssessment.create(payload);
}

async function listRequests() {
  return RequestAssessment.find().sort({ createdAt: -1 });
}

async function updateRequest(id, updates) {
  return RequestAssessment.findByIdAndUpdate(id, updates, { new: true });
}

module.exports = { createRequest, listRequests, updateRequest };
