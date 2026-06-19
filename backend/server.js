const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

require('./models'); // initialize associations
require('./services/cronService');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/test-email', require('./routes/testEmail'));

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}).catch(err => { console.error('DB connection error:', err.message); process.exit(1); });
