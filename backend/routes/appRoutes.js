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
  saveJuryEvaluation,
  getResumeFile,
} = require('../controllers/appController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const os = require('os');
const router = express.Router();

// Use OS temporary folder to prevent OneDrive sync locking errors on Windows hosts
const tempDir = os.tmpdir();

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
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === 'application/pdf' || fileExtension === '.pdf') {
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

router.post('/submit', protect, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('[MULTER UPLOAD ERROR]', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, submitApplication);
router.get('/status', protect, getApplicationStatus);
router.get('/resume/:id', getResumeFile);

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
