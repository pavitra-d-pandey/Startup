const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const transport = getTransporter();
  if (!env.smtp.host) {
    // In local dev, just log
    return { preview: { to, subject, text } };
  }
  return transport.sendMail({ from: env.smtp.fromEmail, to, subject, text });
}

module.exports = { sendEmail };
