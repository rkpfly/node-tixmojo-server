/**
 * Railway Workaround Deployment Script
 * 
 * This script swaps the standard db.js file with the Railway-specific 
 * workaround implementation. It's designed to be run just before starting
 * the server in a Railway environment.
 */

const fs = require('fs');
const path = require('path');

// Paths to the files
const originalDbPath = path.join(__dirname, 'utils/db.js');
const workaroundDbPath = path.join(__dirname, 'railway-db-workaround.js');
const backupDbPath = path.join(__dirname, 'utils/db.js.backup');

// Check if we're running in Railway
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_ENVIRONMENT !== undefined;

// Function to copy a file
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${source} to ${destination}`);
    return true;
  } catch (error) {
    console.error(`Error copying ${source} to ${destination}:`, error.message);
    return false;
  }
}

// Main function
function setupRailwayWorkaround() {
  console.log('Checking environment for Railway deployment...');
  
  if (isRailway) {
    console.log('Detected Railway environment. Applying MongoDB connection workaround...');
    
    // Backup original db.js if it hasn't been backed up yet
    if (!fs.existsSync(backupDbPath) && fs.existsSync(originalDbPath)) {
      if (copyFile(originalDbPath, backupDbPath)) {
        console.log('Original db.js backed up successfully.');
      }
    }
    
    // Replace db.js with the workaround version
    if (fs.existsSync(workaroundDbPath)) {
      if (copyFile(workaroundDbPath, originalDbPath)) {
        console.log('Successfully applied Railway MongoDB workaround!');
      }
    } else {
      console.error('Railway workaround file not found. Cannot apply workaround.');
    }
  } else {
    console.log('Not running in Railway environment. No changes needed.');
    
    // If we have a backup, restore it (useful for local development after testing)
    if (fs.existsSync(backupDbPath) && process.env.RESTORE_DB_BACKUP === 'true') {
      if (copyFile(backupDbPath, originalDbPath)) {
        console.log('Restored original db.js from backup.');
      }
    }
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  setupRailwayWorkaround();
}

module.exports = setupRailwayWorkaround;