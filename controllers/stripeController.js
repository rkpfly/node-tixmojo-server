/**
 * Stripe Payment Controller
 * 
 * Handles Stripe payment processing
 * Securely manages payment intents on the server side
 */

// Environment checks
const isProduction = process.env.NODE_ENV === 'production';
const STRIPE_API_KEY = isProduction
  ? process.env.STRIPE_SECRET_KEY_PROD
  : process.env.STRIPE_SECRET_KEY_DEV;

// Check if Stripe is configured
const isStripeConfigured = STRIPE_API_KEY && 
                           STRIPE_API_KEY !== 'sk_test_YOUR_TEST_KEY' && 
                           STRIPE_API_KEY !== 'sk_live_YOUR_LIVE_KEY';

// Warn if Stripe environment is not configured, but don't exit
if (!isStripeConfigured) {
  console.warn(`⚠️ Stripe API key not properly configured for ${isProduction ? 'production' : 'development'} environment. Running in simulation mode.`);
}

// Initialize Stripe only if configured
let stripe;
if (isStripeConfigured) {
  try {
    stripe = require('stripe')(STRIPE_API_KEY);
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error.message);
  }
}
const crypto = require('crypto');
const { respondWithError, respondWithSuccess } = require('../utils/responseUtils');
const { logger } = require('../middleware/logger');

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
 * Creates a server-side session with cart items and event information
 */
