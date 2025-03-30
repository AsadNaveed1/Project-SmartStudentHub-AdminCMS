const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Organization = require('./models/Organization');
const sampleOrganizations = require('./data/sampleOrganizations');

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

const setupOrganizations = async () => {
  try {

    for (const orgData of sampleOrganizations) {
      const { organizationId } = orgData;

      const existingOrg = await Organization.findOne({ organizationId });

      if (existingOrg) {
        await Organization.updateOne({ organizationId }, orgData);
        console.log(`Updated Organization ID: ${organizationId}`);
      } else {
        await Organization.create(orgData);
        console.log(`Added New Organization ID: ${organizationId}`);
      }
    }
    
    console.log('Organizations have been successfully updated.');
    process.exit();
  } catch (error) {
    console.error('Error during organizations update:', error.message);
    process.exit(1);
  }
};

connectDB().then(setupOrganizations);