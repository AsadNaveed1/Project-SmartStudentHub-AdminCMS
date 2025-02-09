// app.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const cors = require('cors');
const http = require('http'); // Import HTTP
const { Server } = require('socket.io'); // Import Socket.IO

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

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//port is 5002 in env file
// Port from environment
const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Update this with your frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Middleware for Socket.IO authentication
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

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  // Join a group room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`${socket.user.username} joined group ${groupId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ groupId, message }) => {
    const Message = require('./models/Message');

    // Save message to database
    const newMessage = new Message({
      group: groupId,
      sender: socket.user._id,
      text: message,
    });

    await newMessage.save();

    // Populate sender details
    const populatedMessage = await newMessage.populate('sender', 'username fullName');

    // Emit message to the group
    io.to(groupId).emit('newMessage', populatedMessage);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));