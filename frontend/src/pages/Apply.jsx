import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, User, Award, Terminal, FileText, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, Upload, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_URL } from '../config/api';

const steps = [
  { id: 1, name: 'Personal & Domain', icon: <User className="w-5 h-5" /> },
  { id: 2, name: 'Skills & Achievements', icon: <Award className="w-5 h-5" /> },
  { id: 3, name: 'Projects & Hackathons', icon: <Terminal className="w-5 h-5" /> },
  { id: 4, name: 'Questions & Resume', icon: <FileText className="w-5 h-5" /> },
];

const domainsList = [
  'Web Development',
  'Training',
  'Competitive Programming',
  'Design Team',
  'Media',
  'Content Team',
  'Public Relations',
  'Corporate Relations',
  'Event Management'
];

const Apply = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [successAppId, setSuccessAppId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      preferredDomain: '',
      alternativeDomain1: '',
      alternativeDomain2: '',
      github: '',
      linkedin: '',
      portfolio: '',
      skills: '',
      whyJoin: '',
      experience: '',
      timeManagement: '',
      otherClubExperience: '',
      leaveIfOtherOffer: '',
      projects: [{ title: '', description: '', link: '' }],
      hackathons: [{ name: '', role: '', achievement: '' }],
    },
  });

  // Dynamic Array Handlers for Projects and Hackathons
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects',
  });

  const { fields: hackathonFields, append: appendHackathon, remove: removeHackathon } = useFieldArray({
    control,
    name: 'hackathons',
  });

  // Pre-fill domain if navigating from a specific Career detail card
  useEffect(() => {
    if (location.state?.role) {
      setValue('preferredDomain', location.state.role.domain);
    }
  }, [location.state, setValue]);

  const handleNext = () => {
    // Basic validation checks per step
    if (currentStep === 1) {
      const dom = watch('preferredDomain');
      if (!dom) {
        showToast('Please select a preferred domain.', 'warning');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onInvalid = (errors) => {
    console.log('Form validation errors:', errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      let msg = 'Please check all required fields in the form.';
      if (firstError.message) {
        msg = firstError.message;
      }
      showToast(msg, 'warning');
    }
  };

  const onSubmit = async (data) => {
    if (!resumeFile) {
      showToast('Please select your resume PDF document.', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('preferredDomain', data.preferredDomain);
      formData.append('alternativeDomain1', data.alternativeDomain1);
      formData.append('alternativeDomain2', data.alternativeDomain2);
      
      const personalDetails = {
        github: data.github,
        linkedin: data.linkedin,
        portfolio: data.portfolio,
      };
      formData.append('personalDetails', JSON.stringify(personalDetails));

      // Parse comma-separated skills
      const skillPills = data.skills ? data.skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0) : [];
      formData.append('skills', JSON.stringify(skillPills));

      const answers = {
        whyJoin: data.whyJoin,
        experience: data.experience,
        timeManagement: data.timeManagement,
        otherClubExperience: data.otherClubExperience,
        leaveIfOtherOffer: data.leaveIfOtherOffer,
      };
      formData.append('answers', JSON.stringify(answers));

      formData.append('projects', JSON.stringify(data.projects));
      formData.append('hackathons', JSON.stringify(data.hackathons));

      // Append file
      formData.append('resume', resumeFile);

      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/applications/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      showToast('Application submitted successfully!', 'success');
      setSuccessAppId(res.data.applicationId);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Submission failed. Try again.';
      showToast(errorMsg, 'error');
    }
  };

  if (successAppId) {
    return (
      <div className="w-full min-h-screen bg-brand-brown-dark flex items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-10 border border-brand-gold/30 text-center flex flex-col items-center gap-6"
        >
          <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold text-white">Application Received</h2>
            <p className="text-sm text-white/50 mt-1">
              Your application has been stored in our college registry database.
            </p>
          </div>

          <div className="w-full bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-gold">Unique Application ID</span>
            <p className="font-mono text-xl font-bold text-white mt-1">{successAppId}</p>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
          >
            Go to Profile Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-20 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold">Apply Portal</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">Recruitment Wizard</h1>
          <p className="text-sm text-white/50">Complete all four sections to finalize your candidate profile.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 overflow-x-auto gap-4">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2.5 flex-shrink-0">
              <div className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${
                currentStep >= s.id 
                  ? 'bg-brand-gold text-brand-brown-dark' 
                  : 'bg-white/5 text-white/40'
              }`}>
                {s.icon}
              </div>
              <span className={`text-xs font-semibold hidden md:inline ${
                currentStep >= s.id ? 'text-white' : 'text-white/40'
              }`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {/* Form Wizard */}
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="glass-card p-8 border border-white/5 flex flex-col gap-6">
          
          {/* Step 1: Personal & Domain */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-5"
            >
              <h3 className="font-display text-lg font-bold text-white border-l-4 border-brand-gold pl-3">Domain Selection & Links</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Preferred Domain</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                  {...register('preferredDomain', { required: 'Please choose a domain' })}
                >
                  <option value="" disabled className="bg-brand-brown text-white">-- Select Domain --</option>
                  {domainsList.map((d) => (
                    <option key={d} value={d} className="bg-brand-brown text-white">{d}</option>
                  ))}
                </select>
                {errors.preferredDomain && <span className="text-red-400 text-[10px]">{errors.preferredDomain.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Backup Option 1</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                    {...register('alternativeDomain1', { required: 'Please select alternative option 1' })}
                  >
                    <option value="" disabled className="bg-brand-brown text-white">-- Select Backup Option 1 --</option>
                    {domainsList.filter(d => d !== watch('preferredDomain')).map((d) => (
                      <option key={d} value={d} className="bg-brand-brown text-white">{d}</option>
                    ))}
                  </select>
                  {errors.alternativeDomain1 && <span className="text-red-400 text-[10px]">{errors.alternativeDomain1.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Backup Option 2</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                    {...register('alternativeDomain2', { required: 'Please select alternative option 2' })}
                  >
                    <option value="" disabled className="bg-brand-brown text-white">-- Select Backup Option 2 --</option>
                    {domainsList.filter(d => d !== watch('preferredDomain') && d !== watch('alternativeDomain1')).map((d) => (
                      <option key={d} value={d} className="bg-brand-brown text-white">{d}</option>
                    ))}
                  </select>
                  {errors.alternativeDomain2 && <span className="text-red-400 text-[10px]">{errors.alternativeDomain2.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">GitHub Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                    {...register('github')}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">LinkedIn Link</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                    {...register('linkedin')}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Portfolio Link</label>
                  <input
                    type="url"
                    placeholder="https://portfolio.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                    {...register('portfolio')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & Achievements */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-5"
            >
              <h3 className="font-display text-lg font-bold text-white border-l-4 border-brand-gold pl-3">Skillsets</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Technical Skills</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, Figma (comma separated)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                  {...register('skills', { required: 'Please specify your skills' })}
                />
                {errors.skills && <span className="text-red-400 text-[10px]">{errors.skills.message}</span>}
              </div>

              {/* Dynamic Hackathons List */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hackathons & Coding Contests</h4>
                  <button
                    type="button"
                    onClick={() => appendHackathon({ name: '', role: '', achievement: '' })}
                    className="flex items-center gap-1 text-[10px] text-brand-gold font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Contest
                  </button>
                </div>

                {hackathonFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl relative">
                    <button
                      type="button"
                      onClick={() => removeHackathon(idx)}
                      className="absolute top-3 right-3 text-red-400/40 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Hackathon Name</label>
                      <input
                        type="text"
                        placeholder="Smart India Hackathon"
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        {...register(`hackathons.${idx}.name`)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Your Role</label>
                      <input
                        type="text"
                        placeholder="Frontend Dev"
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        {...register(`hackathons.${idx}.role`)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Achievement</label>
                      <input
                        type="text"
                        placeholder="1st Runner Up"
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        {...register(`hackathons.${idx}.achievement`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Projects & Hackathons */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-bold text-white border-l-4 border-brand-gold pl-3">Personal Projects</h3>
                <button
                  type="button"
                  onClick={() => appendProject({ title: '', description: '', link: '' })}
                  className="flex items-center gap-1 text-[10px] text-brand-gold font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {projectFields.map((field, idx) => (
                <div key={field.id} className="flex flex-col gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="absolute top-3 right-3 text-red-400/40 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Project Title</label>
                      <input
                        type="text"
                        placeholder="Recruitment System Portal"
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        {...register(`projects.${idx}.title`)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-white/50">Project Repo/Live Link</label>
                      <input
                        type="url"
                        placeholder="https://github.com/user/project"
                        className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                        {...register(`projects.${idx}.link`)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-white/50">Brief Description</label>
                    <textarea
                      placeholder="Brief details about the technologies used..."
                      rows={2}
                      className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none resize-none"
                      {...register(`projects.${idx}.description`)}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 4: Questions & Resume */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-5"
            >
              <h3 className="font-display text-lg font-bold text-white border-l-4 border-brand-gold pl-3">Questions & Resume Upload</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Why do you want to join SRKR Coding Club?</label>
                <textarea
                  rows={3}
                  placeholder="Explain your passion for learning and coding..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  {...register('whyJoin', { required: 'Please specify your statement' })}
                />
                {errors.whyJoin && <span className="text-red-400 text-[10px]">{errors.whyJoin.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">What prior programming experience do you possess?</label>
                <textarea
                  rows={3}
                  placeholder="Details about programming experience, courses, or mini contests..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  {...register('experience', { required: 'Please specify details' })}
                />
                {errors.experience && <span className="text-red-400 text-[10px]">{errors.experience.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">How do you balance academics and club activities?</label>
                <textarea
                  rows={3}
                  placeholder="Briefly state your time management strategy..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  {...register('timeManagement', { required: 'Please specify details' })}
                />
                {errors.timeManagement && <span className="text-red-400 text-[10px]">{errors.timeManagement.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Have you previous experience in any another club?</label>
                <textarea
                  rows={3}
                  placeholder="Details about active involvement, coordinator roles, or work done in other campus bodies..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  {...register('otherClubExperience', { required: 'Please specify details or write N/A' })}
                />
                {errors.otherClubExperience && <span className="text-red-400 text-[10px]">{errors.otherClubExperience.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">If you have offer to get in other club would you leave this?</label>
                <textarea
                  rows={3}
                  placeholder="Share your perspective on multi-club memberships and commitment priorities..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                  {...register('leaveIfOtherOffer', { required: 'Please specify your statement' })}
                />
                {errors.leaveIfOtherOffer && <span className="text-red-400 text-[10px]">{errors.leaveIfOtherOffer.message}</span>}
              </div>

              {/* Resume File Input */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Resume Upload (PDF Only)</label>
                <div className="border-2 border-dashed border-white/10 hover:border-brand-gold/50 rounded-xl p-6 text-center cursor-pointer relative transition-colors bg-white/[0.01]">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-brand-gold mx-auto mb-2" />
                  <p className="text-xs text-white/70">
                    {resumeFile ? `Selected: ${resumeFile.name}` : 'Click or drag PDF resume here to upload'}
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">Maximum file size: 5MB</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between border-t border-white/5 pt-6 mt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-5 py-3 glass hover:bg-white/10 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                Submit Form <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

export default Apply;
