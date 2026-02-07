const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const requestId = require('./middlewares/requestId');
const errorHandler = require('./middlewares/errorHandler');
const publicRoutes = require('./routes/public.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestId);
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', publicRoutes);
app.use('/api', adminRoutes);
app.use('/api', dashboardRoutes);

app.use(errorHandler);

module.exports = app;
