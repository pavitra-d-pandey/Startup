const cloudinary = require('cloudinary').v2;
const env = require('../config/env');

if (env.cloudinary.url) {
  cloudinary.config({ url: env.cloudinary.url });
} else {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

function getSignature({ folder, publicId }) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder, public_id: publicId };
  const signature = cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret || '');
  return { timestamp, signature, apiKey: env.cloudinary.apiKey, cloudName: env.cloudinary.cloudName };
}

module.exports = { getSignature };
