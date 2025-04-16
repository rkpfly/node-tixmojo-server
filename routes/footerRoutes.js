const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');

// Get footer
router.get('/', footerController.getFooter);

module.exports = router;