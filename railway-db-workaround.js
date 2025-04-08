/**
 * Railway MongoDB Workaround
 * 
 * This file contains direct MongoDB connection code for Railway.
 * It's a simplified approach to connect to MongoDB on Railway with minimal dependencies.
 * 
 * Usage: Replace the db.js file with this one for Railway deployment.
 */

const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

// In-memory client cache to avoid creating new connections
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<{client: MongoClient, db: any}>} MongoDB client and database objects
 */
async function connectToDatabase() {
  // If we already have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  console.log('[Railway Workaround] Connecting to MongoDB...');

  // Create a new client with minimal options
  const client = new MongoClient(MONGODB_URI, {
    // Simplified connection options
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    authSource: 'admin',
    directConnection: true
  });

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('[Railway Workaround] Successfully connected to MongoDB!');

    // Get the database
    const db = client.db();
    console.log(`[Railway Workaround] Using database: ${db.databaseName}`);

    // Cache the client and db for reuse
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    // Log the error details for debugging
    console.error('[Railway Workaround] MongoDB connection error:', error.message);
    
    // Check for specific error cases and provide clearer messages
    if (error.code === 18 || error.codeName === 'AuthenticationFailed') {
      console.error('[Railway Workaround] Authentication failed. Check your username and password.');
      throw new Error(`MongoDB authentication failed: ${error.message}`);
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('[Railway Workaround] Could not connect to MongoDB server. Check hostname and port.');
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
    
    // Re-throw the error for handling upstream
    throw error;
  }
}

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>} True if the connection is healthy
 */
async function checkDatabaseConnection() {
  let client = null;
  
  try {
    const connection = await connectToDatabase();
    client = connection.client;
    
    // Ping the database to check connection
    await connection.db.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('[Railway Workaround] Database health check failed:', error.message);
    return false;
  }
}

// Export the functions
module.exports = {
  connectToDatabase,
  checkDatabaseConnection
};