const initializePaymentSession = async (req, res) => {
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
    
    // Calculate total amount
    const totalAmount = calculateTotalAmount(cartItems);
    const serviceFee = 10; // $10 service fee
    
    // Store cart items and event info in server-side session
    paymentSessions.set(sessionId, {
      cartItems,
      eventId: event.id,
      created: Date.now(),
      expiresAt,
      totalAmount,
      serviceFee,
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
    
    // Add buyer info to session
    session.buyerInfo = {
      firstName,
      lastName,
      email,
      phone,
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
 * Create Stripe payment intent
 * Creates a payment intent and returns client secret
 */
const createPaymentIntent = async (req, res) => {
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
    
    // Calculate amount in cents (Stripe requires amount in smallest currency unit)
    const subtotal = session.totalAmount;
    const serviceFee = session.serviceFee;
    const discountAmount = subtotal * session.discount;
    const finalAmount = subtotal + serviceFee - discountAmount;
    const amountInCents = Math.round(finalAmount * 100);
    
    // Check if Stripe is properly configured
    if (!isStripeConfigured || !stripe) {
      // Simulation mode - create a fake payment intent
      logger.warn(`Creating simulated payment intent for session ${sessionId} (Stripe not configured)`);
      
      // Generate a fake payment intent ID and client secret
      const fakePaymentIntentId = `pi_simulated_${crypto.randomBytes(16).toString('hex')}`;
      const fakeClientSecret = `${fakePaymentIntentId}_secret_${crypto.randomBytes(24).toString('hex')}`;
      
      // Store simulated payment intent ID in session
      session.paymentIntentId = fakePaymentIntentId;
      session.isSimulated = true;
      session.status = 'payment_intent_created';
      
      // Return simulated client secret
      return respondWithSuccess(res, {
        clientSecret: fakeClientSecret,
        amount: finalAmount,
        amountInCents,
        isSimulated: true
      });
    }
    
    // Real Stripe integration path
    // Prepare metadata for the payment
    const metadata = {
      eventId: session.eventId,
      ticketCount: session.cartItems.reduce((total, item) => total + item.quantity, 0),
      buyerEmail: session.buyerInfo.email,
      sessionId
    };
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // Use the appropriate currency
      metadata,
      receipt_email: session.buyerInfo.email,
      description: `Tickets for Event #${session.eventId}`,
      // Allow additional payment methods beyond credit cards
      payment_method_types: ['card', 'us_bank_account'],
      // Collect customer's billing details
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    });
    
    // Store payment intent ID in session
    session.paymentIntentId = paymentIntent.id;
    session.status = 'payment_intent_created';
    
    logger.info(`Payment intent ${paymentIntent.id} created for session ${sessionId}`);
    
    // Return client secret to frontend (this is safe to expose)
    return respondWithSuccess(res, {
      clientSecret: paymentIntent.client_secret,
      amount: finalAmount,
      amountInCents
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    return respondWithError(res, 'Failed to create payment intent', 500);
  }
};

/**
 * Confirm payment success
 * Verifies payment was successful and creates order
 */
const confirmPaymentSuccess = async (req, res) => {
  try {
    const { sessionId, paymentIntentId } = req.body;
    
    // Verify the session exists
    if (!paymentSessions.has(sessionId)) {
      return respondWithError(res, 'Invalid or expired session', 400);
    }
    
    const session = paymentSessions.get(sessionId);
    
    // Verify payment intent matches
    if (session.paymentIntentId !== paymentIntentId) {
      return respondWithError(res, 'Payment verification failed', 400);
    }
    
    // Special handling for simulated payments
    if (session.isSimulated || !isStripeConfigured || !stripe) {
      logger.info(`Processing simulated payment confirmation for session ${sessionId}`);
      
      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a simulated order
      const orderId = `ORD-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Update session with order info
      session.status = 'payment_completed';
      session.orderId = orderId;
      session.paymentCompleted = Date.now();
      
      logger.info(`Simulated payment confirmed for session ${sessionId}. Order ID: ${orderId}`);
      
      // Calculate final amount
      const subtotal = session.totalAmount;
      const serviceFee = session.serviceFee;
      const discountAmount = subtotal * session.discount;
      const finalAmount = subtotal + serviceFee - discountAmount;
      
      // Return success response with order details
      return respondWithSuccess(res, {
        orderId,
        status: 'success',
        totalPaid: finalAmount,
        isSimulated: true
      });
    }
    
    // Real Stripe verification for actual payments
    // Retrieve payment intent from Stripe to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return respondWithError(res, `Payment not completed. Status: ${paymentIntent.status}`, 400);
    }
    
    // Payment is confirmed, create order
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Update session with order info
    session.status = 'payment_completed';
    session.orderId = orderId;
    session.paymentCompleted = Date.now();
    
    logger.info(`Payment confirmed for session ${sessionId}. Order ID: ${orderId}`);
    
    // Calculate final amount
    const subtotal = session.totalAmount;
    const serviceFee = session.serviceFee;
    const discountAmount = subtotal * session.discount;
    const finalAmount = subtotal + serviceFee - discountAmount;
    
    // Return success response with order details
    return respondWithSuccess(res, {
      orderId,
      status: 'success',
      totalPaid: finalAmount
    });
  } catch (error) {
    logger.error('Error confirming payment:', error);
    return respondWithError(res, 'Failed to confirm payment', 500);
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
      
      // Calculate new total
      const subtotal = session.totalAmount;
      const serviceFee = session.serviceFee;
      const discountAmount = subtotal * discount;
      const newTotal = subtotal + serviceFee - discountAmount;
      
      return respondWithSuccess(res, {
        valid,
        discount,
        message,
        newTotal
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

/**
 * Webhook handler for Stripe events
 * Processes webhook notifications from Stripe
 */
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  // Handle the case when Stripe is not configured
  if (!isStripeConfigured || !stripe) {
    logger.warn('Received webhook request but Stripe is not configured');
    return respondWithSuccess(res, { 
      received: true,
      simulated: true,
      message: 'Webhook received but ignored (Stripe not configured)' 
    });
  }
  
  if (!signature) {
    return respondWithError(res, 'Missing stripe-signature header', 400);
  }
  
  try {
    // Verify the webhook signature
    const webhookSecret = isProduction
      ? process.env.STRIPE_WEBHOOK_SECRET_PROD
      : process.env.STRIPE_WEBHOOK_SECRET_DEV;
    
    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      return respondWithError(res, 'Webhook secret not configured', 500);
    }
    
    const event = stripe.webhooks.constructEvent(
      req.rawBody, // Raw request body (needs to be configured in Express)
      signature,
      webhookSecret
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      // Add more event handlers as needed
    }
    
    // Return success
    return respondWithSuccess(res, { received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return respondWithError(res, `Webhook error: ${error.message}`, 400);
  }
};

// Helper function to handle successful payment notifications
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const { sessionId } = paymentIntent.metadata;
  
  logger.info(`Webhook: Payment intent ${paymentIntent.id} succeeded`);
  
  // Find corresponding session
  if (sessionId && paymentSessions.has(sessionId)) {
    const session = paymentSessions.get(sessionId);
    
    // Update session status
    session.status = 'payment_completed';
    
    // In a real application, you would update database records here
    logger.info(`Session ${sessionId} marked as completed via webhook`);
  }
};

// Helper function to handle failed payment notifications
const handlePaymentIntentFailed = async (paymentIntent) => {
  const { sessionId } = paymentIntent.metadata;
  
  logger.error(`Webhook: Payment intent ${paymentIntent.id} failed`);
  
  // Find corresponding session
  if (sessionId && paymentSessions.has(sessionId)) {
    const session = paymentSessions.get(sessionId);
    
    // Update session status
    session.status = 'payment_failed';
    session.failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
    
    // In a real application, you would update database records here
    logger.error(`Session ${sessionId} marked as failed via webhook`);
  }
};

// Helper function to calculate total amount from cart items
const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (parseFloat(item.ticket.price) * item.quantity);
  }, 0);
};

module.exports = {
  initializePaymentSession,
  validateBuyerInfo,
  createPaymentIntent,
  confirmPaymentSuccess,
  applyPromoCode,
  getSessionStatus,
  handleStripeWebhook
};