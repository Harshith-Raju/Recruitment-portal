import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, FileText, ArrowLeft, ShieldCheck, Save, CalendarPlus, CheckSquare, ExternalLink, Award } from 'lucide-react';
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

const AdminCandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notes states
  const [adminNotes, setAdminNotes] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  // Tab states
  const [leftTab, setLeftTab] = useState('profile');
  const [rightTab, setRightTab] = useState('status');

  // Jury Score parameters
  const [commScore, setCommScore] = useState(5);
  const [techScore, setTechScore] = useState(5);
  const [psScore, setPsScore] = useState(5);
  const [leadScore, setLeadScore] = useState(5);
  const [confScore, setConfScore] = useState(5);
  const [fitScore, setFitScore] = useState(5);
  const [juryComments, setJuryComments] = useState('');
  const [savingJury, setSavingJury] = useState(false);

  // Interview Schedule Form
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocNumber, setPocNumber] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [assigningTask, setAssigningTask] = useState(false);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const res = await axios.get(`${API_URL}/applications/admin/list`);
        const match = res.data.applications.find(a => a._id === id || a.id === id);
        if (match) {
          setApp(match);
          setAdminNotes(match.adminNotes || '');

          // Jury panel parameters
          if (match.juryScore) {
            setCommScore(match.juryScore.communication || 5);
            setTechScore(match.juryScore.technical || 5);
            setPsScore(match.juryScore.problemSolving || 5);
            setLeadScore(match.juryScore.leadership || 5);
            setConfScore(match.juryScore.confidence || 5);
            setFitScore(match.juryScore.cultureFit || 5);
            setJuryComments(match.juryScore.comments || '');
          }

          if (match.interviewDetails) {
            setInterviewDate(match.interviewDetails.date ? match.interviewDetails.date.split('T')[0] : '');
            setInterviewTime(match.interviewDetails.time || '');
            setPocName(match.interviewDetails.pocName || '');
            setPocNumber(match.interviewDetails.pocNumber || '');
          }

          if (match.taskDetails) {
            setTaskTitle(match.taskDetails.title || '');
            setTaskDesc(match.taskDetails.description || '');
            setTaskDeadline(match.taskDetails.deadline ? match.taskDetails.deadline.split('T')[0] : '');
          }
        } else {
          showToast('Candidate records not found.', 'error');
          navigate('/admin/dashboard');
        }
      } catch (err) {
        console.error(err);
        showToast('Error syncing candidate details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, [id, navigate, showToast]);

  const saveEvaluation = async () => {
    setSavingEval(true);
    try {
      await axios.post(`${API_URL}/applications/admin/${id}/notes-score`, {
        adminNotes
      });
      setApp(prev => ({ ...prev, adminNotes }));
      showToast('Evaluation notes updated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save evaluation.', 'error');
    } finally {
      setSavingEval(false);
    }
  };

  const saveJuryMarks = async () => {
    setSavingJury(true);
    const overallRating = Math.round(((commScore + techScore + psScore + leadScore + confScore + fitScore) / 6) * 10) / 10;
    try {
      const res = await axios.post(`${API_URL}/applications/admin/${id}/jury`, {
        communication: parseInt(commScore),
        technical: parseInt(techScore),
        problemSolving: parseInt(psScore),
        leadership: parseInt(leadScore),
        confidence: parseInt(confScore),
        cultureFit: parseInt(fitScore),
        overallRating,
        comments: juryComments
      });
      setApp(prev => ({ ...prev, juryScore: res.data.application.juryScore }));
      showToast('Jury evaluation grades saved!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save jury grades.', 'error');
    } finally {
      setSavingJury(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await axios.put(`${API_URL}/applications/admin/${id}/status`, { status });
      setApp(prev => ({ ...prev, status }));
      showToast(`Recruitment status modified to: ${status}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to modify status.', 'error');
    }
  };

  const scheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime || !pocName || !pocNumber) {
      showToast('Please fill out all schedule fields.', 'warning');
      return;
    }
    setScheduling(true);
    try {
      const res = await axios.post(`${API_URL}/applications/admin/${id}/schedule`, {
        date: interviewDate,
        time: interviewTime,
        pocName,
        pocNumber
      });
      setApp(prev => ({ ...prev, status: 'Interview Scheduled', interviewDetails: res.data.application.interviewDetails }));
      showToast('Interview slotted and student notified!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule interview.', 'error');
    } finally {
      setScheduling(false);
    }
  };

  const assignTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDesc || !taskDeadline) {
      showToast('Please fill out all task details.', 'warning');
      return;
    }
    setAssigningTask(true);
    try {
      const res = await axios.post(`${API_URL}/applications/admin/${id}/assign-task`, {
        title: taskTitle,
        description: taskDesc,
        deadline: taskDeadline
      });
      setApp(prev => ({ ...prev, status: 'Task Assigned', taskDetails: res.data.application.taskDetails }));
      showToast('Programming challenge linked and student alerted!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to assign task.', 'error');
    } finally {
      setAssigningTask(false);
    }
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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-brand-brown-dark flex items-center justify-center text-white/50">
        Fetching candidate profile details...
      </div>
    );
  }

  const currentStepIndex = app ? getActiveStepIndex(app.status) : -1;
  const calculatedOverallRating = Math.round(((commScore + techScore + psScore + leadScore + confScore + fitScore) / 6) * 10) / 10;

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-12 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1 text-xs text-brand-gold hover:underline mr-auto cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Candidate Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-gold">Candidate Assessment Desk</span>
            <h1 className="font-display text-2xl font-extrabold text-white mt-0.5">{app?.userId?.name}</h1>
            <p className="text-xs text-white/50">{app?.userId?.email} | Reg: {app?.userId?.registerNo} | Dept: {app?.userId?.deptYear}</p>
          </div>
          <span className="text-xs font-semibold text-white/50 bg-white/5 border border-white/10 px-4 py-2 rounded-full font-mono">
            APP ID: {app?.applicationId}
          </span>
        </div>

        {/* Dashboard Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Profile Info, Resume PDF, and Jury Assessment */}
          <div className="flex flex-col gap-4">
            {/* Left Tab Selectors */}
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setLeftTab('profile')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  leftTab === 'profile'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Profile & Questionnaire
              </button>
              <button
                onClick={() => setLeftTab('resume')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  leftTab === 'resume'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Resume PDF
              </button>
              <button
                onClick={() => setLeftTab('jury')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  leftTab === 'jury'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Jury & Remarks
              </button>
            </div>

            {/* Left Tab Content */}
            {leftTab === 'profile' && (
              <div className="flex flex-col gap-6">
                {/* Personal Details & Links */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    Candidate Links & Skills
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {app?.personalDetails?.github ? (
                      <a href={app.personalDetails.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white/80 font-bold transition-all truncate">
                        GitHub
                      </a>
                    ) : (
                      <span className="p-3 bg-white/5 border border-white/5 text-white/20 rounded-xl text-center font-bold truncate">No GitHub</span>
                    )}
                    {app?.personalDetails?.linkedin ? (
                      <a href={app.personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white/80 font-bold transition-all truncate">
                        LinkedIn
                      </a>
                    ) : (
                      <span className="p-3 bg-white/5 border border-white/5 text-white/20 rounded-xl text-center font-bold truncate">No LinkedIn</span>
                    )}
                    {app?.personalDetails?.portfolio ? (
                      <a href={app.personalDetails.portfolio} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white/80 font-bold transition-all truncate">
                        Portfolio
                      </a>
                    ) : (
                      <span className="p-3 bg-white/5 border border-white/5 text-white/20 rounded-xl text-center font-bold truncate">No Portfolio</span>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                    <span className="text-[10px] text-white/40 uppercase font-bold font-display">Domain Preferences</span>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-brand-gold/10 border border-brand-gold/20 p-3 rounded-xl flex flex-col gap-1 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold">Preferred</span>
                        <span className="font-bold text-white truncate">{app?.preferredDomain}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-1 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Backup 1</span>
                        <span className="font-bold text-white/80 truncate">{app?.alternativeDomain1 || 'N/A'}</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-1 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Backup 2</span>
                        <span className="font-bold text-white/80 truncate">{app?.alternativeDomain2 || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Skills Specified</span>
                    <div className="flex flex-wrap gap-1.5">
                      {app?.skills?.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded-lg text-[10px] font-medium font-mono">
                          {skill}
                        </span>
                      ))}
                      {(!app?.skills || app.skills.length === 0) && <span className="text-white/20 text-xs italic">No skills listed.</span>}
                    </div>
                  </div>
                </div>

                {/* Questionnaire Response Log */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    Questionnaire Answers
                  </h3>
                  
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold font-display">Why do you want to join SRKR Coding Club?</span>
                      <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">{app?.answers?.whyJoin || 'No response provided.'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold font-display">What prior programming experience do you possess?</span>
                      <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">{app?.answers?.experience || 'No response provided.'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold font-display">How do you balance academics and club activities?</span>
                      <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">{app?.answers?.timeManagement || 'No response provided.'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold font-display">Have you previous experience in any another club?</span>
                      <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">{app?.answers?.otherClubExperience || 'No response provided.'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold font-display">If you have offer to get in other club would you leave this?</span>
                      <p className="text-white/70 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">{app?.answers?.leaveIfOtherOffer || 'No response provided.'}</p>
                    </div>
                  </div>
                </div>

                {/* Projects & Hackathons */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    Projects & Hackathons
                  </h3>

                  {/* Projects */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Personal Projects</span>
                    <div className="grid grid-cols-1 gap-3">
                      {app?.projects?.map((proj, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5">
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{proj.title || 'Untitled Project'}</h4>
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-gold font-bold hover:underline flex items-center gap-0.5">
                                Link <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed">{proj.description || 'No description provided.'}</p>
                        </div>
                      ))}
                      {(!app?.projects || app.projects.length === 0) && <p className="text-xs text-white/30 italic">No projects added.</p>}
                    </div>
                  </div>

                  {/* Hackathons */}
                  <div className="flex flex-col gap-3 mt-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Hackathons & coding Contests</span>
                    <div className="grid grid-cols-1 gap-3">
                      {app?.hackathons?.map((hack, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-white/30 uppercase font-bold">Name</span>
                            <p className="font-semibold text-white truncate">{hack.name || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/30 uppercase font-bold">Role</span>
                            <p className="font-semibold text-white/80 truncate">{hack.role || '-'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/30 uppercase font-bold">Achievement</span>
                            <p className="font-semibold text-brand-gold truncate">{hack.achievement || '-'}</p>
                          </div>
                        </div>
                      ))}
                      {(!app?.hackathons || app.hackathons.length === 0) && <p className="text-xs text-white/30 italic">No contest details added.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'resume' && (
              <div className="flex flex-col gap-4">
                {/* Resume Viewer */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-gold" /> Resume PDF File
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="w-full bg-black/20 rounded-xl overflow-hidden flex items-center justify-between border border-white/5 p-4 text-xs">
                      <span className="text-white/70 font-medium">Candidate resume document</span>
                      <a
                        href={app?.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-brown-dark rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        Open PDF in New Tab <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="w-full h-[580px] bg-black/20 rounded-xl overflow-hidden border border-white/5">
                      {app?.resumeUrl ? (
                        <iframe
                          src={resolveUploadUrl(app.resumeUrl)}
                          className="w-full h-full border-none"
                          title="Resume PDF Viewer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                          No resume document uploaded.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'jury' && (
              <div className="flex flex-col gap-6">
                {/* Jury Evaluation Panel */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-gold" /> Jury Assessment Console
                  </h3>

                  <div className="flex flex-col gap-4 text-xs">
                    {/* 6 parameter sliders */}
                    {[
                      { label: 'Communication Skills', val: commScore, set: setCommScore },
                      { label: 'Technical Competency', val: techScore, set: setTechScore },
                      { label: 'Problem Solving 能力', val: psScore, set: setPsScore },
                      { label: 'Leadership Qualities', val: leadScore, set: setLeadScore },
                      { label: 'Self Confidence', val: confScore, set: setConfScore },
                      { label: 'Culture & Vibe Fit', val: fitScore, set: setFitScore },
                    ].map((param, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-white/80 font-medium">
                          <span>{param.label}</span>
                          <span className="font-mono text-brand-gold font-bold">{param.val}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={param.val}
                          onChange={(e) => param.set(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                        />
                      </div>
                    ))}

                    {/* Overall and comments */}
                    <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                        <span className="font-bold text-white/50">Overall Average Rating</span>
                        <span className="text-lg font-mono font-extrabold text-brand-gold bg-brand-gold/10 px-3 py-1 border border-brand-gold/10 rounded-lg">
                          {Math.round(((commScore + techScore + psScore + leadScore + confScore + fitScore) / 6) * 10) / 10} / 10
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Interviewer Remarks</label>
                        <textarea
                          rows={3}
                          placeholder="Provide structural evaluations..."
                          value={juryComments}
                          onChange={(e) => setJuryComments(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={saveJuryMarks}
                        disabled={savingJury}
                        className="w-fit px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {savingJury ? 'Saving Grades...' : 'Submit Jury Evaluation'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Evaluation Remarks */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Remarks</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      rows={5}
                      placeholder="Record evaluation logs, candidate answers notes..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={saveEvaluation}
                    disabled={savingEval}
                    className="w-fit px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {savingEval ? 'Saving...' : 'Save Remarks'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions, Timeline Stepper, Schedules, and Tasks */}
          <div className="flex flex-col gap-4">
            {/* Right Tab Selectors */}
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setRightTab('status')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightTab === 'status'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Status & steps
              </button>
              <button
                onClick={() => setRightTab('task')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightTab === 'task'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Assign Task
              </button>
              <button
                onClick={() => setRightTab('interview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightTab === 'interview'
                    ? 'bg-brand-gold text-brand-brown-dark shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                Schedule Interview
              </button>
            </div>

            {/* Right Tab Content */}
            {rightTab === 'status' && (
              <div className="flex flex-col gap-6">
                {/* Timeline Stepper */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Application Progression</h3>
                  
                  <div className="flex flex-col gap-3.5">
                    {timelineSteps.map((step, idx) => {
                      const isCompleted = currentStepIndex >= idx;
                      const isCurrent = currentStepIndex === idx;
                      const isRejectedState = app.status === 'Rejected' && idx === 6;
                      
                      let label = step;
                      if (idx === 6 && app.status === 'Rejected') label = 'Rejected';

                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                            isRejectedState ? 'bg-red-500/20 border-red-500 text-red-400 font-bold' :
                            isCompleted ? 'bg-brand-gold text-brand-brown-dark border-brand-gold font-bold' :
                            'border-white/20 text-white/30'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-xs ${
                            isRejectedState ? 'text-red-400 font-bold' :
                            isCurrent ? 'text-brand-gold font-bold' :
                            isCompleted ? 'text-white font-semibold' : 'text-white/30'
                          }`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4 mt-2">
                    <button onClick={() => handleStatusUpdate('Under Review')} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold rounded-lg cursor-pointer">
                      Under Review
                    </button>
                    <button onClick={() => handleStatusUpdate('Interview Completed')} className="px-3 py-1.5 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-brown-dark border border-brand-gold/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors">
                      Interview Completed
                    </button>
                    <button onClick={() => handleStatusUpdate('Selected')} className="px-3 py-1.5 bg-green-950/20 hover:bg-green-900/30 text-green-400 border border-green-900/30 text-[10px] font-bold rounded-lg cursor-pointer">
                      Select Candidate
                    </button>
                    <button onClick={() => handleStatusUpdate('Rejected')} className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 text-[10px] font-bold rounded-lg cursor-pointer">
                      Reject Candidate
                    </button>
                  </div>
                </div>

                {/* Submissions Viewer */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Submissions</h3>
                  {app?.taskDetails?.submission?.githubLink ? (
                    <div className="flex flex-col gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-gold">Challenge Submission Logs</span>
                        <h4 className="font-bold text-white mt-1">Links:</h4>
                      </div>
                      <div className="flex flex-col gap-2 font-mono">
                        <a href={app.taskDetails.submission.githubLink} target="_blank" rel="noreferrer" className="text-white/70 hover:text-brand-gold underline truncate">
                          GitHub Repo: {app.taskDetails.submission.githubLink}
                        </a>
                        {app.taskDetails.submission.liveUrl && (
                          <a href={app.taskDetails.submission.liveUrl} target="_blank" rel="noreferrer" className="text-white/70 hover:text-brand-gold underline truncate">
                            Live Site: {app.taskDetails.submission.liveUrl}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 text-center py-4">No task submission uploaded yet by this candidate.</p>
                  )}
                </div>
              </div>
            )}

            {rightTab === 'task' && (
              <div className="flex flex-col gap-4">
                {/* Task Assigner Form */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-brand-gold" /> Assign Coding Challenge
                  </h3>
                  
                  {app?.status === 'Task Submitted' ? (
                    <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-center">
                      <p className="text-xs font-medium text-brand-gold">The candidate has completed and submitted their assignment. No additional tasks can be issued.</p>
                    </div>
                  ) : (
                    <form onSubmit={assignTask} className="flex flex-col gap-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Task Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Frontend Dashboard Integration"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Task Description</label>
                        <textarea
                          rows={4}
                          placeholder="Provide details about requirements..."
                          value={taskDesc}
                          onChange={(e) => setTaskDesc(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Deadline Date</label>
                        <input
                          type="date"
                          value={taskDeadline}
                          onChange={(e) => setTaskDeadline(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={assigningTask}
                        className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {assigningTask ? 'Assigning...' : 'Assign Coding Task & Update Timeline'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {rightTab === 'interview' && (
              <div className="flex flex-col gap-4">
                {/* Schedule Interview Form */}
                <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarPlus className="w-4 h-4 text-brand-gold" /> Schedule Interview
                  </h3>
                  
                  <form onSubmit={scheduleInterview} className="flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Date</label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 2:00 PM"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">Point of Contact Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Vinay"
                          value={pocName}
                          onChange={(e) => setPocName(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-white/50">POC Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 9876543210"
                          value={pocNumber}
                          onChange={(e) => setPocNumber(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={scheduling}
                      className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {scheduling ? 'Scheduling...' : 'Confirm Schedule & Update Timeline'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCandidateDetails;
