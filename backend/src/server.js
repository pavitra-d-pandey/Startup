const app = require('./app');
const { connectDb } = require('./config/db');
const env = require('./config/env');

async function start() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`SentinelBrand API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
