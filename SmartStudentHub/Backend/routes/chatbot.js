const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatbotService = require('../services/chatbotService');
const authMiddleware = require('../middleware/auth');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});
(async () => {
  try {
    await chatbotService.initialize();
  } catch (err) {
    console.error('Failed to initialize chatbot service:', err);
  }
})();
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const response = await chatbotService.getChatResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      response: "I'm sorry, I encountered an error. Please try again later." 
    });
  }
});
router.post('/upload-and-chat', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const message = req.body.message || '';
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const response = await chatbotService.getChatResponse(message, file.path);
    res.json({ response });
    setTimeout(() => {
      fs.unlink(file.path, err => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }, 5000);
  } catch (error) {
    console.error('Error in upload-and-chat endpoint:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      response: "I'm sorry, I couldn't process your image request. Please try again later." 
    });
  }
});
router.post('/update-index', authMiddleware, async (req, res) => {
  try {
    await chatbotService.updateVectorStore();
    res.json({ message: 'Vector store updated successfully' });
  } catch (error) {
    console.error('Error updating vector store:', error);
    res.status(500).json({ message: 'Failed to update vector store', error: error.message });
  }
});
router.get('/health', async (req, res) => {
  try {
    const availableModels = await chatbotService.getAvailableModels();
    const status = {
      service: 'Chatbot Service',
      status: 'online',
      vectorStoreInitialized: chatbotService.vectorStore !== null,
      lastUpdateTime: chatbotService.lastVectorStoreUpdate 
        ? new Date(chatbotService.lastVectorStoreUpdate).toISOString() 
        : 'never',
      modelConfiguration: {
        embeddings: 'nomic-embed-text',
        chat: chatbotService.llmModel,
        multimodal: chatbotService.imageModel
      },
      availableModels: availableModels
    };
    res.json(status);
  } catch (error) {
    console.error('Error checking chatbot health:', error);
    res.status(500).json({ 
      service: 'Chatbot Service', 
      status: 'error', 
      error: error.message 
    });
  }
});
module.exports = router;