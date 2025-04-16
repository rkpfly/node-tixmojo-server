const nodemailer = require('nodemailer');
const winston = require('winston');
const { handleResponse, handleError } = require('../utils/responseUtils');
const { body, validationResult } = require('express-validator');

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'contact-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/contact-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/contact.log' }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration on server startup
transporter.verify()
  .then(() => {
    logger.info('SMTP connection established successfully');
  })
  .catch(error => {
    logger.error('SMTP connection failed', { error: error.message });
  });

// Define validation rules
const contactValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s.'-]+$/).withMessage('Name contains invalid characters'),
  
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
    .escape()
];

// Contact form submission handler
const submitContactForm = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleError(res, 400, 'Validation failed', errors.array());
    }
    
    const { name, email, message } = req.body;
    
    // Log the contact request
    logger.info('Contact form submission received', {
      name,
      email,
      messageLength: message.length
    });
    
    // Send notification email to admin
    await sendAdminNotification({ name, email, message });
    
    // Send confirmation email to user
    await sendUserConfirmation({ name, email });
    
    // Return success response
    return handleResponse(res, 200, 'Contact form submitted successfully');
  } catch (error) {
    logger.error('Error processing contact form', {
      error: error.message,
      stack: error.stack
    });
    return handleError(res, 500, 'Failed to process contact form submission');
  }
};

// Send notification email to admin
const sendAdminNotification = async (formData) => {
  // Create email content
  const mailOptions = {
    from: `"TixMojo Contact Form" <${process.env.SMTP_FROM}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: formData.email,
    subject: `New Contact Form Submission from ${formData.name}`,
    text: `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6F44FF;">New Contact Form Submission</h2>
  <p><strong>From:</strong> ${formData.name}</p>
  <p><strong>Email:</strong> ${formData.email}</p>
  <div style="margin-top: 20px; border-left: 4px solid #6F44FF; padding-left: 15px;">
    <h3 style="margin-top: 0;">Message:</h3>
    <p style="white-space: pre-line;">${formData.message}</p>
  </div>
  <p style="color: #777; font-size: 12px; margin-top: 30px;">
    This email was sent from the TixMojo contact form.
  </p>
</div>
    `
  };
  
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Log the result
    logger.info('Admin notification email sent', {
      messageId: info.messageId,
      sender: formData.email,
      recipient: mailOptions.to
    });
  } catch (error) {
    logger.error('Failed to send admin notification email', {
      error: error.message,
      recipient: process.env.CONTACT_EMAIL
    });
    throw error; // Re-throw to handle in the controller
  }
};

// Send confirmation email to user
const sendUserConfirmation = async (formData) => {
  const mailOptions = {
    from: `"TixMojo Events" <${process.env.SMTP_FROM}>`,
    to: formData.email,
    subject: 'Thanks for contacting TixMojo',
    text: `
Hi ${formData.name},

Thank you for reaching out to TixMojo! We've received your message and will get back to you as soon as possible.

For urgent inquiries, please call us at +61 483952024.

Best regards,
The TixMojo Team
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6F44FF;">Thanks for contacting TixMojo!</h2>
  <p>Hi ${formData.name},</p>
  <p>We've received your message and will get back to you as soon as possible.</p>
  <p>For urgent inquiries, please call us at <strong>+61 483952024</strong>.</p>
  <p>Best regards,<br>The TixMojo Team</p>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
    <p>This is an automated response. Please do not reply to this email.</p>
  </div>
</div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('User confirmation email sent', {
      messageId: info.messageId,
      recipient: formData.email
    });
  } catch (error) {
    logger.error('Failed to send user confirmation email', {
      error: error.message,
      recipient: formData.email
    });
    // Don't throw - we don't want the main flow to fail if confirmation fails
  }
};

// Sending display data
const { sendSuccess, sendError } = require('../utils/responseUtils');
const {contact} = require('../data/contact');

const getContact = async (req, res) => {
  try {
    return sendSuccess(res, contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    return sendError(res, 500, 'Failed to get contact', error);
  }
};

module.exports = {
  contactValidationRules,
  submitContactForm,
  getContact
};