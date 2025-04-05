const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();
const triggerModelRetrain = async () => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5003/retrain';
    await axios.post(mlServiceUrl);
    console.log('Model retraining triggered.');
  } catch (error) {
    console.error('Error triggering model retraining:', error.message);
  }
};
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('registeredUsers', 'fullName email')
      .populate('organization', 'name image');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/organization', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'organization') {
      return res.status(403).json({ message: 'Not authorized. Only organizations can access their events.' });
    }
    const events = await Event.find({ organization: req.user.id })
    .populate('registeredUsers', 'fullName email universityYear degree faculty department')
    .populate('organization', 'name image');
    res.json(events);
  } catch (error) {
    console.error('Error fetching organization events:', error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const events = await Event.find({ subtype: category })
      .populate('registeredUsers', 'fullName email')
      .populate('organization', 'name image');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by category:', error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id })
      .populate('registeredUsers', 'fullName email username university universityYear degree degreeClassification faculty department')
      .populate('organization', 'name email location type image');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error.message);
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
    capacity,
    price
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
    if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use "DD-MM-YYYY".' });
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
      capacity: capacity || 0,
      price: price || 0
    });
    await event.save();
    await event.populate('organization', 'name image');
    await triggerModelRetrain();
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
    capacity,
    price
  } = req.body;
  const eventFields = {};
  if (title) eventFields.title = title;
  if (image) eventFields.image = image;
  if (summary) eventFields.summary = summary;
  if (description) eventFields.description = description;
  if (date) {
    if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use "DD-MM-YYYY".' });
    }
    eventFields.date = date;
  }
  if (time) eventFields.time = time;
  if (type) eventFields.type = type;
  if (subtype) eventFields.subtype = subtype;
  if (location) eventFields.location = location;
  if (name) eventFields.name = name;
  if (capacity !== undefined) eventFields.capacity = capacity;
  if (price !== undefined) eventFields.price = price;
  try {
    let event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (req.user.type === 'organization' && event.organization.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event.' });
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
    ).populate('organization', 'name image');
    await triggerModelRetrain();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User already registered for this event.' });
    }
    if (event.capacity > 0 && event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: 'This event has reached its maximum capacity.' });
    }
    event.registeredUsers.push(req.user.id);
    await event.save();
    const user = await User.findById(req.user.id);
    user.registeredEvents.push(event._id);
    await user.save();
    await triggerModelRetrain();
    res.json({ message: 'Registered for the event successfully.' });
  } catch (error) {
    console.error('Error registering for event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (req.user.type === 'organization' && event.organization.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );
    await Event.deleteOne({ _id: event._id });
    await triggerModelRetrain();
    res.json({ message: 'Event removed.' });
  } catch (error) {
    console.error('Error deleting event:', error.message);
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
    await triggerModelRetrain();
    res.json({ message: 'Withdrawn from the event successfully.' });
  } catch (error) {
    console.error('Error withdrawing from event:', error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('registeredEvents');
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    const registeredEvents = user.registeredEvents;
    if (registeredEvents.length === 0) {
      return res.json({
        contentBased: [],
        mlBased: [],
        combined: [],
        message: 'No registered events to base recommendations on.',
      });
    }
    const types = new Set();
    const subtypes = new Set();
    const registeredEventIds = new Set();
    registeredEvents.forEach((event) => {
      if (event.type) types.add(event.type);
      if (event.subtype) subtypes.add(event.subtype);
      if (event.eventId) registeredEventIds.add(event.eventId);
    });
    console.log('Types:', Array.from(types));
    console.log('Subtypes:', Array.from(subtypes));
    console.log('Registered Event IDs:', Array.from(registeredEventIds));
    const contentBased = await Event.find({
      $and: [
        {
          $or: [
            { type: { $in: Array.from(types) } },
            { subtype: { $in: Array.from(subtypes) } },
          ],
        },
        { eventId: { $nin: Array.from(registeredEventIds) } },
        { date: { $gte: moment().format('DD-MM-YYYY') } },
      ],
    })
      .populate('organization', 'name image')
      .limit(20);
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5003/recommend';
    const payload = {
      user_id: user._id.toString(),
      num_recommendations: 5,
    };
    let mlBased = [];
    try {
      const mlResponse = await axios.post(ML_SERVICE_URL, payload, { timeout: 5000 });
      if (mlResponse.data && mlResponse.data.recommendations) {
        mlBased = mlResponse.data.recommendations;
        console.log('ML-Based Recommendations:', mlBased);
      } else {
        console.warn('ML service response does not contain recommendations.');
      }
      mlBased = mlBased.filter(
        (event) =>
          !registeredEventIds.has(event.eventId) &&
          moment(event.date, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day')
      );
      console.log('ML-Based Recommendations After Filtering:', mlBased);
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      if (mlError.response && mlError.response.data) {
        console.error('ML Service Response:', mlError.response.data);
      }
      mlBased = [];
    }
    const combinedRecommendationsMap = new Map();
    contentBased.forEach((event) => {
      combinedRecommendationsMap.set(event.eventId, event);
    });
    mlBased.forEach((mlEvent) => {
      if (!combinedRecommendationsMap.has(mlEvent.eventId)) {
        combinedRecommendationsMap.set(mlEvent.eventId, mlEvent);
      }
    });
    const combinedRecommendations = Array.from(combinedRecommendationsMap.values());
    res.json({
      contentBased: contentBased,
      mlBased: mlBased,
      combined: combinedRecommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    if (error.response && error.response.data) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).send('Server Error');
  }
});
module.exports = router;