const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendMail = require('../utils/sendMails');
const { createError, BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/error');
const Logger = require('../utils/logger');
const { connectToDatabase } = require('../utils/db');
const mongoose = require('mongoose');

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const registerUser = async (req, res, next) => {
  let client;

  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Check if user already exists
    const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (userExists) {
      return next(BadRequestError('User with this email already exists'));
    }

    // Create a new user
    const newUser = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      phone: phone || '',
      role: 'user',
      isEmailVerified: false,
      status: 'active',
      profileImage: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the user into the database
    const result = await db.collection('users').insertOne(newUser);
    const userId = result.insertedId;

    // Generate token for email verification
    sendMail(userId.toString(), email, 'email verification')
      .catch(error => Logger.error(`Failed to send verification email: ${error.message}`));

    // Return success without sensitive information
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Generate access token
    const token = generateToken(userId.toString(), 'login');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    Logger.error(`Registration error: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

/**
 * Login a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const loginUser = async (req, res, next) => {
  let client;

  try {
    const { email, password } = req.body;

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Find the user
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    // Check if user exists and password is correct
    if (!user || !(await comparePassword(password, user.password))) {
      return next(UnauthorizedError('Invalid email or password'));
    }

    // Check if user is active
    if (user.status !== 'active') {
      return next(UnauthorizedError('Your account is not active. Please contact support.'));
    }

    // Update last login time
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // Remove sensitive information
    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken(user._id.toString(), 'login');

    // Set token in cookie and response
    res.cookie('access_token', token, {
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return user with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds
      }
    });
  } catch (error) {
    Logger.error(`Login error: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

/**
 * Logout a user by clearing the cookie
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const logoutUser = (req, res) => {
  const token = req.cookies.access_token;
  
  if (token) {
    // Clear the cookie
    res.clearCookie('access_token');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } else {
    // No token found, user is already logged out
    res.status(200).json({
      success: true,
      message: 'Already logged out'
    });
  }
};

/**
 * Get the currently logged in user's profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const getUserProfile = async (req, res, next) => {
  let client;

  try {
    // User ID is added by the protectRoute middleware
    const userId = req.userId;
    
    if (!userId) {
      return next(UnauthorizedError('Not authorized, no user ID'));
    }

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Find user by ID
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      return next(NotFoundError('User not found'));
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    Logger.error(`Error getting user profile: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

/**
 * Update user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const updateUserProfile = async (req, res, next) => {
  let client;

  try {
    // User ID is added by the protectRoute middleware
    const userId = req.userId;
    
    if (!userId) {
      return next(UnauthorizedError('Not authorized, no user ID'));
    }
    
    // Get update fields
    const { firstName, lastName, phone } = req.body;
    
    // Create update object
    const updates = {
      updatedAt: new Date()
    };
    
    // Only add fields that are provided
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    
    // Profile image from file upload
    if (req.file) {
      updates.profileImage = req.file.path;
    }

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return next(NotFoundError('User not found'));
    }

    // Get updated user
    const updatedUser = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    Logger.error(`Error updating user profile: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

/**
 * Change user password
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const changePassword = async (req, res, next) => {
  let client;

  try {
    // User ID is added by the protectRoute middleware
    const userId = req.userId;
    
    if (!userId) {
      return next(UnauthorizedError('Not authorized, no user ID'));
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return next(BadRequestError('Current password and new password are required'));
    }
    
    if (newPassword.length < 8) {
      return next(BadRequestError('New password must be at least 8 characters long'));
    }

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Find user
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (!user) {
      return next(NotFoundError('User not found'));
    }
    
    // Verify current password
    const isPasswordCorrect = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordCorrect) {
      return next(BadRequestError('Current password is incorrect'));
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    Logger.error(`Error changing password: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

/**
 * Request password reset
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const forgotPassword = async (req, res, next) => {
  let client;

  try {
    const { email } = req.body;
    
    if (!email) {
      return next(BadRequestError('Email is required'));
    }

    // Connect to MongoDB
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Find user by email
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }
    
    // Send password reset email
    await sendMail(user._id.toString(), email, 'forgot password');

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    Logger.error(`Error requesting password reset: ${error.message}`);
    next(error);
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        Logger.error(`Error closing MongoDB connection: ${err.message}`);
      }
    }
  }
};

// Helper function to hash a password
const hashPassword = async (password) => {
  const salt = await require('bcryptjs').genSalt(10);
  return await require('bcryptjs').hash(password, salt);
};

// Helper function to compare a password with a hash
const comparePassword = async (enteredPassword, storedPassword) => {
  return await require('bcryptjs').compare(enteredPassword, storedPassword);
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword
};