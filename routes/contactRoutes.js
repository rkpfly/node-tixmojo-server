const express = require('express');
const router = express.Router();
const { 
  contactValidationRules, 
  submitContactForm,
  getContact
} = require('../controllers/contactController');

// POST /api/contact - Submit contact form
router.post('/', contactValidationRules, submitContactForm);
// Get contact
router.get('/', getContact);

module.exports = router;