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
const faculties = {
  "Faculty of Architecture": [
    "Department of Architecture",
    "Department of Real Estate and Construction",
  ],
  "Faculty of Business and Economics": [
    "Department of Business Administration",
    "Department of Economics",
  ],
  "Faculty of Engineering": [
    "Department of Civil Engineering",
    "Department of Computer Science and Information Systems",
    "Department of Electrical and Electronic Engineering",
    "Department of Industrial and Manufacturing Systems Engineering",
    "Department of Mechanical Engineering",
  ],
  "Faculty of Medicine": [
    "Department of Anaesthesiology",
    "Department of Anatomy",
    "Department of Biochemistry",
    "Department of Clinical Oncology",
    "Department of Community Medicine",
    "Department of Diagnostic Radiology",
    "Department of Medicine",
    "Department of Microbiology",
    "Department of Nursing Studies",
    "Department of Obstetrics and Gynaecology",
    "Department of Orthopaedic Surgery",
    "Department of Paediatrics",
    "Department of Pathology",
    "Department of Pharmacology",
    "Department of Physiology",
    "Department of Psychiatry",
    "Department of Surgery",
  ],
  "Faculty of Science": [
    "Department of Chemistry",
    "Department of Earth Sciences",
    "Department of Ecology and Biodiversity",
    "Department of Mathematics",
    "Department of Physics",
    "Department of Statistics and Actuarial Science",
  ],
};
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
      degreeClassification: 'undergraduate',
      faculty: 'Faculty of Engineering',
      department: 'Department of Computer Science and Information Systems',
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