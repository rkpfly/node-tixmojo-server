/**
 * Minimal MongoDB Connection Test
 * 
 * This is a bare-bones script to test MongoDB connection without
 * any additional configurations or abstractions.
 */

// Load environment variables
require('dotenv').config();

// Import only MongoClient
const { MongoClient } = require('mongodb');

async function testConnection() {
  // Get MongoDB URI directly
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not set in environment variables');
    process.exit(1);
  }
  
  console.log('Testing connection with URI:', uri);

  // Create a new client with minimal options
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    authSource: 'admin',
    directConnection: true
  });
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    console.log('Successfully connected to MongoDB!');
    
    // Get database reference
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // Test a simple command
    const result = await db.command({ ping: 1 });
    console.log('Ping test result:', result);
    
    console.log('MongoDB connection test successful!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    
    // Print more detailed error information
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.codeName) {
      console.error('Error code name:', error.codeName);
    }
  } finally {
    try {
      // Close the MongoDB connection
      await client.close();
      console.log('Connection closed');
    } catch (err) {
      console.error('Error while closing connection:', err);
    }
    process.exit(0);
  }
}

// Run the test
console.log('=== Minimal MongoDB Connection Test ===');
testConnection().catch(console.error);