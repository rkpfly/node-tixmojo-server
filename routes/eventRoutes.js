const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events (with optional location filter)
router.get('/', eventController.getAllEvents);

// Define all specific routes before the catch-all :id route

// Get raw events from locationEvents (with optional location filter)
router.get('/server-data', eventController.getRawEvents);

// Get location-specific events
router.get('/location/:location', eventController.getLocationSpecificEvents);

// Get spotlight events
router.get('/spotlight', eventController.getSpotlightEvents);

// Get carousel flyers
router.get('/flyers', eventController.getFlyers);

// Get available locations
router.get('/locations', eventController.getLocations);

// Get location details (all locations or specific one)
router.get('/locations/:location?', eventController.getLocationDetails);

// Get events by organizer ID
router.get('/organizer/:organizerId', eventController.getEventsByOrganizer);

// Get all application data in a single call
router.get('/app-data', eventController.getAllAppData);

// Get single event by ID - must be last as it's a catch-all
router.get('/:id', eventController.getEventById);

module.exports = router;