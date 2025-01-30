const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('joinedUsers', 'fullName email');
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/', authMiddleware, async (req, res) => {
  const {
    groupId,
    courseCode,
    courseName,
    department,
    commonCore,
    description,
  } = req.body;
  if (!groupId || !courseCode || !courseName || !description) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }
  try {
    let group = await Group.findOne({ groupId });
    if (group) {
      return res.status(400).json({ message: 'Group ID already exists.' });
    }
    group = new Group({
      groupId,
      courseCode,
      courseName,
      department,
      commonCore,
      description,
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error.message);
    res.status(500).send('Server Error');
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    courseCode,
    courseName,
    department,
    commonCore,
    description,
  } = req.body;
  const groupFields = {};
  if (courseCode) groupFields.courseCode = courseCode;
  if (courseName) groupFields.courseName = courseName;
  if (department) groupFields.department = department;
  if (commonCore) groupFields.commonCore = commonCore;
  if (description) groupFields.description = description;
  try {
    let group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    group = await Group.findOneAndUpdate(
      { groupId: req.params.id },
      { $set: groupFields },
      { new: true }
    ).populate('joinedUsers', 'fullName email');
    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    await User.updateMany(
      { joinedGroups: group._id },
      { $pull: { joinedGroups: group._id } }
    );
    await group.remove();
    res.json({ message: 'Group removed.' });
  } catch (error) {
    console.error('Error deleting group:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (group.joinedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User already joined this group.' });
    }
    group.joinedUsers.push(req.user.id);
    await group.save();
    const user = await User.findById(req.user.id);
    user.joinedGroups.push(group._id);
    await user.save();
    res.json({ message: 'Joined the group successfully.' });
  } catch (error) {
    console.error('Error joining group:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (!group.joinedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User has not joined this group.' });
    }
    group.joinedUsers = group.joinedUsers.filter(
      (userId) => userId.toString() !== req.user.id
    );
    await group.save();
    const user = await User.findById(req.user.id);
    user.joinedGroups = user.joinedGroups.filter(
      (groupId) => groupId.toString() !== group._id.toString()
    );
    await user.save();
    res.json({ message: 'Left the group successfully.' });
  } catch (error) {
    console.error('Error leaving group:', error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;