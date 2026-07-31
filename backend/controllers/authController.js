const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'srkr_jwt_secret_key_12345', {
    expiresIn: '30d',
  });
};

// In-memory fallback database
const adminSalt = bcrypt.genSaltSync(10);
const hashedAdminPassword = bcrypt.hashSync('adminpassword123', adminSalt);
let inMemoryUsers = [
  {
    _id: 'admin-user-id-0000',
    id: 'admin-user-id-0000',
    name: 'Club Administrator',
    email: 'admin@srkrec.edu.in',
    password: hashedAdminPassword,
    registerNo: 'ADMIN',
    deptYear: 'Staff',
    profilePicture: '',
    isVerified: true,
    isAdmin: true,
  }
];

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Simulated email transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

const sendOTPEmail = async (email, otp) => {
  console.log(`[SMTP SIMULATOR] OTP Code for ${email} is: ${otp}`);
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: '"SRKR Coding Club" <recruitment@srkrec.edu.in>',
      to: email,
      subject: 'Verification OTP - SRKR Coding Club',
      text: `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`,
      html: `<h3>Verification OTP</h3><p>Your OTP for verification is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn('SMTP Send failed. That is fine, code was logged in console.', err.message);
  }
};

// @desc    Register new student
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, registerNo, deptYear } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (isDbConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      await User.create({
        name,
        email,
        password: hashedPassword,
        registerNo,
        deptYear,
        otpCode: otp,
        otpExpires,
        isVerified: false,
      });
    } else {
      // Fallback
      const userExists = inMemoryUsers.find((u) => u.email === email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists (in-memory db)' });
      }

      const user = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email,
        password: hashedPassword,
        registerNo,
        deptYear,
        otpCode: otp,
        otpExpires,
        isVerified: false,
        profilePicture: '',
      };
      inMemoryUsers.push(user);
    }

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful! Verification OTP sent.',
      email,
      debugOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = inMemoryUsers.find((u) => u.email === email);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    user.isVerified = true;
    user.otpCode = '';
    user.otpExpires = null;

    if (isDbConnected()) {
      await user.save();
    }

    res.status(200).json({
      message: 'Email verified successfully!',
      token: generateToken(user._id || user.id),
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        registerNo: user.registerNo,
        deptYear: user.deptYear,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = inMemoryUsers.find((u) => u.email === email);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      if (isDbConnected()) {
        await user.save();
      }
      await sendOTPEmail(email, otp);

      return res.status(403).json({
        message: 'Account not verified. Verification OTP sent.',
        unverified: true,
        email: user.email,
        debugOtp: otp,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      token: generateToken(user._id || user.id),
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        registerNo: user.registerNo,
        deptYear: user.deptYear,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Request OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = inMemoryUsers.find((u) => u.email === email);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    if (isDbConnected()) {
      await user.save();
    }

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: 'Password reset OTP sent successfully!',
      email: user.email,
      debugOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      user = inMemoryUsers.find((u) => u.email === email);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otpCode = '';
    user.otpExpires = null;
    user.isVerified = true;

    if (isDbConnected()) {
      await user.save();
    }

    res.status(200).json({ message: 'Password has been reset successfully! Please login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  let user = req.user;
  if (!user && !isDbConnected()) {
    // If not connected to db, payload is resolved via middleware verify
    return res.status(200).json({ user: req.user });
  }
  res.status(200).json({ user });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let user;

    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = inMemoryUsers.find((u) => u._id === userId || u.id === userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.registerNo = req.body.registerNo || user.registerNo;
    user.deptYear = req.body.deptYear || user.deptYear;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (isDbConnected()) {
      await user.save();
    }

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        registerNo: user.registerNo,
        deptYear: user.deptYear,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  // Export for middleware to check
  inMemoryUsers,
};
