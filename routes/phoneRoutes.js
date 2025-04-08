/**
 * Phone Routes - APIs for phone validation and country data
 */

const express = require('express');
const router = express.Router();
const phoneService = require('../services/phoneService');

/**
 * @route   GET /api/phone/countries
 * @desc    Get all countries with codes and dialing codes
 * @access  Public
 */
router.get('/countries', (req, res) => {
  try {
    const countries = phoneService.getSortedCountryOptions();
    
    return res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching country data',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * @route   POST /api/phone/validate
 * @desc    Validate a phone number server-side
 * @access  Public
 */
router.post('/validate', (req, res) => {
  try {
    const { phone, countryCode } = req.body;
    
    if (!phone || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }
    
    // Validate the phone number
    const isValid = phoneService.validatePhoneNumber(phone, countryCode);
    
    if (isValid) {
      // Format to E.164 if valid
      const formattedPhone = phoneService.formatPhoneE164(phone, countryCode);
      return res.json({
        success: true,
        isValid: true,
        formatted: formattedPhone
      });
    } else {
      return res.json({
        success: true,
        isValid: false
      });
    }
  } catch (error) {
    console.error('Phone validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating phone number',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * @route   GET /api/phone/format-example/:countryCode
 * @desc    Get phone format example for a country
 * @access  Public
 */
router.get('/format-example/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Country code is required'
      });
    }
    
    // Get the example format
    const example = phoneService.getPhoneExample(countryCode);
    
    return res.json({
      success: true,
      example
    });
  } catch (error) {
    console.error('Error getting phone format example:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting phone format example',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;