function buildResponse({ success, data = null, error = null, requestId = null }) {
  return { success, data, error, requestId };
}

module.exports = { buildResponse };
