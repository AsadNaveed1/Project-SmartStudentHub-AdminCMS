const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add your full name'],
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  university: {
    type: String,
    required: [true, 'Please add your university name'],
    default: 'N/A',
  },
  universityYear: {
    type: String,
    required: [true, 'Please add your university year'],
  },
  degree: {
    type: String,
    required: [true, 'Please add your degree'],
  },
  degreeClassification: {
    type: String,
    required: [true, 'Please add your degree classification'],
    enum: ['undergraduate', 'postgraduate', 'staff'],
  },
  faculty: {
    type: String,
    required: [true, 'Please add your faculty'],
    enum: [
      'Faculty of Architecture',
      'Faculty of Business and Economics',
      'Faculty of Engineering',
      'Faculty of Medicine',
      'Faculty of Science',
    ],
  },
  department: {
    type: String,
    required: [true, 'Please add your department'],
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: 'This user prefers to keep an air of mystery around them.',
  },
  joinedGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
  registeredEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', UserSchema);