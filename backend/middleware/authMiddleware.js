const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { inMemoryUsers } = require('../controllers/authController');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'srkr_jwt_secret_key_12345');

      const isDbConnected = mongoose.connection.readyState === 1;

      if (isDbConnected) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const found = inMemoryUsers.find((u) => u._id === decoded.id || u.id === decoded.id);
        if (found) {
          const { password, ...userWithoutPassword } = found;
          req.user = userWithoutPassword;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in context' });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only.' });
  }
};

module.exports = { protect, adminOnly };
