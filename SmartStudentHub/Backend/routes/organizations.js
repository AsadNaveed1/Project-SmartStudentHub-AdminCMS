const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    res.status(500).send('Server Error');
  }
});
router.post('/', authMiddleware, async (req, res) => {
  const {
    organizationId,
    name,
    image,
    description,
    location,
    type,
    subtype,
  } = req.body;
  if (!organizationId || !name || !description || !location || !type) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }
  try {
    let organization = await Organization.findOne({ organizationId });
    if (organization) {
      return res.status(400).json({ message: 'Organization ID already exists.' });
    }
    organization = new Organization({
      organizationId,
      name,
      image,
      description,
      location,
      type,
      subtype,
    });
    await organization.save();
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error.message);
    res.status(500).send('Server Error');
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  const {
    name,
    image,
    description,
    location,
    type,
    subtype,
  } = req.body;
  const orgFields = {};
  if (name) orgFields.name = name;
  if (image) orgFields.image = image;
  if (description) orgFields.description = description;
  if (location) orgFields.location = location;
  if (type) orgFields.type = type;
  if (subtype) orgFields.subtype = subtype;
  try {
    let organization = await Organization.findOne({ organizationId: req.params.id });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    organization = await Organization.findOneAndUpdate(
      { organizationId: req.params.id },
      { $set: orgFields },
      { new: true }
    );
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const organization = await Organization.findOne({ organizationId: req.params.id });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    const events = await Event.find({ organization: organization._id });
    if (events.length > 0) {
      return res.status(400).json({ message: 'Cannot delete organization with associated events. Please delete or reassign those events first.' });
    }
    await organization.remove();
    res.json({ message: 'Organization removed.' });
  } catch (error) {
    console.error('Error deleting organization:', error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;