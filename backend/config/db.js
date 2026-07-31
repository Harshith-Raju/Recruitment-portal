const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/srkr_coding_club');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    // Do not crash the server in local dev setups
    console.warn('Continuing execution with simulation fallback if needed...');
  }
};

module.exports = connectDB;
