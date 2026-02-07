const { z } = require('zod');

const requestAccessSchema = z.object({
  company: z.string().min(2),
  domain: z.string().min(3),
  phone: z.string().min(7),
  email: z.string().email(),
  industry: z.string().min(2),
  volume: z.string().min(1),
  reason: z.string().min(5),
});

module.exports = { requestAccessSchema };
