const { spotlightEvents, flyerData, locationEvents, organizers } = require('../data/events');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// Event location details with additional data
const locationDetails = {
  "Sydney": {
    title: "Events in Sydney",
    subtitle: "Discover the most popular events happening in Sydney right now",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
    description: "Sydney, capital of New South Wales and one of Australia's largest cities, is known for its vibrant arts scene and iconic harbour. Experience world-class entertainment, dining, and cultural events throughout the year."
  },
  "Melbourne": {
    title: "Events in Melbourne",
    subtitle: "Explore Melbourne's thriving cultural and entertainment scene",
    image: "https://images.unsplash.com/photo-1514395462725-fb4566210144?q=80&w=2071&auto=format&fit=crop",
    description: "Melbourne, Australia's cultural capital, is home to vibrant arts, music, and food scenes. Discover hidden laneways, world-class galleries, and exciting events year-round."
  },
  "Brisbane": {
    title: "Events in Brisbane",
    subtitle: "Find the best entertainment options in Queensland's capital",
    image: "https://images.unsplash.com/photo-1629947487869-4e2ae7d2d724?q=80&w=2070&auto=format&fit=crop",
    description: "Brisbane offers a perfect blend of urban sophistication and outdoor adventure. Enjoy vibrant cultural events, riverside dining, and a thriving arts scene in this sun-soaked Queensland capital."
  },
  "Singapore": {
    title: "Events in Singapore",
    subtitle: "Experience the best of Singapore's entertainment calendar",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070&auto=format&fit=crop",
    description: "Singapore, a global city with a rich cultural tapestry, offers year-round events ranging from international festivals to local celebrations, all set against a backdrop of futuristic architecture and lush gardens."
  }
};

