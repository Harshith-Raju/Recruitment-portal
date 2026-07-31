const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    registerNo: {
      type: String,
      default: '',
    },
    deptYear: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      default: '',
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: 'info' },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
