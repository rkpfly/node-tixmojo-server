const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../utils/db');

// GET all events data from MongoDB
router.get('/', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;

    // Get events from MongoDB
    const events = await db.collection('events').find({}).toArray();
    
    // Return events
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting events from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET all organizers from MongoDB
router.get('/organizers', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get organizers from MongoDB
    const organizers = await db.collection('organizers').find({}).toArray();
    
    // Return organizers
    res.json({
      success: true,
      count: organizers.length,
      data: organizers
    });
  } catch (error) {
    console.error('Error getting organizers from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organizers from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});
    
// GET flyers data
router.get('/flyers', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get flyers from MongoDB
    const flyers = await db.collection('flyers').find({}).toArray();
    
    // Return flyers
    res.json({
      success: true,
      count: flyers.length,
      data: flyers
    });
  } catch (error) {
    console.error('Error getting flyers from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get flyers from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    }
    }
  }
});

// GET events by location
router.get('/location/:location', async (req, res) => {
  let client;
  
  try {
    const { location } = req.params;
    
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get events for this location
    const events = await db.collection('events').find({ 
      eventLocation: location 
    }).toArray();
    
    // Return events
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting events by location from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events by location from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET events by organizer
router.get('/organizer/:organizerId', async (req, res) => {
  let client;
  
  try {
    const { organizerId } = req.params;
    
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get events for this organizer
    const events = await db.collection('events').find({ 
      organizerId: organizerId 
    }).toArray();
    
    // Return events
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting events by organizer from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events by organizer from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET spotlight events
router.get('/spotlight', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get spotlight events from MongoDB
    const spotlightEvents = await db.collection('events').find({ 
      eventType: 'spotlight' 
    }).toArray();
    
    // Return spotlight events
    res.json({
      success: true,
      count: spotlightEvents.length,
      data: spotlightEvents
    });
  } catch (error) {
    console.error('Error getting spotlight events from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spotlight events from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET location details
router.get('/locationDetails/:location?', async (req, res) => {
  let client;
  
  try {
    const { location } = req.params;
    
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // If location is provided, get details for that location
    if (location) {
      const locationDetails = await db.collection('locationDetails').findOne({ id: location });
      
      if (!locationDetails) {
        return res.status(404).json({
          success: false,
          message: `Location details not found for ${location}`
        });
      }
      
      return res.json({
        success: true,
        data: locationDetails
      });
    }
    
    // Otherwise get all location details
    const locationDetails = await db.collection('locationDetails').find({}).toArray();
    
    // Convert to object with location as key
    const locationDetailsObj = locationDetails.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});
    
    // Return location details
    res.json({
      success: true,
      count: locationDetails.length,
      data: locationDetailsObj
    });
  } catch (error) {
    console.error('Error getting location details from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location details from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET event by ID
router.get('/event/:id', async (req, res) => {
  let client;
  
  try {
    const { id } = req.params;
    
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get event by ID
    const event = await db.collection('events').findOne({ id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ID: ${id}`
      });
    }
    
    // If event has organizerId, add organizer data
    if (event.organizerId) {
      const organizer = await db.collection('organizers').findOne({ id: event.organizerId });
      if (organizer) {
        event.organizer = organizer;
      }
    }
    
    // Return event
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error getting event by ID from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event by ID from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET all available locations
router.get('/locations', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get all locations
    const locations = await db.collection('locations').find({}).toArray();
    
    // Extract location names
    const locationNames = locations.map(location => location.name);
    
    // Return locations
    res.json({
      success: true,
      count: locationNames.length,
      data: locationNames
    });
  } catch (error) {
    console.error('Error getting locations from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get locations from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// GET all application data in a single response
router.get('/app-data', async (req, res) => {
  let client;
  
  try {
    // Get connection details
    const connection = await connectToDatabase();
    const db = connection.db;
    client = connection.client;
    
    // Get all data in parallel
    const [events, spotlightEvents, flyers, locationDetails, locations] = await Promise.all([
      db.collection('events').find({}).toArray(),
      db.collection('events').find({ eventType: 'spotlight' }).toArray(),
      db.collection('flyers').find({}).toArray(),
      db.collection('locationDetails').find({}).toArray(),
      db.collection('locations').find({}).toArray()
    ]);
    
    // Group events by location
    const locationEventsMap = events
      .filter(event => event.eventLocation && event.eventType !== 'spotlight')
      .reduce((map, event) => {
        const location = event.eventLocation;
        if (!map[location]) {
          map[location] = [];
        }
        map[location].push(event);
        return map;
      }, {});
    
    // Convert location details to object with location as key
    const locationDetailsObj = locationDetails.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});
    
    // Extract location names
    const locationNames = locations.map(location => location.name);
    
    // Return all data
    res.json({
      success: true,
      data: {
        locationEvents: locationEventsMap,
        spotlightEvents,
        flyerData: flyers,
        locationDetails: locationDetailsObj,
        locations: locationNames
      }
    });
  } catch (error) {
    console.error('Error getting app data from MongoDB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get app data from MongoDB',
      error: error.message
    });
  } finally {
    // Close the client connection if it exists
    if (client) {
      try {
        await client.close();
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

module.exports = router;