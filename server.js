const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const Logger = require('./utils/logger');
const { connectToDatabase } = require('./utils/db');

// Route imports
const eventRoutes = require('./routes/eventRoutes');
const dataRoutes = require('./routes/dataRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const userRoutes = require('./routes/userRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const footerRoutes = require('./routes/footerRoutes');
const pagenotfoundRoutes = require('./routes/pagenotfound');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Configure middlewares
app.use(helmet()); // Security headers

// Configure CORS
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
};
app.use(cors(corsOptions));

// Body parser middlewares
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Static files
app.use('/public', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging
app.use(morgan('dev')); // HTTP request logger

// Connect to database
connectToDatabase()
  .then(() => {
    Logger.info('MongoDB connection established successfully');
  })
  .catch((err) => {
    Logger.error(`Database connection error: ${err.message}`);
  });

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/payments', stripeRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/users', userRoutes);
app.use('/getData', dataRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/page-not-found', pagenotfoundRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route tracing middleware for debugging
app.use((req, res, next) => {
  Logger.debug(`Route hit: ${req.method}:${req.originalUrl}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || 'Something went wrong';

  // Log the error
  Logger.error({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack
  });

  // Send response
  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start server
const server = app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
  Logger.info(`API available at http://localhost:${PORT}/api/events`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  Logger.info('Shutting down server gracefully...');

  // Close server connections
  server.close(() => {
    Logger.info('Server shut down complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    Logger.error('Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000);
});

module.exports = app;