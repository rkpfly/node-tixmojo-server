const { MongoClient } = require('mongodb');
const { spotlightEvents, flyerData, locationEvents, organizers, locationDetails } = require('./data/events');

// MongoDB connection URI
const uri = process.env.MONGODB_URI;
const dbName = 'tixmojo';

async function seedDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    
    // Drop existing collections if they exist
    const collections = ['events', 'organizers', 'flyers', 'locations', 'locationDetails'];
    for (const collection of collections) {
      try {
        await db.collection(collection).drop();
        console.log(`Dropped existing ${collection} collection`);
      } catch (error) {
        console.log(`No ${collection} collection to drop`);
      }
    }

    // Prepare events data
    const allEvents = [];

    // Add spotlight events
    console.log(`Adding ${spotlightEvents.length} spotlight events...`);
    allEvents.push(...spotlightEvents.map(event => ({
      ...event,
      eventType: 'spotlight'
    })));

    // Add location events
    let locationEventCount = 0;
    Object.entries(locationEvents).forEach(([location, events]) => {
      console.log(`Adding ${events.length} events for ${location}...`);
      locationEventCount += events.length;
      allEvents.push(...events.map(event => ({
        ...event,
        eventType: 'location',
        eventLocation: location
      })));
    });

    // Insert all events into the events collection
    if (allEvents.length > 0) {
      console.log(`Inserting ${allEvents.length} total events...`);
      const result = await db.collection('events').insertMany(allEvents);
      console.log(`${result.insertedCount} events inserted successfully.`);

      // Create indexes for better query performance
      await db.collection('events').createIndex({ id: 1 }, { unique: true });
      await db.collection('events').createIndex({ eventLocation: 1 });
      await db.collection('events').createIndex({ eventType: 1 });
      await db.collection('events').createIndex({ organizerId: 1 });
      console.log('Database indexes created for events collection.');
    }

    // Store organizers in a separate collection
    const organizersArray = Object.values(organizers);
    if (organizersArray.length > 0) {
      console.log(`Inserting ${organizersArray.length} organizers...`);
      const result = await db.collection('organizers').insertMany(organizersArray);
      console.log(`${result.insertedCount} organizers inserted successfully.`);

      // Create organizer index
      await db.collection('organizers').createIndex({ id: 1 }, { unique: true });
      console.log('Database indexes created for organizers collection.');
    }

    // Store flyers data
    if (flyerData && flyerData.length > 0) {
      console.log(`Inserting ${flyerData.length} flyers...`);
      const result = await db.collection('flyers').insertMany(flyerData);
      console.log(`${result.insertedCount} flyers inserted successfully.`);

      // Create flyer index
      await db.collection('flyers').createIndex({ id: 1 }, { unique: true });
      console.log('Database indexes created for flyers collection.');
    }

    // Store location details
    if (locationDetails) {
      const locationDetailsArray = Object.entries(locationDetails).map(([key, value]) => ({
        id: key.toLowerCase(), // Ensure IDs are lowercase
        ...value
      }));

      // Add Sydney location details explicitly if not already in the data
      if (!locationDetailsArray.some(loc => loc.id === 'sydney')) {
        locationDetailsArray.push({
          id: 'sydney',
          name: 'Sydney',
          title: 'Events in',
          subtitle: 'Discover the most popular events happening in Sydney right now',
          description: 'Sydney is Australia\'s iconic harbor city and the capital of New South Wales.',
          timezone: 'Australia/Sydney',
          coordinates: {
            latitude: -33.8688,
            longitude: 151.2093
          }
        });
      }

      console.log(`Inserting ${locationDetailsArray.length} location details...`);
      const result = await db.collection('locationDetails').insertMany(locationDetailsArray);
      console.log(`${result.insertedCount} location details inserted successfully.`);

      // Create location index
      await db.collection('locationDetails').createIndex({ id: 1 }, { unique: true });
      console.log('Database indexes created for location details collection.');
    }

    // Store locations data
    const locationsArray = Object.keys(locationEvents || {});
    if (locationsArray.length > 0) {
      const locationsData = locationsArray.map(location => ({
        name: location,
        eventCount: locationEvents[location].length
      }));

      console.log(`Inserting ${locationsArray.length} locations...`);
      const result = await db.collection('locations').insertMany(locationsData);
      console.log(`${result.insertedCount} locations inserted successfully.`);

      // Create location name index
      await db.collection('locations').createIndex({ name: 1 }, { unique: true });
      console.log('Database indexes created for locations collection.');
    }

    console.log('Database seeded successfully!');

    // Verify data was inserted
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(`Verification: Found ${count} documents in ${collection} collection.`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed.');
    }
  }
}

// Run the seed function
seedDatabase().catch(console.error);