const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  seedAdmin();
});

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@srkrec.edu.in' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      await User.create({
        name: 'Club Administrator',
        email: 'admin@srkrec.edu.in',
        password: hashedPassword,
        registerNo: 'ADMIN',
        deptYear: 'Staff',
        isVerified: true,
        isAdmin: true,
      });
      console.log('Admin user seeded successfully inside MongoDB!');
    }
  } catch (error) {
    console.log('Seeding skipped (possibly db not connected yet). That is fine, in-memory works too.', error.message);
  }
};

const app = express();

// Middlewares
app.use(cors({ origin: '*' })); // Allow cross origin resources
app.use(express.json());

// Serve local uploaded files statically if Cloudinary fallback was triggered
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/appRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SRKR Coding Club Recruitment API is active.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
