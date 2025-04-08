/**
 * Railway MongoDB Connection Helper
 * 
 * This utility provides helper functions for connecting to Railway MongoDB.
 * Railway MongoDB services provide environment variables in a specific format
 * that this utility helps parse and use.
 */

/**
 * Gets the MongoDB URI from Railway-provided environment variables
 * Railway provides MongoDB connection details in environment variables like:
 * - RAILWAY_MONGO_CONNECTION_STRING
 * - MONGOHQ_URL
 * - MONGOLAB_URI
 * - MONGODB_URI
 * 
 * @returns {string|null} The MongoDB URI or null if not found
 */
function getRailwayMongoURI() {
  // Railway provides one of these environment variables for MongoDB
  const possibleVars = [
    'RAILWAY_MONGO_CONNECTION_STRING',
    'MONGOHQ_URL',
    'MONGOLAB_URI',
    'MONGODB_URI'
  ];
  
  // Find the first available URI from environment variables
  for (const varName of possibleVars) {
    if (process.env[varName]) {
      return process.env[varName];
    }
  }
  
  // If none found, return null
  return null;
}

/**
 * Converts a Railway MongoDB URI to a properly formatted connection string
 * @param {string} uri - The raw MongoDB URI
 * @returns {string} The formatted MongoDB URI
 */
function formatRailwayMongoURI(uri) {
  if (!uri) return null;
  
  try {
    // If URI already has query parameters
    if (uri.includes('?')) {
      // Check if it already has authSource
      if (!uri.includes('authSource=')) {
        return `${uri}&authSource=admin`;
      }
      return uri;
    } else {
      // Add query parameter separator and authSource
      return `${uri}?authSource=admin`;
    }
  } catch (error) {
    console.error('Error formatting MongoDB URI:', error);
    return uri; // Return original in case of error
  }
}

/**
 * Gets MongoDB connection options optimized for Railway
 * @returns {object} MongoDB connection options
 */
function getRailwayMongoOptions() {
  return {
    connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 5000,
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 30000,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
    minPoolSize: 1,
    retryWrites: true,
    retryReads: true,
    directConnection: true, // Use direct connection for Railway
    authSource: 'admin'     // Use admin auth source for Railway MongoDB
  };
}

module.exports = {
  getRailwayMongoURI,
  formatRailwayMongoURI,
  getRailwayMongoOptions
};