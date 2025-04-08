/**
 * Payment Routes
 * 
 * Express routes for payment processing
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Initialize a new payment session
router.post('/initialize', paymentController.initializePaymentSession);

// Validate buyer information
router.post('/validate-buyer', paymentController.validateBuyerInfo);

// Process payment
router.post('/process', paymentController.processPayment);

// Apply promo code
router.post('/apply-promo', paymentController.applyPromoCode);

// Get session status
router.get('/session-status/:sessionId', paymentController.getSessionStatus);

module.exports = router;