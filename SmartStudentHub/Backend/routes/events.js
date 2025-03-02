// events.js

const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Helper function to trigger ML model retraining
const triggerModelRetrain = async () => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5003/retrain';
    await axios.post(mlServiceUrl);
    console.log('Model retraining triggered.');
  } catch (error) {
    console.error('Error triggering model retraining:', error.message);
  }
};

// Root route: Get all events
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

// Create a new event
router.post('/', authMiddleware, async (req, res) => {
  const {
    eventId,
    title,
    image,
    summary,
    description,
    date, // Expected in "DD-MM-YYYY" format
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

    // **Date Validation: Ensure the date is in "DD-MM-YYYY" format**
    if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use "DD-MM-YYYY".' });
    }

    event = new Event({
      eventId,
      title,
      image,
      summary,
      description,
      date, // Store as string
      time,
      organization: organization._id,
      type,
      subtype,
      location,
      name,
    });

    await event.save();

    // **Trigger Model Retraining**
    await triggerModelRetrain();

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).send('Server Error');
  }
});

// Update an existing event
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    title,
    image,
    summary,
    description,
    date, // Expected in "DD-MM-YYYY" format if provided
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
  if (date) {
    // **Date Validation: Ensure the date is in "DD-MM-YYYY" format**
    if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format. Use "DD-MM-YYYY".' });
    }
    eventFields.date = date; // Store as string
  }
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

    // **Trigger Model Retraining**
    await triggerModelRetrain();

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).send('Server Error');
  }
});

// Delete an event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Remove the event from all users' registeredEvents
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

    await event.remove();

    // **Trigger Model Retraining**
    await triggerModelRetrain();

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

    // **Trigger Model Retraining**
    await triggerModelRetrain();

    res.json({ message: 'Registered for the event successfully.' });
  } catch (error) {
    console.error('Error registering for event:', error.message);
    res.status(500).send('Server Error');
  }
});

// Withdraw from an event
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

    // **Trigger Model Retraining**
    await triggerModelRetrain();

    res.json({ message: 'Withdrawn from the event successfully.' });
  } catch (error) {
    console.error('Error withdrawing from event:', error.message);
    res.status(500).send('Server Error');
  }
});

// Recommendation Endpoint
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    // ===== Content-Based Recommendations =====
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

    // Extract unique types, subtypes from registered events
    const types = new Set();
    const subtypes = new Set();
    const registeredEventIds = new Set();

    registeredEvents.forEach((event) => {
      if (event.type) types.add(event.type);
      if (event.subtype) subtypes.add(event.subtype);
      if (event.eventId) registeredEventIds.add(event.eventId);
    });

    // **Logging for Debugging**
    console.log('Types:', Array.from(types));
    console.log('Subtypes:', Array.from(subtypes));
    console.log('Registered Event IDs:', Array.from(registeredEventIds));

    // **Content-Based Recommendations: Fetch events matching type or subtype, excluding already registered and upcoming**
    const contentBased = await Event.find({
      $and: [
        {
          $or: [
            { type: { $in: Array.from(types) } },
            { subtype: { $in: Array.from(subtypes) } },
          ],
        },
        { eventId: { $nin: Array.from(registeredEventIds) } },
        { date: { $gte: moment().format('DD-MM-YYYY') } }, // Ensure upcoming events
      ],
    })
      .populate('organization', 'name')
      .limit(20);

    // **Logging for Debugging**
    console.log(
      'Content-Based Recommendations After Date Filter:',
      contentBased.map((e) => ({
        eventId: e.eventId,
        subtype: e.subtype,
        date: e.date,
      }))
    );

    // ===== ML-Based Recommendations =====
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

      // **Additional Filtering**
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
      // Proceed without ML-based recommendations
      mlBased = [];
    }

    // ===== Combine Recommendations =====
    const combinedRecommendationsMap = new Map();

    // Add content-based events
    contentBased.forEach((event) => {
      combinedRecommendationsMap.set(event.eventId, event);
    });

    // Add ML-based events if not already present
    mlBased.forEach((mlEvent) => {
      if (!combinedRecommendationsMap.has(mlEvent.eventId)) {
        combinedRecommendationsMap.set(mlEvent.eventId, mlEvent);
      }
    });

    const combinedRecommendations = Array.from(combinedRecommendationsMap.values());

    // **Logging Combined Recommendations**
    console.log(
      'Combined Recommendations:',
      combinedRecommendations.map((e) => ({
        eventId: e.eventId,
        subtype: e.subtype,
        date: e.date,
      }))
    );

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