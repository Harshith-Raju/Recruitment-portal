const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personalDetails: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
    answers: {
      whyJoin: { type: String, required: true },
      experience: { type: String, required: true },
      timeManagement: { type: String, required: true },
      otherClubExperience: { type: String, default: '' },
      leaveIfOtherOffer: { type: String, default: '' },
    },
    projects: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    ],
    hackathons: [
      {
        name: { type: String, default: '' },
        role: { type: String, default: '' },
        achievement: { type: String, default: '' },
      },
    ],
    preferredDomain: {
      type: String,
      required: true,
    },
    alternativeDomain1: {
      type: String,
      default: '',
    },
    alternativeDomain2: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeFile: {
      data: Buffer,
      contentType: String,
      filename: String,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Under Review', 'Interview Scheduled', 'Task Assigned', 'Task Submitted', 'Interview Completed', 'Selected', 'Rejected'],
    },
    resumeScore: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    interviewDetails: {
      date: { type: Date, default: null },
      time: { type: String, default: '' },
      pocName: { type: String, default: '' },
      pocNumber: { type: String, default: '' },
      panelMembers: { type: String, default: '' },
    },
    taskDetails: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      deadline: { type: Date, default: null },
      submission: {
        githubLink: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
        zipUrl: { type: String, default: '' },
      },
    },
    juryScore: {
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      cultureFit: { type: Number, default: 0 },
      overallRating: { type: Number, default: 0 },
      comments: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
