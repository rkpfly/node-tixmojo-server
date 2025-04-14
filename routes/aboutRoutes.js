const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');

// Get about us
router.get('/', aboutController.getAboutUs);

module.exports = router;