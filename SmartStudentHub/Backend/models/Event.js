const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  summary: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  type: {
    type: String,
    enum: ['University Event', 'External Event'],
    required: true,
  },
  subtype: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  capacity: {
    type: Number,
    required: false,
    default: 0
  },
  price: {
    type: Number,
    required: false,
    default: 0
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });
module.exports = mongoose.model('Event', EventSchema);