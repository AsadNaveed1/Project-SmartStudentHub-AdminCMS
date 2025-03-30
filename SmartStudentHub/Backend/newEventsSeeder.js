const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const Organization = require('./models/Organization');
const newEvents = require('./data/newEventsData');

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

const seedNewEvents = async () => {
  try {
    const organizations = await Organization.find();
    const orgMap = {};
    organizations.forEach(org => {
      orgMap[org.name] = org._id;
    });

    console.log('Available organizations:', Object.keys(orgMap));

    const highestIdEvent = await Event.findOne().sort({ eventId: -1 });
    let startId = 101;
    if (highestIdEvent && parseInt(highestIdEvent.eventId) >= startId) {
      startId = parseInt(highestIdEvent.eventId) + 1;
    }

    let idCounter = startId;
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const eventData of newEvents) {
      const { organization, ...rest } = eventData;
      
      const eventId = rest.eventId || idCounter.toString();
      idCounter++;

      let orgId = orgMap[organization];

      if (!orgId) {
        console.warn(`Organization not found for event: ${rest.title}, Organization: ${organization}`);
        
        const newOrgId = `auto_${Math.floor(Math.random() * 10000)}`;
        const newOrg = await Organization.create({
          organizationId: newOrgId,
          name: organization || "Unknown Organization",
          description: `Auto-generated organization for events`,
          location: rest.location || "Unknown",
          type: "University",
          image: "https://via.placeholder.com/150",
        });
        
        console.log(`Created new organization: ${newOrg.name} with ID: ${newOrgId}`);
        
        orgId = newOrg._id;
        orgMap[newOrg.name] = orgId;
      }

      const eventPayload = { ...rest, eventId, organization: orgId };

      const existingEvent = await Event.findOne({ eventId });

      if (existingEvent) {
        await Event.updateOne({ eventId }, eventPayload);
        console.log(`Updated Event ID: ${eventId}, Title: ${rest.title}`);
        updatedCount++;
      } else {
        try {
          await Event.create(eventPayload);
          console.log(`Added New Event ID: ${eventId}, Title: ${rest.title}`);
          createdCount++;
        } catch (err) {
          console.error(`Error creating event ID ${eventId}: ${err.message}`);
          skippedCount++;
        }
      }
    }
    
    console.log(`Events summary: Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    console.log('Events have been successfully updated.');
    process.exit();
  } catch (error) {
    console.error('Error during events update:', error.message);
    process.exit(1);
  }
};

connectDB().then(seedNewEvents);