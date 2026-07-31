const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { verifySmtpConnection } = require('./utils/mailer');

dotenv.config();

const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@srkrec.edu.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: 'Club Administrator',
        email: adminEmail,
        password: hashedPassword,
        registerNo: 'ADMIN',
        deptYear: 'Staff',
        isVerified: true,
        isAdmin: true,
      });
      console.log(`Admin user seeded: ${adminEmail}`);
    }
  } catch (error) {
    console.log('Admin seeding skipped:', error.message);
  }
};

const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    await seedAdmin();
  }
  await verifySmtpConnection();

  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5000'];

  app.use(
    cors({
      origin: isProduction ? allowedOrigins : true,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/applications', require('./routes/appRoutes'));

  app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    res.json({
      status: 'ok',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  });

  if (isProduction) {
    const frontendDist = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({ message: 'SRKR Coding Club Recruitment API is active.' });
    });
  }

  app.use((err, req, res, next) => {
    console.error('Server error stack:', err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

startServer();
