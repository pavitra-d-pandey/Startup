const app = require('./app');
const { connectDb } = require('./config/db');
const env = require('./config/env');
const { startTrainer } = require('./services/ai.service');

async function start() {
  await connectDb();
  await startTrainer();
  app.listen(env.port, () => {
    console.log(`SentinelBrand API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
