const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');

// Initialize express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security, CORS, and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// MongoDB Connection
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/streaks', require('./routes/streak.routes'));
app.use('/api/achievements', require('./routes/achievement.routes'));
app.use('/api/connections', require('./routes/connection.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Base route for API health check
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to ByteLearn Study Tracker API' });
});

// Serve static assets in production
if (config.nodeEnv === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route that is not an API route will serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});