const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
router.get('/:groupId', authMiddleware, async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await Message.find({ group: groupId })
      .populate('sender', 'username fullName')
      .sort({ sentAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;