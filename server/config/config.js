require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB connection string
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bytelearn_study_tracker',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'bytelearn_default_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE || '7')
  },
  
  // Email configuration for password reset
  email: {
    service: process.env.EMAIL_SERVICE,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@bytelearn.com'
  }
};