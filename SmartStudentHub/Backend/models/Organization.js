const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const OrganizationSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String, 
    required: true,
    minlength: 8,
    select: false
  },
  image: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['University', 'Non-Governmental Organization', 'Community Organization', 'Cultural Institution', 'Student Society', 'Artist Group', 'Community Group', 'Academic Society', 'Private Company', 'Entertainment Company', 'Educational Institution'],
    required: true,
  },
  subtype: {
    type: String,
    required: false,
  },
}, { timestamps: true });
OrganizationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
OrganizationSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('Organization', OrganizationSchema);