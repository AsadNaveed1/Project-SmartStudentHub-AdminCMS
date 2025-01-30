const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: false,
  },
  commonCore: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  joinedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });
module.exports = mongoose.model('Group', GroupSchema);