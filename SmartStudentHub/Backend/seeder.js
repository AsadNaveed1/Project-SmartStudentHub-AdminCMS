const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./db');
dotenv.config();
connectDB();
const importData = async () => {
  try {
    await User.deleteMany();
    const testUser = new User({
      fullName: 'Test User',
      username: 'test_user1',
      email: 'test1@email.com',
      password: 'password12',
      university: 'Example University', 
      universityYear: '3rd Year',
      degree: 'Bachelor of Science in Computer Science',
      bio: 'This is a test user bio. Passionate about technology and community building.',
    });
    await testUser.save();
    console.log('Test user imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};
importData();