const { formatDate, formatFullDate } = require('../data/events');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { connectToDatabase } = require('../utils/db');

const getAllEvents = async (req, res) => {
  try {
    const location = req.query.location || 'Sydney';
    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    const { db } = await connectToDatabase();
    const events = await db.collection('events').find({
      eventLocation: formattedLocation,
      eventType: 'location'
    }).toArray();

    return sendSuccess(res, events);
  } catch (error) {
    console.error('Error getting events:', error);
    return sendError(res, 500, 'Failed to get events', error);
  }
};

const getSpotlightEvents = async (req, res) => {
  try {
    const location = req.query.location;
    const { db } = await connectToDatabase();
    const query = { eventType: 'spotlight' };

    if (location) {
      query.eventLocation = location.toLowerCase() === location ?
        location : location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    }

    const spotlightEvents = await db.collection('events').find(query).toArray();
    return sendSuccess(res, spotlightEvents);
  } catch (error) {
    console.error('Error getting spotlight events:', error);
    return sendError(res, 500, 'Failed to get spotlight events', error);
  }
};

const getFlyers = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const flyers = await db.collection('flyers').find({}).toArray();
    return sendSuccess(res, flyers);
  } catch (error) {
    console.error('Error getting flyers:', error);
    return sendError(res, 500, 'Failed to get flyers', error);
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { db } = await connectToDatabase();

    const event = await db.collection('events').findOne({ id });
    if (!event) return sendError(res, 404, 'Event not found');

    if (!event.tags) event.tags = ["Featured Event"];
    else if (!Array.isArray(event.tags)) event.tags = [event.tags];

    if (event.organizerId) {
      const organizer = await db.collection('organizers').findOne({ id: event.organizerId });
      if (organizer) event.organizer = organizer;
    }

    return sendSuccess(res, event);
  } catch (error) {
    console.error('Error getting event:', error);
    return sendError(res, 500, 'Failed to get event', error);
  }
};

const getLocations = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const locations = await db.collection('locations').find({}).toArray();
    const locationNames = locations.map(location => location.name);

    const eventLocations = await db.collection('events').distinct('eventLocation');
    const allLocations = [...new Set([...locationNames, ...eventLocations])];

    return sendSuccess(res, allLocations);
  } catch (error) {
    console.error('Error getting locations:', error);
    return sendError(res, 500, 'Failed to get locations', error);
  }
};

const getRawEvents = async (req, res) => {
  try {
    const location = req.query.location || 'Sydney';
    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    const { db } = await connectToDatabase();
    const events = await db.collection('events').find({ eventLocation: formattedLocation }).toArray();

    return sendSuccess(res, events);
  } catch (error) {
    console.error('Error getting raw events data:', error);
    return sendError(res, 500, 'Failed to get raw events data', error);
  }
};

const getLocationSpecificEvents = async (req, res) => {
  try {
    const { location } = req.params;
    if (!location) return sendError(res, 400, 'Location parameter is required');

    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

    const { db } = await connectToDatabase();
    const events = await db.collection('events').find({ eventLocation: formattedLocation }).toArray();

    return sendSuccess(res, events);
  } catch (error) {
    console.error('Error getting location-specific events:', error);
    return sendError(res, 500, 'Failed to get location events', error);
  }
};

const getLocationDetails = async (req, res) => {
  try {
    const { location } = req.params;
    const { db } = await connectToDatabase();

    if (location) {
      const locationLower = location.toLowerCase();

      let locationDetails = await db.collection('locationDetails').findOne({ id: locationLower });

      if (!locationDetails) {
        locationDetails = await db.collection('locationDetails').findOne({
          id: { $regex: new RegExp(`^${locationLower}$`, 'i') }
        });
      }

      if (!locationDetails) {
        locationDetails = await db.collection('locationDetails').findOne({
          name: { $regex: new RegExp(`^${location}$`, 'i') }
        });
      }

      if (!locationDetails) {
        const locationFromList = await db.collection('locations').findOne({
          name: { $regex: new RegExp(`^${location}$`, 'i') }
        });

        if (locationFromList) {
          locationDetails = {
            id: locationFromList.name.toLowerCase(),
            name: locationFromList.name,
            title: 'Events in',
            subtitle: `Discover the most popular events happening in ${locationFromList.name} right now`,
            description: `Explore all upcoming events in ${locationFromList.name}`
          };
        }
      }

      if (!locationDetails) {
        console.log(`Location details not found for: ${location}, providing fallback data`);
        locationDetails = {
          id: location.toLowerCase(),
          name: location,
          title: 'Events in',
          subtitle: `Discover the most popular events happening in ${location} right now`,
          description: `Explore all upcoming events in ${location}`
        };
      }

      return sendSuccess(res, locationDetails);
    } else {
      const locationDetails = await db.collection('locationDetails').find({}).toArray();
      const locationDetailsObj = locationDetails.reduce((acc, location) => {
        acc[location.id] = location;
        return acc;
      }, {});
      return sendSuccess(res, locationDetailsObj);
    }
  } catch (error) {
    console.error('Error getting location details:', error);
    return sendError(res, 500, 'Failed to get location details', error);
  }
};

const getEventsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    if (!organizerId) return sendError(res, 400, 'Organizer ID parameter is required');

    const { db } = await connectToDatabase();
    const events = await db.collection('events').find({ organizerId }).toArray();

    return sendSuccess(res, events);
  } catch (error) {
    console.error('Error getting events by organizer:', error);
    return sendError(res, 500, 'Failed to get events by organizer', error);
  }
};

const getAllAppData = async (req, res) => {
  try {
    const { db } = await connectToDatabase();

    const [events, spotlightEvents, flyers, locationDetails, locations] = await Promise.all([
      db.collection('events').find({}).toArray(),
      db.collection('events').find({ eventType: 'spotlight' }).toArray(),
      db.collection('flyers').find({}).toArray(),
      db.collection('locationDetails').find({}).toArray(),
      db.collection('locations').find({}).toArray()
    ]);

    const locationEventsMap = events
      .filter(event => event.eventLocation && event.eventType !== 'spotlight')
      .reduce((map, event) => {
        const location = event.eventLocation;
        if (!map[location]) map[location] = [];
        map[location].push(event);
        return map;
      }, {});

    const locationDetailsObj = locationDetails.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});

    const locationNames = locations.map(location => location.name);

    const response = {
      locationEvents: locationEventsMap,
      spotlightEvents,
      flyerData: flyers,
      locationDetails: locationDetailsObj,
      locations: locationNames
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
