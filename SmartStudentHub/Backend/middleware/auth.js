const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const dotenv = require('dotenv');
dotenv.config();
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    if (req.user.type === 'organization') {
      const organization = await Organization.findById(req.user.id).select('-password');
      if (!organization) {
        return res.status(401).json({ message: 'Organization not found, authorization denied' });
      }
      req.user = organization;
      req.user.type = 'organization';
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }
      req.user = user;
      req.user.type = 'user';
    }
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};
module.exports = authMiddleware;