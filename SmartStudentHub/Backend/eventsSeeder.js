const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Organization = require('./models/Organization');
const sampleEvents = require('./data/sampleEvents');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const updateEvents = async () => {
  try {
    await Event.deleteMany({});
    console.log('All existing events deleted.');

    const organizations = await Organization.find();
    const orgMap = {};
    organizations.forEach(org => {
      orgMap[org.name] = org._id;
    });

    let idCounter = 1;

    for (const eventData of sampleEvents) {
      const { eventId, organization, ...rest } = eventData;

      const newEventId = eventId || idCounter.toString();
      idCounter++;

      const orgId = orgMap[organization];

      if (!orgId) {
        console.warn(`Organization not found for event ID ${newEventId}: ${organization}`);
        continue;
      }

      const eventPayload = { ...rest, eventId: newEventId, organization: orgId };

      await Event.create(eventPayload);
      console.log(`Added New Event ID: ${newEventId}`);
    }
    console.log('Events have been successfully updated.');
    process.exit();
  } catch (error) {
    console.error('Error during events update:', error.message);
    process.exit(1);
  }
};

connectDB().then(updateEvents);