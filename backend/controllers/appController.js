const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const { sendRecruitmentEmail } = require('../utils/mailer');
const { isDbConnected } = require('../config/db');

// In-memory data store fallback
let inMemoryApps = [];

// Generate unique 5-character string
const generateShortId = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

// @desc    Submit application form
// @route   POST /api/applications/submit
const submitApplication = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isDbConnected()) {
      const existingApp = await Application.findOne({ userId });
      if (existingApp) {
        if (existingApp.status === 'Rejected') {
          await Application.deleteOne({ _id: existingApp._id });
        } else {
          return res.status(400).json({ message: 'You have already submitted an active application.' });
        }
      }
    } else {
      const existingAppIndex = inMemoryApps.findIndex((a) => a.userId === userId);
      if (existingAppIndex !== -1) {
        if (inMemoryApps[existingAppIndex].status === 'Rejected') {
          inMemoryApps.splice(existingAppIndex, 1);
        } else {
          return res.status(400).json({ message: 'You have already submitted an active application (in-memory).' });
        }
      }
    }

    let resumeUrl = '';
    let resumeFileData = null;

    // Resume Document File Upload (Stored directly as binary in MongoDB)
    if (req.file) {
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        resumeFileData = {
          data: dataBuffer,
          contentType: req.file.mimetype || 'application/pdf',
          filename: req.file.originalname,
        };
        // Safely unlink the system temp file immediately
        try { fs.unlinkSync(req.file.path); } catch (err) {}
      } catch (uploadErr) {
        console.error('[DATABASE RESUME BUFFER READ ERROR]', uploadErr);
        try { fs.unlinkSync(req.file.path); } catch (err) {}
        return res.status(500).json({
          message: `Failed to process uploaded resume file: ${uploadErr.message}`
        });
      }
    } else if (req.body.resumeUrl) {
      resumeUrl = req.body.resumeUrl; // Allow passing URL directly if not uploading raw files
    }

    if (!resumeUrl && !resumeFileData) {
      return res.status(400).json({ message: 'Resume document is required.' });
    }

    // Parse body objects (in case they are sent as JSON strings via FormData)
    const personalDetails = typeof req.body.personalDetails === 'string'
      ? JSON.parse(req.body.personalDetails)
      : req.body.personalDetails || {};

    const skills = typeof req.body.skills === 'string'
      ? JSON.parse(req.body.skills)
      : req.body.skills || [];

    const answers = typeof req.body.answers === 'string'
      ? JSON.parse(req.body.answers)
      : req.body.answers || {};

    const projects = typeof req.body.projects === 'string'
      ? JSON.parse(req.body.projects)
      : req.body.projects || [];

    const hackathons = typeof req.body.hackathons === 'string'
      ? JSON.parse(req.body.hackathons)
      : req.body.hackathons || [];

    const preferredDomain = req.body.preferredDomain;
    const alternativeDomain1 = req.body.alternativeDomain1 || '';
    const alternativeDomain2 = req.body.alternativeDomain2 || '';
    const applicationId = `SRKR-CC-2026-${generateShortId()}`;

    // If uploading via form, route resumeUrl to our Mongo stream endpoint
    if (resumeFileData) {
      resumeUrl = `/api/applications/resume/${applicationId}`;
    }

    let application;
    if (isDbConnected()) {
      application = await Application.create({
        applicationId,
        userId,
        personalDetails,
        skills,
        answers,
        projects,
        hackathons,
        preferredDomain,
        alternativeDomain1,
        alternativeDomain2,
        resumeUrl,
        resumeFile: resumeFileData,
        resumeScore: 0,
      });
    } else {
      application = {
        _id: new mongoose.Types.ObjectId().toString(),
        applicationId,
        userId,
        personalDetails,
        skills,
        answers,
        projects,
        hackathons,
        preferredDomain,
        alternativeDomain1,
        alternativeDomain2,
        resumeUrl,
        resumeFile: resumeFileData,
        resumeScore: 0,
        status: 'Pending',
        createdAt: new Date(),
      };
      inMemoryApps.push(application);
    }

    // Send email confirmation
    let candidateEmail = '';
    if (isDbConnected()) {
      const applicantUser = await mongoose.model('User').findById(userId);
      if (applicantUser) candidateEmail = applicantUser.email;
    } else {
      const { inMemoryUsers } = require('./authController');
      const applicantUser = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (applicantUser) candidateEmail = applicantUser.email;
    }

    if (candidateEmail) {
      sendRecruitmentEmail(
        candidateEmail,
        'Application Submitted',
        'Application Received Successfully',
        `<p>Hello,</p>
         <p>Your application for the <b>SRKR Coding Club</b> has been successfully stored in our database.</p>
         <p><b>Application ID:</b> ${applicationId}</p>
         <p><b>Preferred Domain:</b> ${preferredDomain}</p>
         <p>You can check the live tracking timeline status anytime by logging into your profile dashboard.</p>`
      ).catch(err => console.error('[BACKGROUND EMAIL ERROR]', err));
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: application.applicationId,
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user application status
// @route   GET /api/applications/status
const getApplicationStatus = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    let application;
    if (isDbConnected()) {
      application = await Application.findOne({ userId });
    } else {
      application = inMemoryApps.find((a) => a.userId === userId);
    }

    if (!application) {
      return res.status(200).json({ application: null });
    }
    res.status(200).json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminApplications = async (req, res) => {
  try {
    const { searchQuery = '', domain = 'All', status = 'All', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let results = [];
    let totalCount = 0;

    if (isDbConnected()) {
      let query = {};
      if (domain !== 'All') {
        query.preferredDomain = domain;
      }
      if (status !== 'All') {
        query.status = status;
      }

      let matchingUserIds = [];
      if (searchQuery) {
        const users = await mongoose.model('User').find({
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { registerNo: { $regex: searchQuery, $options: 'i' } }
          ]
        });
        matchingUserIds = users.map(u => u._id);
        
        query.$or = [
          { userId: { $in: matchingUserIds } },
          { applicationId: { $regex: searchQuery, $options: 'i' } },
          { preferredDomain: { $regex: searchQuery, $options: 'i' } }
        ];
      }

      totalCount = await Application.countDocuments(query);
      
      const order = sortOrder === 'desc' ? -1 : 1;
      results = await Application.find(query)
        .populate('userId', 'name email registerNo deptYear')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limitNum);
    } else {
      const { inMemoryUsers } = require('./authController');
      
      let filtered = inMemoryApps.map(app => {
        const matchingUser = inMemoryUsers.find(u => u._id === app.userId || u.id === app.userId);
        return {
          ...app,
          userId: matchingUser ? {
            _id: matchingUser._id,
            name: matchingUser.name,
            email: matchingUser.email,
            registerNo: matchingUser.registerNo,
            deptYear: matchingUser.deptYear
          } : null
        };
      });

      if (domain !== 'All') {
        filtered = filtered.filter(a => a.preferredDomain === domain);
      }
      if (status !== 'All') {
        filtered = filtered.filter(a => a.status === status);
      }

      if (searchQuery) {
        filtered = filtered.filter(a => {
          const u = a.userId;
          const userMatch = u && (
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.registerNo.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const appMatch = (
            a.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.preferredDomain.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return userMatch || appMatch;
        });
      }

      totalCount = filtered.length;

      filtered.sort((a, b) => {
        let valA, valB;
        if (sortBy.includes('.')) {
          const parts = sortBy.split('.');
          valA = a;
          valB = b;
          for (const part of parts) {
            valA = valA ? valA[part] : undefined;
            valB = valB ? valB[part] : undefined;
          }
        } else {
          valA = a[sortBy];
          valB = b[sortBy];
        }
        valA = valA !== undefined ? valA : '';
        valB = valB !== undefined ? valB : '';
        if (sortBy === 'createdAt') {
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
        }
        if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
        if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });

      results = filtered.slice(skip, skip + limitNum);
    }

    res.status(200).json({
      applications: results,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    let appsList = [];
    if (isDbConnected()) {
      appsList = await Application.find().populate('userId', 'deptYear');
    } else {
      const { inMemoryUsers } = require('./authController');
      appsList = inMemoryApps.map(a => {
        const u = inMemoryUsers.find(user => user._id === a.userId || user.id === a.userId);
        return {
          ...a,
          userId: u ? { deptYear: u.deptYear } : null
        };
      });
    }

    const total = appsList.length;
    const pending = appsList.filter(a => a.status === 'Pending').length;
    const underReview = appsList.filter(a => a.status === 'Under Review').length;
    const interview = appsList.filter(a => a.status === 'Interview Scheduled').length;
    const taskAssigned = appsList.filter(a => a.status === 'Task Assigned').length;
    const taskSubmitted = appsList.filter(a => a.status === 'Task Submitted').length;
    const interviewCompleted = appsList.filter(a => a.status === 'Interview Completed').length;
    const selected = appsList.filter(a => a.status === 'Selected').length;
    const rejected = appsList.filter(a => a.status === 'Rejected').length;

    const domainCounts = {};
    appsList.forEach(a => {
      const dom = a.preferredDomain || 'Unknown';
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
    });

    const branchCounts = {};
    appsList.forEach(a => {
      const u = a.userId;
      if (u && u.deptYear) {
        const match = u.deptYear.match(/(CSE|IT|ECE|CSD|CSM|CIVIL|MECH)/i);
        const branch = match ? match[0].toUpperCase() : 'OTHER';
        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
      } else {
        branchCounts['UNKNOWN'] = (branchCounts['UNKNOWN'] || 0) + 1;
      }
    });

    const yearCounts = { '1st': 0, '2nd': 0, '3rd': 0, '4th': 0, 'Other': 0 };
    appsList.forEach(a => {
      const u = a.userId;
      if (u && u.deptYear) {
        const text = u.deptYear.toLowerCase();
        if (text.includes('1') || text.includes('first')) yearCounts['1st']++;
        else if (text.includes('2') || text.includes('second') || text.includes('2nd')) yearCounts['2nd']++;
        else if (text.includes('3') || text.includes('third') || text.includes('3nd') || text.includes('3rd')) yearCounts['3rd']++;
        else if (text.includes('4') || text.includes('fourth') || text.includes('4th')) yearCounts['4th']++;
        else yearCounts['Other']++;
      } else {
        yearCounts['Other']++;
      }
    });

    const statusCounts = {
      'Pending': pending,
      'Under Review': underReview,
      'Task Assigned': taskAssigned,
      'Task Submitted': taskSubmitted,
      'Interview Scheduled': interview,
      'Interview Completed': interviewCompleted,
      'Selected': selected,
      'Rejected': rejected
    };

    res.status(200).json({
      stats: {
        total,
        pending,
        underReview,
        interview,
        taskAssigned,
        taskSubmitted,
        interviewCompleted,
        selected,
        rejected
      },
      charts: {
        domain: domainCounts,
        branch: branchCounts,
        year: yearCounts,
        status: statusCounts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['Pending', 'Under Review', 'Interview Scheduled', 'Task Assigned', 'Task Submitted', 'Interview Completed', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let application;
    if (isDbConnected()) {
      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = status;
      await application.save();
    } else {
      application = inMemoryApps.find(a => a._id === id || a.id === id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = status;
    }

    let candidateEmail = '';
    let candidateUserId = application.userId;
    if (isDbConnected()) {
      const studentUser = await mongoose.model('User').findById(candidateUserId);
      if (studentUser) candidateEmail = studentUser.email;
    } else {
      const { inMemoryUsers } = require('./authController');
      const studentUser = inMemoryUsers.find(u => u._id === candidateUserId || u.id === candidateUserId);
      if (studentUser) candidateEmail = studentUser.email;
    }

    if (candidateEmail) {
      if (status === 'Rejected') {
        sendRecruitmentEmail(
          candidateEmail,
          'Recruitment Update',
          'Update on your Club Application',
          `<p>Hello,</p>
           <p>Thank you for your interest in the SRKR Coding Club. After careful evaluation of your profile and assessment, we regret to inform you that your application has not been selected for the next round at this time.</p>
           <p>We appreciate your effort and encourage you to apply for other roles in the future.</p>`
        ).catch(err => console.error('[BACKGROUND EMAIL ERROR]', err));
      } else if (status === 'Selected') {
        sendRecruitmentEmail(
          candidateEmail,
          'Recruitment Selection Update',
          'Congratulations! Selected for SRKR Coding Club',
          `<p>Hello,</p>
           <p>We are thrilled to inform you that you have been selected to join the SRKR Coding Club core team!</p>
           <p>Welcome aboard! We will reach out to you shortly with further details.</p>`
        ).catch(err => console.error('[BACKGROUND EMAIL ERROR]', err));
      }
    }

    res.status(200).json({
      message: 'Status updated successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveAdminNotesAndScore = async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  try {
    let application;
    if (isDbConnected()) {
      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.adminNotes = adminNotes !== undefined ? adminNotes : application.adminNotes;
      await application.save();
    } else {
      application = inMemoryApps.find(a => a._id === id || a.id === id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.adminNotes = adminNotes !== undefined ? adminNotes : application.adminNotes;
    }

    res.status(200).json({
      message: 'Evaluation updated successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scheduleInterview = async (req, res) => {
  const { id } = req.params;
  const { date, time, pocName, pocNumber, panelMembers } = req.body;

  try {
    let application;
    let userId;

    if (isDbConnected()) {
      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = 'Interview Scheduled';
      application.interviewDetails = { date, time, pocName, pocNumber, panelMembers };
      await application.save();
      userId = application.userId;
    } else {
      application = inMemoryApps.find(a => a._id === id || a.id === id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = 'Interview Scheduled';
      application.interviewDetails = { date, time, pocName, pocNumber, panelMembers };
      userId = application.userId;
    }

    const notification = {
      title: 'Interview Scheduled',
      message: `Your coding interview is set for ${new Date(date).toLocaleDateString()} at ${time}. Panel: ${panelMembers}. Contact Person: ${pocName} (${pocNumber})`,
      type: 'warning',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      await mongoose.model('User').findByIdAndUpdate(userId, {
        $push: { notifications: notification }
      });
    } else {
      const { inMemoryUsers } = require('./authController');
      const student = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (student) {
        if (!student.notifications) student.notifications = [];
        student.notifications.unshift(notification);
      }
    }

    // Get candidate email
    let candidateEmail = '';
    if (isDbConnected()) {
      const studentUser = await mongoose.model('User').findById(userId);
      if (studentUser) candidateEmail = studentUser.email;
    } else {
      const { inMemoryUsers } = require('./authController');
      const studentUser = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (studentUser) candidateEmail = studentUser.email;
    }

    if (candidateEmail) {
      sendRecruitmentEmail(
        candidateEmail,
        'Interview Scheduled',
        'Technical Panel Interview Slotted',
        `<p>Hello,</p>
         <p>Your technical interview round has been scheduled by the recruitment team.</p>
         <p><b>Date:</b> ${new Date(date).toLocaleDateString()}</p>
         <p><b>Time:</b> ${time}</p>
         <p>If you have any queries or messages, please get in touch with our Point of Contact (POC):</p>
         <p><b>Contact Person:</b> ${pocName}</p>
         <p><b>Mobile Number:</b> ${pocNumber}</p>`
      ).catch(err => console.error('[BACKGROUND EMAIL ERROR]', err));
    }

    res.status(200).json({
      message: 'Interview scheduled successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline } = req.body;

  try {
    let application;
    let userId;

    if (isDbConnected()) {
      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      if (application.status === 'Task Submitted') {
        return res.status(400).json({ message: 'The candidate has already submitted their task. You cannot assign another task.' });
      }
      application.status = 'Task Assigned';
      application.taskDetails = { title, description, deadline, submission: { githubLink: '', liveUrl: '', zipUrl: '' } };
      await application.save();
      userId = application.userId;
    } else {
      application = inMemoryApps.find(a => a._id === id || a.id === id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      if (application.status === 'Task Submitted') {
        return res.status(400).json({ message: 'The candidate has already submitted their task. You cannot assign another task.' });
      }
      application.status = 'Task Assigned';
      application.taskDetails = { title, description, deadline, submission: { githubLink: '', liveUrl: '', zipUrl: '' } };
      userId = application.userId;
    }

    const notification = {
      title: 'Coding Task Assigned',
      message: `A new evaluation challenge "${title}" has been assigned. Complete it before ${new Date(deadline).toLocaleDateString()}.`,
      type: 'warning',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      await mongoose.model('User').findByIdAndUpdate(userId, {
        $push: { notifications: notification }
      });
    } else {
      const { inMemoryUsers } = require('./authController');
      const student = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (student) {
        if (!student.notifications) student.notifications = [];
        student.notifications.unshift(notification);
      }
    }

    // Get candidate email
    let candidateEmail = '';
    if (isDbConnected()) {
      const studentUser = await mongoose.model('User').findById(userId);
      if (studentUser) candidateEmail = studentUser.email;
    } else {
      const { inMemoryUsers } = require('./authController');
      const studentUser = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (studentUser) candidateEmail = studentUser.email;
    }

    // Task Assigned email notification removed as per request.

    res.status(200).json({
      message: 'Task assigned successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitStudentTask = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { githubLink, liveUrl, zipUrl } = req.body;

  try {
    let application;
    if (isDbConnected()) {
      application = await Application.findOne({ userId });
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = 'Task Submitted';
      application.taskDetails.submission = {
        githubLink: githubLink || application.taskDetails.submission.githubLink,
        liveUrl: liveUrl || application.taskDetails.submission.liveUrl,
        zipUrl: zipUrl || application.taskDetails.submission.zipUrl,
      };
      await application.save();
    } else {
      application = inMemoryApps.find(a => a.userId === userId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.status = 'Task Submitted';
      application.taskDetails.submission = {
        githubLink: githubLink || '',
        liveUrl: liveUrl || '',
        zipUrl: zipUrl || '',
      };
    }

    // Send email notification to candidate
    let candidateEmail = '';
    if (isDbConnected()) {
      const studentUser = await mongoose.model('User').findById(userId);
      if (studentUser) candidateEmail = studentUser.email;
    } else {
      const { inMemoryUsers } = require('./authController');
      const studentUser = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      if (studentUser) candidateEmail = studentUser.email;
    }

    // Task Submitted email notification removed as per request.

    res.status(200).json({
      message: 'Task submitted successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentNotifications = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    let notifications = [];
    if (isDbConnected()) {
      const userObj = await mongoose.model('User').findById(userId).select('notifications');
      notifications = userObj ? userObj.notifications : [];
    } else {
      const { inMemoryUsers } = require('./authController');
      const student = inMemoryUsers.find(u => u._id === userId || u.id === userId);
      notifications = student ? (student.notifications || []) : [];
    }

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveJuryEvaluation = async (req, res) => {
  const { id } = req.params;
  const { communication, technical, problemSolving, leadership, confidence, cultureFit, overallRating, comments } = req.body;

  try {
    let application;
    if (isDbConnected()) {
      application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      application.juryScore = {
        communication: communication !== undefined ? Number(communication) : application.juryScore.communication,
        technical: technical !== undefined ? Number(technical) : application.juryScore.technical,
        problemSolving: problemSolving !== undefined ? Number(problemSolving) : application.juryScore.problemSolving,
        leadership: leadership !== undefined ? Number(leadership) : application.juryScore.leadership,
        confidence: confidence !== undefined ? Number(confidence) : application.juryScore.confidence,
        cultureFit: cultureFit !== undefined ? Number(cultureFit) : application.juryScore.cultureFit,
        overallRating: overallRating !== undefined ? Number(overallRating) : application.juryScore.overallRating,
        comments: comments !== undefined ? comments : application.juryScore.comments,
      };
      await application.save();
    } else {
      application = inMemoryApps.find(a => a._id === id || a.id === id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found (in-memory)' });
      }
      application.juryScore = {
        communication: communication !== undefined ? Number(communication) : 0,
        technical: technical !== undefined ? Number(technical) : 0,
        problemSolving: problemSolving !== undefined ? Number(problemSolving) : 0,
        leadership: leadership !== undefined ? Number(leadership) : 0,
        confidence: confidence !== undefined ? Number(confidence) : 0,
        cultureFit: cultureFit !== undefined ? Number(cultureFit) : 0,
        overallRating: overallRating !== undefined ? Number(overallRating) : 0,
        comments: comments !== undefined ? comments : '',
      };
    }

    res.status(200).json({
      message: 'Jury marks updated successfully!',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeFile = async (req, res) => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      // Find by id or applicationId
      const application = await Application.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : new mongoose.Types.ObjectId() },
          { applicationId: id }
        ]
      });

      if (!application || !application.resumeFile || !application.resumeFile.data) {
        return res.status(404).json({ message: 'Resume document not found in database.' });
      }

      res.set('Content-Type', application.resumeFile.contentType || 'application/pdf');
      res.set('Content-Disposition', 'inline');
      return res.send(application.resumeFile.data);
    } else {
      // InMemory fallback
      const application = inMemoryApps.find(a => a._id === id || a.applicationId === id);
      if (!application || !application.resumeFile || !application.resumeFile.data) {
        return res.status(404).json({ message: 'Resume document not found in memory.' });
      }

      res.set('Content-Type', application.resumeFile.contentType || 'application/pdf');
      res.set('Content-Disposition', 'inline');
      return res.send(application.resumeFile.data);
    }
  } catch (error) {
    console.error('[GET RESUME ERROR]', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
