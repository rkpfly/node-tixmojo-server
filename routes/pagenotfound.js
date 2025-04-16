const express = require('express');
const router = express.Router();
const pagenotfoundController = require('../controllers/pagenotfoundController');

// Get page not found
router.get('/', pagenotfoundController.getNotFound);

module.exports = router;