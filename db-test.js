/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB connection and provides detailed diagnostics
 * about any connection issues. It helps troubleshoot authentication errors
 * and connection problems.
 * 
 * Usage:
 * node db-test.js
 */

// Load environment variables
require('dotenv').config();

// Import MongoDB driver
const { MongoClient } = require('mongodb');

// Test various connection string formats
async function testConnection() {
  console.log('=== MongoDB Connection Test ===');
  console.log('Node.js version:', process.version);
  console.log('MongoDB driver version:', require('mongodb/package.json').version);
  console.log('Current working directory:', process.cwd());
  console.log('');
  
  // Get the connection string from .env
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }
  
  // Mask the connection string for logging
  const maskedUri = uri.replace(/(mongodb:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3');
  console.log('Connection string (masked):', maskedUri);
  
  // Parse the connection string to show components
  let components = {};
  try {
    // Extract connection components for analysis
    if (uri.includes('@')) {
      const [credentials, hostPart] = uri.replace('mongodb://', '').split('@');
      const [username, password] = credentials.split(':');
      let [hostPortDb, queryString] = hostPart.split('?');
      let [hostPort, database] = hostPortDb.split('/');
      let [host, port] = hostPort.split(':');
      
      components = {
        protocol: 'mongodb://',
        username,
        passwordLength: password ? password.length : 0,
        host,
        port,
        database,
        queryParams: queryString ? queryString.split('&').map(p => p.split('=')[0]) : []
      };
    }
    
    console.log('Connection components:', components);
  } catch (err) {
    console.log('Could not parse connection string:', err.message);
  }
  
  // Array of different connection options to try
  const connectionConfigs = [
    {
      name: 'Default Connection',
      uri: uri,
      options: { connectTimeoutMS: 5000 }
    },
    {
      name: 'With authSource=admin',
      uri: uri.includes('authSource=admin') ? uri : `${uri}${uri.includes('?') ? '&' : '?'}authSource=admin`,
      options: { connectTimeoutMS: 5000 }
    },
    {
      name: 'With directConnection=true',
      uri: uri.includes('directConnection=true') ? uri : `${uri}${uri.includes('?') ? '&' : '?'}directConnection=true`,
      options: { connectTimeoutMS: 5000 }
    },
    {
      name: 'With both authSource and directConnection',
      uri: `${uri.split('?')[0]}?authSource=admin&directConnection=true`,
      options: { connectTimeoutMS: 5000 }
    }
  ];
  
  // Try each connection configuration
  for (const config of connectionConfigs) {
    console.log(`\n🔄 Testing: ${config.name}`);
    console.log(`   URI: ${config.uri.replace(/(mongodb:\/\/[^:]+:)([^@]+)(@.+)/, '$1*****$3')}`);
    
    let client;
    try {
      // Create a MongoDB client with the configuration
      client = new MongoClient(config.uri, config.options);
      
      // Connect to MongoDB
      console.log('   Connecting...');
      await client.connect();
      
      // Get database handle and try a simple command
      const db = client.db();
      console.log(`   Connected to database: ${db.databaseName}`);
      
      // Test running a simple command
      const ping = await db.command({ ping: 1 });
      console.log('   Database ping result:', ping);
      
      console.log(`✅ SUCCESS: ${config.name} worked!`);
    } catch (error) {
      console.error(`❌ ERROR with ${config.name}:`, error.message);
      
      // Print more detailed error information for diagnosis
      if (error.name === 'MongoServerError') {
        console.error('   Error code:', error.code);
        console.error('   Error codeName:', error.codeName);
        if (error.errorLabels) {
          console.error('   Error labels:', error.errorLabels);
        }
      }
    } finally {
      // Close client if it was created
      if (client) {
        try {
          await client.close();
          console.log('   Connection closed');
        } catch (err) {
          console.error('   Error closing connection:', err.message);
        }
      }
    }
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\n=== Test completed ===');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed with error:', err);
    process.exit(1);
  });