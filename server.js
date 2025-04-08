const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const logger = require('./middleware/logger');
const eventRoutes = require('./routes/eventRoutes');
const dataRoutes = require('./routes/dataRoutes');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers

// Configure CORS to allow access from all origins in development
// In production, you would specify exact origins for security
const corsOptions = {
  origin: true, // Allow all origins for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
};
app.use(cors(corsOptions)); // Enable CORS with options

app.use(express.json()); // Parse JSON requests
app.use(morgan('dev')); // HTTP request logger
app.use(logger); // Custom logger

// Routes
app.use('/api/events', eventRoutes);
app.use('/getData', dataRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/events`);
  console.log(`MongoDB endpoint available at http://localhost:${PORT}/getData`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  
  // Close server
  server.close(() => {
    console.log('Server shut down complete');
    process.exit(0);
  });
});