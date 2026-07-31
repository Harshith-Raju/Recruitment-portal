import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Edit3, LogOut, ShieldCheck, ClipboardList, Bell, FileText, ExternalLink, Calendar, CheckCircle2, Circle, Send, Code, Link2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL, resolveUploadUrl } from '../config/api';

const timelineSteps = [
  'Applied',
  'Under Review',
  'Task Assigned',
  'Task Submitted',
  'Interview Scheduled',
  'Interview Completed',
  'Selected'
];

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      registerNo: user?.registerNo || '',
      deptYear: user?.deptYear || '',
      profilePicture: user?.profilePicture || '',
    },
  });

  // Task Submission Form Hook
  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTaskForm,
    formState: { errors: taskErrors, isSubmitting: taskSubmitting }
  } = useForm();

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications/status`);
      setAppStatus(res.data.application);

      // Fetch live database alerts
      const notifyRes = await axios.get(`${API_URL}/applications/student/notifications`);
      setNotifications(notifyRes.data.notifications || []);
    } catch (err) {
      console.error('Error fetching dashboard status:', err);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const onEditSubmit = async (data) => {
    try {
      await updateProfile(data);
      showToast('Profile credentials updated!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update credentials.', 'error');
    }
  };

  const submitTaskResponse = async (data) => {
    try {
      await axios.post(`${API_URL}/applications/student/submit-task`, {
        githubLink: data.githubLink,
        liveUrl: data.liveUrl
      });
      showToast('Challenge coding task submitted successfully!', 'success');
      resetTaskForm();
      fetchDashboardData(); // Refresh timeline status to 'Task Submitted'
    } catch (err) {
      console.error(err);
      showToast('Failed to submit coding challenge.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out.', 'success');
    navigate('/login');
  };

  const getActiveStepIndex = (status) => {
    if (status === 'Pending' || status === 'Applied') return 0;
    if (status === 'Under Review') return 1;
    if (status === 'Task Assigned') return 2;
    if (status === 'Task Submitted') return 3;
    if (status === 'Interview Scheduled') return 4;
    if (status === 'Interview Completed') return 5;
    if (status === 'Selected') return 6;
    if (status === 'Rejected') return 6;
    return 0;
  };

  const currentStepIndex = appStatus ? getActiveStepIndex(appStatus.status) : -1;

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-20 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-brand-gold bg-white flex items-center justify-center p-0.5">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-8 h-8 text-brand-gold" />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white flex items-center gap-2">
                Hello, {user?.name.split(' ')[0]}
                {user?.isVerified && <ShieldCheck className="w-5 h-5 text-brand-gold" />}
              </h1>
              <p className="text-xs text-white/50">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 font-semibold text-xs rounded-xl border border-red-900/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <form onSubmit={handleSubmit(onEditSubmit)} className="glass-card p-8 border border-brand-gold/20 flex flex-col gap-6">
            <h3 className="font-display text-lg font-bold text-white border-l-4 border-brand-gold pl-3">Update Profile Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Profile Image URL</label>
                <input
                  type="url"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  {...register('profilePicture')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Register Number</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  {...register('registerNo')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Department & Year</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  {...register('deptYear')}
                />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="px-5 py-3 bg-brand-gold text-brand-brown-dark font-bold text-xs rounded-xl cursor-pointer">
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main timeline stepper column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            <div className="glass-card p-8 border border-white/5 flex flex-col gap-6">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                <ClipboardList className="w-5 h-5 text-brand-gold" /> Recruitment Timeline
              </h3>

              {appLoading ? (
                <p className="text-white/40 text-xs animate-pulse">Syncing timeline stages...</p>
              ) : appStatus ? (
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Current Stage</span>
                      <h4 className={`text-lg font-extrabold uppercase mt-0.5 ${
                        appStatus.status === 'Rejected' ? 'text-red-400' : 'text-brand-gold'
                      }`}>
                        {appStatus.status === 'Pending' ? 'Applied' : appStatus.status}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold text-white/50 font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      ID: {appStatus.applicationId}
                    </span>
                  </div>

                  {/* Horizontal Timeline Steps */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative px-2">
                    {timelineSteps.map((step, idx) => {
                      const isCompleted = currentStepIndex >= idx;
                      const isCurrent = currentStepIndex === idx;
                      const isRejectedState = appStatus.status === 'Rejected' && idx === 6;
                      
                      let stepLabel = step;
                      if (idx === 6 && appStatus.status === 'Rejected') stepLabel = 'Rejected';

                      return (
                        <div key={step} className="flex sm:flex-col items-center gap-3 relative z-10 flex-1 w-full sm:w-auto">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${
                            isRejectedState ? 'border-red-500 bg-red-950 text-red-400' :
                            isCompleted ? 'border-brand-gold bg-brand-gold text-brand-brown-dark shadow-[0_0_12px_rgba(212,175,55,0.4)]' :
                            'border-white/10 bg-brand-brown-dark text-white/40'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${
                            isRejectedState ? 'text-red-400 font-extrabold' :
                            isCurrent ? 'text-brand-gold font-extrabold' :
                            isCompleted ? 'text-white' :
                            'text-white/30'
                          }`}>
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-white/50">You haven't submitted a recruitment application form yet.</p>
                  <button onClick={() => navigate('/careers')} className="px-5 py-3 bg-brand-gold text-brand-brown-dark font-bold text-xs rounded-xl mt-4 cursor-pointer">
                    Apply for Openings
                  </button>
                </div>
              )}

              {appStatus && appStatus.status === 'Rejected' && (
                <div className="p-5 mt-4 bg-red-500/10 border border-red-500/25 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                  <div>
                    <h4 className="text-sm font-bold text-white">Application Update</h4>
                    <p className="text-xs text-white/60 mt-1">Your application for {appStatus.preferredDomain} was not selected. You are eligible to apply for another role!</p>
                  </div>
                  <button
                    onClick={() => navigate('/careers')}
                    className="px-4 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold text-xs rounded-lg cursor-pointer flex-shrink-0"
                  >
                    Apply for Another Role
                  </button>
                </div>
              )}
            </div>

            {/* Task Submission Module (Phase 8) */}
            {appStatus && appStatus.status === 'Task Assigned' && appStatus.taskDetails && (
              <div className="glass-card p-8 border border-brand-gold/20 flex flex-col gap-5">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <Code className="w-5 h-5 text-brand-gold" /> Coding Assignment Assigned
                </h3>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white">{appStatus.taskDetails.title}</h4>
                  <p className="text-xs text-white/60 leading-relaxed">{appStatus.taskDetails.description}</p>
                  <span className="text-[10px] font-semibold text-brand-gold font-mono mt-1">
                    Deadline: {new Date(appStatus.taskDetails.deadline).toLocaleDateString()}
                  </span>
                </div>

                <form onSubmit={handleTaskSubmit(submitTaskResponse)} className="flex flex-col gap-4 text-xs border-t border-white/5 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">GitHub Link</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username/project"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                        {...registerTask('githubLink', { required: 'GitHub link is required' })}
                      />
                      {taskErrors.githubLink && <span className="text-red-400 text-[10px]">{taskErrors.githubLink.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Live URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://liveproject.vercel.app"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                        {...registerTask('liveUrl')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={taskSubmitting}
                    className="w-fit px-6 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {taskSubmitting ? 'Submitting Challenge...' : 'Submit Challenge Task'}
                  </button>
                </form>
              </div>
            )}

            {/* Resume & Details Panel */}
            {appStatus && (
              <div className="glass-card p-8 border border-white/5 flex flex-col gap-6">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" /> Uploaded Resume & Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Applied Domain</span>
                    <p className="text-sm font-bold text-white mt-1">{appStatus.preferredDomain}</p>
                  </div>

                  <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Resume File</span>
                      <p className="text-xs text-white/70 mt-1 truncate max-w-[150px]">PDF Document</p>
                    </div>
                    <a
                      href={resolveUploadUrl(appStatus.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-brown-dark border border-brand-gold/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Notifications Panel Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="glass-card p-8 border border-white/5 flex flex-col gap-6 h-full">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                <Bell className="w-5 h-5 text-brand-gold" /> System Alerts
              </h3>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-2">
                {notifications.length > 0 ? (
                  notifications.map((n, idx) => (
                    <div key={idx} className="border border-white/5 p-4 rounded-xl bg-white/[0.01] flex flex-col gap-1 hover:border-brand-gold/20 transition-all">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        <span className="text-[9px] text-white/30">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed mt-1">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 text-center py-4">No recent alerts found.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