/**
 * Get all events
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAllEvents = (req, res) => {
  try {
    const location = req.query.location || 'Sydney';
    
    // Capitalize first letter for consistency
    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    
    // Check if we have events for this location
    if (locationEvents && locationEvents[formattedLocation]) {
      return sendSuccess(res, locationEvents[formattedLocation]);
    } else {
      // If no specific events exist for this location, return empty array
      return sendSuccess(res, []);
    }
  } catch (error) {
    console.error('Error getting events:', error);
    return sendError(res, 500, 'Failed to get events', error);
  }
};

/**
 * Get spotlight events
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getSpotlightEvents = (req, res) => {
  try {
    const location = req.query.location || 'Sydney';
    
    // Filter events by location if provided
    const filteredEvents = spotlightEvents.filter(event => 
      !location || event.eventLocation.toLowerCase() === location.toLowerCase()
    );
    
    return sendSuccess(res, filteredEvents);
  } catch (error) {
    console.error('Error getting spotlight events:', error);
    return sendError(res, 500, 'Failed to get spotlight events', error);
  }
};

/**
 * Get flyers for carousel
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getFlyers = (req, res) => {
  try {
    return sendSuccess(res, flyerData);
  } catch (error) {
    console.error('Error getting flyers:', error);
    return sendError(res, 500, 'Failed to get flyers', error);
  }
};

/**
 * Get single event by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getEventById = (req, res) => {
  try {
    const { id } = req.params;
    
    let event = null;
    
    // Check spotlight events first
    event = spotlightEvents.find(event => event.id === id);
    
    // If not found, check location-specific events
    if (!event && locationEvents) {
      Object.values(locationEvents).forEach(locationEventList => {
        const foundEvent = locationEventList.find(event => event.id === id);
        if (foundEvent) {
          event = foundEvent;
        }
      });
    }
    
    // If still not found, return 404
    if (!event) {
      return sendError(res, 404, 'Event not found');
    }
    
    // Make sure tags exist and are always returned as an array
    if (!event.tags) {
      event.tags = ["Featured Event"];
    } else if (!Array.isArray(event.tags)) {
      event.tags = [event.tags];
    }
    
    // Fetch organizer details if available
    if (event.organizerId && organizers[event.organizerId]) {
      // Replace organizerId with full organizer details
      event.organizer = organizers[event.organizerId];
      
      // Add organizer stats
      event.organizer.stats = {
        totalEvents: 24,
        rating: 4.9,
        ticketsSold: "5k+"
      };
    }
    
    return sendSuccess(res, event);
  } catch (error) {
    console.error('Error getting event:', error);
    return sendError(res, 500, 'Failed to get event', error);
  }
};

/**
 * Get available locations
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getLocations = (req, res) => {
  try {
    // Get locations from locationEvents object keys
    const locationsFromKeys = Object.keys(locationEvents || {});
    
    // Extract unique locations from spotlight events
    const locationsFromSpotlight = [...new Set(spotlightEvents.map(event => event.eventLocation))];
    
    // Combine and deduplicate locations
    const locations = [...new Set([...locationsFromKeys, ...locationsFromSpotlight])];
    
    return sendSuccess(res, locations);
  } catch (error) {
    console.error('Error getting locations:', error);
    return sendError(res, 500, 'Failed to get locations', error);
  }
};

/**
 * Get raw events data from locationEvents
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getRawEvents = (req, res) => {
  try {
    const location = req.query.location || 'Sydney';
    
    // Capitalize first letter for consistency
    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    
    // Get events for the requested location
    if (locationEvents && locationEvents[formattedLocation]) {
      return sendSuccess(res, locationEvents[formattedLocation]);
    } else {
      // Return empty array if no events for this location
      return sendSuccess(res, []);
    }
  } catch (error) {
    console.error('Error getting raw events data:', error);
    return sendError(res, 500, 'Failed to get raw events data', error);
  }
};

/**
 * Get location-specific events
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getLocationSpecificEvents = (req, res) => {
  try {
    const { location } = req.params;
    
    if (!location) {
      return sendError(res, 400, 'Location parameter is required');
    }
    
    // Capitalize first letter for consistency
    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    
    // Check if we have events for this location
    if (locationEvents && locationEvents[formattedLocation]) {
      return sendSuccess(res, locationEvents[formattedLocation]);
    } else {
      // Return an empty array if no location events exist
      return sendSuccess(res, []);
    }
  } catch (error) {
    console.error('Error getting location-specific events:', error);
    return sendError(res, 500, 'Failed to get location events', error);
  }
};

/**
 * Get location details with additional metadata
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getLocationDetails = (req, res) => {
  try {
    const { location } = req.params;
    
    // Get details for the requested location
    if (location && locationDetails[location]) {
      return sendSuccess(res, locationDetails[location]);
    } 
    // If location is not specified or not found, return all locations data
    else if (!location) {
      return sendSuccess(res, locationDetails);
    }
    // Location not found
    else {
      return sendError(res, 404, 'Location details not found');
    }
  } catch (error) {
    console.error('Error getting location details:', error);
    return sendError(res, 500, 'Failed to get location details', error);
  }
};

/**
 * Get events by organizer ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getEventsByOrganizer = (req, res) => {
  try {
    const { organizerId } = req.params;
    
    if (!organizerId) {
      return sendError(res, 400, 'Organizer ID parameter is required');
    }
    
    // Find all events from this organizer across all locations and spotlight events
    let organizerEvents = [];
    
    // Check spotlight events
    const spotlightOrganizerEvents = spotlightEvents.filter(event => event.organizerId === organizerId);
    organizerEvents = [...organizerEvents, ...spotlightOrganizerEvents];
    
    // Check location-specific events
    if (locationEvents) {
      Object.values(locationEvents).forEach(locationEventList => {
        const foundEvents = locationEventList.filter(event => event.organizerId === organizerId);
        if (foundEvents.length > 0) {
          organizerEvents = [...organizerEvents, ...foundEvents];
        }
      });
    }
    
    // Remove duplicates (in case an event appears in both spotlight and location events)
    organizerEvents = organizerEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    return sendSuccess(res, organizerEvents);
  } catch (error) {
    console.error('Error getting events by organizer:', error);
    return sendError(res, 500, 'Failed to get events by organizer', error);
  }
};

/**
 * Get all application data in a single response
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAllAppData = (req, res) => {
  try {
    // Compile all necessary data in a single response
    const response = {
      // Get all location-specific events
      locationEvents: locationEvents,
      
      // Include spotlight events
      spotlightEvents: spotlightEvents,
      
      // Include flyer data for carousels
      flyerData: flyerData,
      
      // Include location metadata
      locationDetails: locationDetails,
      
      // Include available locations list
      locations: Object.keys(locationEvents).concat(
        // Extract unique locations from spotlight events that might not be in locationEvents
        [...new Set(spotlightEvents.map(event => event.eventLocation))]
      ).filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    };
    
    return sendSuccess(res, response);
  } catch (error) {
    console.error('Error getting all app data:', error);
    return sendError(res, 500, 'Failed to get application data', error);
  }
};

module.exports = {
  getAllEvents,
  getSpotlightEvents,
  getFlyers,
  getEventById,
  getLocations,
  getLocationDetails,
  getRawEvents,
  getLocationSpecificEvents,
  getEventsByOrganizer,
  getAllAppData
};