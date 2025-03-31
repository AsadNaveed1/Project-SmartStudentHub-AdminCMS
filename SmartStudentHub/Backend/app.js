const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
dotenv.config();
const app = express();
connectDB();
app.use(express.json());
app.use(cors());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/events', require('./routes/events'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/chatbot', require('./routes/chatbot'));
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
//port is 5002 in env file
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const jwt = require('jsonwebtoken');
const User = require('./models/User');
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`${socket.user.username} joined group ${groupId}`);
  });
  socket.on('sendMessage', async ({ groupId, message }) => {
    const Message = require('./models/Message');
    const newMessage = new Message({
      group: groupId,
      sender: socket.user._id,
      text: message,
    });
    await newMessage.save();
    const populatedMessage = await newMessage.populate('sender', 'username fullName');
    io.to(groupId).emit('newMessage', populatedMessage);
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));