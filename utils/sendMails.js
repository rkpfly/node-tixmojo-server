const nodemailer = require('nodemailer');
const Logger = require('./logger');
const generateToken = require('./generateToken');

// Load environment variables
require('dotenv').config();

// Create a nodemailer transporter - configure for production in real usage
let transporter;

// Initialize email transporter based on environment
if (process.env.NODE_ENV === 'production') {
  // Production SMTP setup
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
} else {
  // Development setup using Ethereal email or similar test service
  // For testing, you can create a test account at https://ethereal.email/
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.DEV_EMAIL_USER || 'test@example.com',
      pass: process.env.DEV_EMAIL_PASS || 'password'
    }
  });
}

/**
 * Send email for various purposes
 * @param {string} id - User ID
 * @param {string} email - Recipient email address
 * @param {string} option - Email purpose (email verification, forgot password, etc.)
 * @param {object} data - Additional data to include in email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendMail = async (id, email, option, data = {}) => {
  try {
    const frontendURL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    let mailOptions = {
      from: `"TixMojo Events" <${process.env.EMAIL_FROM || 'noreply@tixmojo.com'}>`,
      to: email,
      subject: '',
      html: ''
    };

    // Configure email based on purpose
    switch (option) {
      case 'email verification':
        const emailToken = generateToken(id, 'email');
        const verificationUrl = `${frontendURL}/user/verify/${emailToken}`;
        
        mailOptions.subject = 'Verify your TixMojo account';
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #6f44ff;">Welcome to TixMojo!</h1>
            </div>
            <p>Hi there,</p>
            <p>Thank you for registering with TixMojo! To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #6f44ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>This link will expire in 15 minutes. If you didn't request this email, please ignore it.</p>
            <p>Thanks,<br>The TixMojo Team</p>
          </div>
        `;
        break;
        
      case 'forgot password':
        const resetToken = generateToken(id, 'forgot-password');
        const resetUrl = `${frontendURL}/user/reset-password/${resetToken}`;
        
        mailOptions.subject = 'Reset Your TixMojo Password';
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #6f44ff;">Reset Your Password</h1>
            </div>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #6f44ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
            <p>Thanks,<br>The TixMojo Team</p>
          </div>
        `;
        break;
        
      case 'ticket confirmation':
        const eventName = data.eventName || 'Your Event';
        const ticketUrl = `${frontendURL}/tickets/${data.ticketId}`;
        
        mailOptions.subject = `Your TixMojo Tickets for ${eventName}`;
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #6f44ff;">Your Tickets are Confirmed!</h1>
            </div>
            <p>Hello ${data.name || 'there'},</p>
            <p>Thank you for your purchase. Your tickets for <strong>${eventName}</strong> have been confirmed!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ticketUrl}" style="background-color: #6f44ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Tickets</a>
            </div>
            <div style="background-color: #f5f5fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details</h3>
              <p><strong>Event:</strong> ${eventName}</p>
              <p><strong>Date:</strong> ${data.eventDate || 'See ticket for details'}</p>
              <p><strong>Venue:</strong> ${data.venue || 'See ticket for details'}</p>
              <p><strong>Tickets:</strong> ${data.ticketCount || 1} x ${data.ticketType || 'General Admission'}</p>
            </div>
            <p>You can access your tickets at any time by logging into your TixMojo account.</p>
            <p>Enjoy the event!</p>
            <p>Best regards,<br>The TixMojo Team</p>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Invalid email option: ${option}`);
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    Logger.info(`Email sent: ${info.messageId}`);
    
    // Return a preview URL in development (for testing with Ethereal)
    if (process.env.NODE_ENV !== 'production') {
      Logger.info(`Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    Logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

module.exports = sendMail;