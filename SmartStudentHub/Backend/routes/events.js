const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('registeredUsers', 'fullName email')
      .populate('organization', 'name');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/', authMiddleware, async (req, res) => {
  const {
    eventId,
    title,
    image,
    summary,
    description,
    date,
    time,
    organizationId,
    type,
    subtype,
    location,
    name,
  } = req.body;
  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }
  try {
    let organization = await Organization.findOne({ organizationId: organizationId });
    if (!organization) {
      return res.status(400).json({ message: 'Organization not found.' });
    }
    let event = await Event.findOne({ eventId });
    if (event) {
      return res.status(400).json({ message: 'Event ID already exists.' });
    }
    event = new Event({
      eventId,
      title,
      image,
      summary,
      description,
      date,
      time,
      organization: organization._id,
      type,
      subtype,
      location,
      name,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    title,
    image,
    summary,
    description,
    date,
    time,
    organizationId,
    type,
    subtype,
    location,
    name,
  } = req.body;
  const eventFields = {};
  if (title) eventFields.title = title;
  if (image) eventFields.image = image;
  if (summary) eventFields.summary = summary;
  if (description) eventFields.description = description;
  if (date) eventFields.date = date;
  if (time) eventFields.time = time;
  if (type) eventFields.type = type;
  if (subtype) eventFields.subtype = subtype;
  if (location) eventFields.location = location;
  if (name) eventFields.name = name;
  try {
    let event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (organizationId) {
      let organization = await Organization.findOne({ organizationId: organizationId });
      if (!organization) {
        return res.status(400).json({ message: 'Organization not found.' });
      }
      eventFields.organization = organization._id;
    }
    event = await Event.findOneAndUpdate(
      { eventId: req.params.id },
      { $set: eventFields },
      { new: true }
    ).populate('organization', 'name');
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );
    await event.remove();
    res.json({ message: 'Event removed.' });
  } catch (error) {
    console.error('Error deleting event:', error.message);
    res.status(500).send('Server Error');
  }
});
// Register for an event
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User already registered for this event.' });
    }
    event.registeredUsers.push(req.user.id);
    await event.save();
    const user = await User.findById(req.user.id);
    user.registeredEvents.push(event._id);
    await user.save();
    res.json({ message: 'Registered for the event successfully.' });
  } catch (error) {
    console.error('Error registering for event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User is not registered for this event.' });
    }
    event.registeredUsers = event.registeredUsers.filter(
      (userId) => userId.toString() !== req.user.id
    );
    await event.save();
    const user = await User.findById(req.user.id);
    user.registeredEvents = user.registeredEvents.filter(
      (eventId) => eventId.toString() !== event._id.toString()
    );
    await user.save();
    res.json({ message: 'Withdrawn from the event successfully.' });
  } catch (error) {
    console.error('Error withdrawing from event:', error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;