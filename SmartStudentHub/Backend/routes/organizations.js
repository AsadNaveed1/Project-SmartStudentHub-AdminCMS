const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find().select('-password');
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    res.status(500).send('Server Error');
  }
});
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findOne({ 
      organizationId: req.params.id 
    }).select('-password');
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error.message);
    res.status(500).send('Server Error');
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.type !== 'organization' || req.user.organizationId !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized to update this organization.' });
  }
  const {
    name,
    email,
    image,
    description,
    location,
    type,
    subtype,
  } = req.body;
  const orgFields = {};
  if (name) orgFields.name = name;
  if (email) orgFields.email = email;
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
    ).select('-password');
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error.message);
    res.status(500).send('Server Error');
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.type !== 'organization' || req.user.organizationId !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized to delete this organization.' });
  }
  try {
    const organization = await Organization.findOne({ organizationId: req.params.id });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    const events = await Event.find({ organization: organization._id });
    if (events.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with associated events. Please delete or reassign those events first.' 
      });
    }
    await organization.remove();
    res.json({ message: 'Organization removed.' });
  } catch (error) {
    console.error('Error deleting organization:', error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;