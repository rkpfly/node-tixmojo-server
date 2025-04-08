/**
 * Payment Controller
 * 
 * Handles all payment processing logic on the server side
 * No payment information is stored in client-side state
 */

const crypto = require('crypto');
const { validatePaymentData } = require('../utils/validationUtils');
const { respondWithError, respondWithSuccess } = require('../utils/responseUtils');
const { logger } = require('../middleware/logger');

// Securely hash sensitive data before storing in database
const hashSensitiveData = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};

// In-memory session storage (would use Redis or similar in production)
const paymentSessions = new Map();

// Clean up expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of paymentSessions.entries()) {
    if (session.expiresAt < now) {
      paymentSessions.delete(sessionId);
      logger.info(`Expired payment session ${sessionId} removed`);
    }
  }
}, 10 * 60 * 1000);

/**
 * Initialize a payment session
 * Creates a server-side session with cart items and buyer information
 */
const initializePaymentSession = (req, res) => {
  try {
    const { cartItems, event } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return respondWithError(res, 'Invalid cart items', 400);
    }
    
    if (!event || !event.id) {
      return respondWithError(res, 'Invalid event information', 400);
    }
    
    // Generate a secure session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // Calculate expiry time (10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    // Store cart items and event info in server-side session
    paymentSessions.set(sessionId, {
      cartItems,
      eventId: event.id,
      created: Date.now(),
      expiresAt,
      totalAmount: calculateTotalAmount(cartItems),
      discount: 0, // Default discount
      status: 'initialized'
    });
    
    logger.info(`Payment session ${sessionId} initialized for event ${event.id}`);
    
    // Return session ID and expiry time to client
    return respondWithSuccess(res, {
      sessionId,
      expiresAt: new Date(expiresAt).toISOString()
    });
  } catch (error) {
    logger.error('Error initializing payment session:', error);
    return respondWithError(res, 'Failed to initialize payment session', 500);
  }
};

/**
 * Validate buyer information
 * Performs server-side validation of buyer details
 */
const validateBuyerInfo = (req, res) => {
  try {
    const { sessionId, firstName, lastName, email, phone } = req.body;
    
    // Verify the session exists
    if (!paymentSessions.has(sessionId)) {
      return respondWithError(res, 'Invalid or expired session', 400);
    }
    
    // Check if session has expired
    const session = paymentSessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      paymentSessions.delete(sessionId);
      return respondWithError(res, 'Session expired', 400);
    }
    
    // Validate buyer information
    const validationErrors = validatePaymentData({ firstName, lastName, email, phone });
    if (validationErrors.length > 0) {
      return respondWithError(res, 'Validation failed', 400, { errors: validationErrors });
    }
    
    // Add buyer info to session (hashing sensitive data)
    session.buyerInfo = {
      firstName,
      lastName,
      email: hashSensitiveData(email),
      phone: hashSensitiveData(phone),
      validated: true
    };
    
    session.status = 'buyer_validated';
    
    logger.info(`Buyer info validated for session ${sessionId}`);
    
    return respondWithSuccess(res, { valid: true });
  } catch (error) {
    logger.error('Error validating buyer info:', error);
    return respondWithError(res, 'Failed to validate buyer information', 500);
  }
};

/**
 * Process payment
 * Would integrate with a payment processor like Stripe in production
 */
const processPayment = (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Verify the session exists
    if (!paymentSessions.has(sessionId)) {
      return respondWithError(res, 'Invalid or expired session', 400);
    }
    
    // Check if session has expired
    const session = paymentSessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      paymentSessions.delete(sessionId);
      return respondWithError(res, 'Session expired', 400);
    }
    
    // Verify buyer info has been validated
    if (!session.buyerInfo || !session.buyerInfo.validated) {
      return respondWithError(res, 'Buyer information not validated', 400);
    }
    
    // In production, this would call a payment processor API
    // For demo purposes, we'll simulate a successful payment
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Update session with payment info
    session.status = 'payment_completed';
    session.orderId = orderId;
    session.paymentCompleted = Date.now();
    
    logger.info(`Payment processed successfully for session ${sessionId}. Order ID: ${orderId}`);
    
    // Return success response with order ID
    return respondWithSuccess(res, {
      orderId,
      status: 'success',
      totalPaid: session.totalAmount - (session.totalAmount * session.discount) + 10 // Adding $10 service fee
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    return respondWithError(res, 'Failed to process payment', 500);
  }
};

/**
 * Apply promo code
 * Validates and applies discount from promo code
 */
const applyPromoCode = (req, res) => {
  try {
    const { sessionId, promoCode } = req.body;
    
    // Verify the session exists
    if (!paymentSessions.has(sessionId)) {
      return respondWithError(res, 'Invalid or expired session', 400);
    }
    
    // Check if session has expired
    const session = paymentSessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      paymentSessions.delete(sessionId);
      return respondWithError(res, 'Session expired', 400);
    }
    
    // Simple promo code validation (would connect to database in production)
    let discount = 0;
    let message = 'Invalid promo code';
    let valid = false;
    
    // Demo promo codes
    if (promoCode.toUpperCase() === 'TIXMOJO10') {
      discount = 0.1; // 10% discount
      message = '10% discount applied';
      valid = true;
    } else if (promoCode.toUpperCase() === 'EVENT25') {
      discount = 0.25; // 25% discount
      message = '25% discount applied';
      valid = true;
    }
    
    if (valid) {
      // Apply discount to session
      session.discount = discount;
      session.promoCode = promoCode;
      
      logger.info(`Promo code ${promoCode} applied to session ${sessionId} with ${discount * 100}% discount`);
      
      return respondWithSuccess(res, {
        valid,
        discount,
        message,
        newTotal: calculateTotalWithDiscount(session)
      });
    } else {
      return respondWithError(res, message, 400);
    }
  } catch (error) {
    logger.error('Error applying promo code:', error);
    return respondWithError(res, 'Failed to apply promo code', 500);
  }
};

/**
 * Get current session status
 * Allows client to check if session is still valid
 */
const getSessionStatus = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify the session exists
    if (!paymentSessions.has(sessionId)) {
      return respondWithError(res, 'Invalid or expired session', 400);
    }
    
    // Check if session has expired
    const session = paymentSessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      paymentSessions.delete(sessionId);
      return respondWithError(res, 'Session expired', 400);
    }
    
    // Return session details
    return respondWithSuccess(res, {
      status: session.status,
      expiresAt: new Date(session.expiresAt).toISOString(),
      timeRemaining: Math.floor((session.expiresAt - Date.now()) / 1000) // in seconds
    });
  } catch (error) {
    logger.error('Error getting session status:', error);
    return respondWithError(res, 'Failed to get session status', 500);
  }
};

// Helper function to calculate total amount from cart items
const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (parseFloat(item.ticket.price) * item.quantity);
  }, 0);
};

// Helper function to calculate total with discount
const calculateTotalWithDiscount = (session) => {
  const subtotal = session.totalAmount;
  const serviceFee = 10; // Fixed service fee
  const discountAmount = subtotal * session.discount;
  
  return subtotal + serviceFee - discountAmount;
};

module.exports = {
  initializePaymentSession,
  validateBuyerInfo,
  processPayment,
  applyPromoCode,
  getSessionStatus
};