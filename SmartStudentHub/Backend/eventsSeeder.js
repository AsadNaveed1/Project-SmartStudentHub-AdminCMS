
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
    const organizations = await Organization.find();
    const orgMap = {};
    organizations.forEach(org => {
      orgMap[org.name] = org._id;
    });

    for (const eventData of sampleEvents) {
      const { eventId, organization, ...rest } = eventData;

      const orgId = orgMap[organization];

      if (!orgId) {
        console.warn(`Organization not found for event ID ${eventId}: ${organization}`);
        continue;
      }

      const eventPayload = { ...rest, organization: orgId };

      const existingEvent = await Event.findOne({ eventId });

      if (existingEvent) {
        await Event.updateOne({ eventId }, eventPayload);
        console.log(`Updated Event ID: ${eventId}`);
      } else {
        await Event.create(eventPayload);
        console.log(`Added New Event ID: ${eventId}`);
      }
    }
    console.log('Events have been successfully updated.');
    process.exit();
  } catch (error) {
    console.error('Error during events update:', error.message);
    process.exit(1);
  }
};

connectDB().then(updateEvents);