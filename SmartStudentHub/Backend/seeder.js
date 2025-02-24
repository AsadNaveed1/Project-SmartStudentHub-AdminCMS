const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Group = require('./models/Group');
const User = require('./models/User'); 
const sampleOrganizations = require('./data/sampleOrganizations');
const sampleEvents = require('./data/sampleEvents');
const sampleGroups = require('./data/sampleGroups');
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
const importData = async () => {
  try {
    await Organization.deleteMany();
    await Event.deleteMany();
    await Group.deleteMany();
    await User.deleteMany();
    console.log('Users cleared.');
    console.log('Events cleared.');
    console.log('Groups cleared.');
    console.log('Organizations cleared.');
    const createdOrganizations = await Organization.insertMany(sampleOrganizations);
    console.log('Organizations Imported');
    const orgMap = {};
    createdOrganizations.forEach(org => {
      orgMap[org.name] = org._id;
    });
    const eventsWithOrg = sampleEvents.map(event => ({
      ...event,
      organization: orgMap[event.organization] || null,
    }));
    await Event.insertMany(eventsWithOrg);
    console.log('Events Imported');
    await Group.insertMany(sampleGroups);
    console.log('Groups Imported');
    const user = new User({
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'password12', 
      university: 'HKU',
      universityYear: '3rd Year',
      degree: 'Computer Science',
      bio: 'A passionate developer.',
    });
    await user.save();
    console.log('Sample User Created');
    process.exit();
  } catch (error) {
    console.error('Error during data import:', error.message);
    process.exit(1);
  }
};
const destroyData = async () => {
  try {
    await Organization.deleteMany();
    await Event.deleteMany();
    await Group.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.error('Error with data destruction:', error.message);
    process.exit(1);
  }
};
connectDB();
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}