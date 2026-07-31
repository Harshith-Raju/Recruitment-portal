const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  submitApplication,
  getApplicationStatus,
  getAdminApplications,
  getAdminStats,
  updateApplicationStatus,
  saveAdminNotesAndScore,
  scheduleInterview,
  assignTask,
  submitStudentTask,
  getStudentNotifications,
  saveJuryEvaluation
} = require('../controllers/appController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure temp upload folder exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resumes are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/submit', protect, upload.single('resume'), submitApplication);
router.get('/status', protect, getApplicationStatus);

// Admin Routes
router.get('/admin/list', protect, adminOnly, getAdminApplications);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.put('/admin/:id/status', protect, adminOnly, updateApplicationStatus);
router.post('/admin/:id/notes-score', protect, adminOnly, saveAdminNotesAndScore);
router.post('/admin/:id/schedule', protect, adminOnly, scheduleInterview);
router.post('/admin/:id/assign-task', protect, adminOnly, assignTask);
router.post('/admin/:id/jury', protect, adminOnly, saveJuryEvaluation);

// Student Routes
router.post('/student/submit-task', protect, submitStudentTask);
router.get('/student/notifications', protect, getStudentNotifications);

module.exports = router;
