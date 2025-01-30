const mongoose = require('mongoose');
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
module.exports = mongoose.model('Organization', OrganizationSchema);