/**
 * Stripe Payment Routes
 * 
 * Express routes for Stripe payment processing
 */

const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Initialize a new payment session
router.post('/initialize', stripeController.initializePaymentSession);

// Validate buyer information
router.post('/validate-buyer', stripeController.validateBuyerInfo);

// Create payment intent
router.post('/create-payment-intent', stripeController.createPaymentIntent);

// Confirm payment success
router.post('/confirm-payment', stripeController.confirmPaymentSuccess);

// Apply promo code
router.post('/apply-promo', stripeController.applyPromoCode);

// Get session status
router.get('/session-status/:sessionId', stripeController.getSessionStatus);

// Webhook handler for Stripe events
// Note: The raw body parsing is handled in the main server.js file
router.post('/webhook', stripeController.handleStripeWebhook);

module.exports = router;