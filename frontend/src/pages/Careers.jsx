import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Users, Cpu, Layout, Smartphone, Trophy, Paintbrush, FileText, CalendarRange } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Extended professional roles matching the requested domains
const initialRoles = [
  {
    id: 'career-1',
    title: 'Web developers',
    domain: 'Web Development',
    icon: <Layout className="w-5 h-5 text-brand-gold" />,
    openings: 4,
    deadline: 'Aug 28, 2026',
    description: 'Build and maintain web portals, application pages, and user dashboards for coding club events.',
    responsibilities: [
      'Implement responsive layouts using HTML, CSS, and JavaScript.',
      'Connect frontend views to backend APIs.',
      'Maintain code repositories and deploy web apps.'
    ],
    requirements: [
      'Basic knowledge of React or simple Javascript.',
      'Understanding of HTML5, CSS3, and browser DOM.',
      'Experience using Git and GitHub.'
    ]
  },
  {
    id: 'career-2',
    title: 'Technical trainers',
    domain: 'Training',
    icon: <Cpu className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Prepare tutorial sessions, lecture materials, and training bootcamps for junior batches.',
    responsibilities: [
      'Explain core coding concepts to junior members.',
      'Create learning pathways for different development streams.',
      'Help resolve technical doubts during workshops.'
    ],
    requirements: [
      'Good communication and teaching skills.',
      'Solid command over at least one language (C++, Python, Java).',
      'Knowledge of basic algorithms and data structures.'
    ]
  },
  {
    id: 'career-3',
    title: 'Competetive coding',
    domain: 'Competitive Programming',
    icon: <Trophy className="w-5 h-5 text-brand-gold" />,
    openings: 5,
    deadline: 'Aug 28, 2026',
    description: 'Participate in programming contests, solve complex problems, and coach teams for events like ICPC.',
    responsibilities: [
      'Solve algorithmic problems on platforms like Codeforces or CodeChef.',
      'Analyze solution complexities (Time & Space).',
      'Host practice coding rounds and explain editorials.'
    ],
    requirements: [
      'Strong grasp of Data Structures and Algorithms.',
      'Proficiency in C++ STL, Java Collections, or Python.',
      'Analytical problem-solving mindset.'
    ]
  },
  {
    id: 'career-4',
    title: 'Poster designers',
    domain: 'Design Team',
    icon: <Paintbrush className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Design visual posters, brochures, and layouts representing our club branding for events.',
    responsibilities: [
      'Create digital posters and branding assets.',
      'Ensure design consistency across all digital media.',
      'Work alongside event managers for promotional materials.'
    ],
    requirements: [
      'Familiarity with Figma, Canva, or Photoshop.',
      'Good understanding of typography, colors, and layout.',
      'Portfolio of design concepts.'
    ]
  },
  {
    id: 'career-5',
    title: 'Video editors',
    domain: 'Media',
    icon: <Paintbrush className="w-5 h-5 text-brand-gold" />,
    openings: 2,
    deadline: 'Aug 28, 2026',
    description: 'Produce high-quality teaser clips, post-event reels, and informational videos.',
    responsibilities: [
      'Trim, sequence, and polish raw video footage.',
      'Add transitions, typography overlays, and audio tracks.',
      'Optimize videos for social media sharing.'
    ],
    requirements: [
      'Basic knowledge of Premiere Pro, After Effects, or DaVinci.',
      'Creative sense of video pacing and sound design.',
      'Understanding of video formats and resolutions.'
    ]
  },
  {
    id: 'career-6',
    title: 'Documentation',
    domain: 'Content Team',
    icon: <FileText className="w-5 h-5 text-brand-gold" />,
    openings: 2,
    deadline: 'Aug 28, 2026',
    description: 'Write reports, official letters, event summaries, and detailed logs of coding contests.',
    responsibilities: [
      'Draft official event descriptions and feedback reports.',
      'Prepare meeting minutes and project files.',
      'Format user manuals and guides.'
    ],
    requirements: [
      'Excellent writing and grammar skills.',
      'Ability to translate complex tech steps into readable text.',
      'Familiarity with Markdown, Google Docs, or Word.'
    ]
  },
  {
    id: 'career-7',
    title: 'Public relations',
    domain: 'Public Relations',
    icon: <Users className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Build relationships with other student clubs, reach out to departments, and communicate events.',
    responsibilities: [
      'Coordinate external communications and student notices.',
      'Liaise with college staff and students.',
      'Address queries regarding registrations and listings.'
    ],
    requirements: [
      'Strong interpersonal and verbal communication skills.',
      'Confidence in public speaking.',
      'Basic management and networking skills.'
    ]
  },
  {
    id: 'career-8',
    title: 'Sponsorships and collaboration',
    domain: 'Corporate Relations',
    icon: <Users className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Interact with industry sponsors, secure funding, and coordinate cross-club collaborations.',
    responsibilities: [
      'Pitch event benefits to corporate brands.',
      'Arrange resources, sponsor stalls, and coordinate branding.',
      'Maintain liaison with partner organizations.'
    ],
    requirements: [
      'Persuasive negotiation and marketing skills.',
      'Professional correspondence capabilities (emails, proposals).',
      'Detail-oriented and reliable.'
    ]
  },
  {
    id: 'career-9',
    title: 'Event management & promotions',
    domain: 'Event Management',
    icon: <CalendarRange className="w-5 h-5 text-brand-gold" />,
    openings: 4,
    deadline: 'Aug 28, 2026',
    description: 'Organize logistics, arrange classroom venues, manage registrations, and promote hackathons.',
    responsibilities: [
      'Plan operational timelines and manage event volunteers.',
      'Execute promotional campaigns around the college campus.',
      'Oversee stage setup, audio visual tools, and guest welcoming.'
    ],
    requirements: [
      'Organized and action-oriented personality.',
      'Prior volunteering or group project experience.',
      'Ability to work under pressure and coordinate teams.'
    ]
  },
  {
    id: 'career-10',
    title: 'Digital Marketing/ Content writing',
    domain: 'Content Team',
    icon: <FileText className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Write engaging copy, manage social media profiles, and promote club hackathons digitally.',
    responsibilities: [
      'Write social media descriptions and event banners (LinkedIn, Instagram).',
      'Track reach of post campaigns.',
      'Maintain active posting schedules.'
    ],
    requirements: [
      'Creative copywriting skills.',
      'Understanding of social media algorithms.',
      'Familiarity with digital tools (Canva, analytics).'
    ]
  }
];

const domainsList = [
  'All',
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

const Careers = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // Filter logic
  const filteredRoles = initialRoles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.requirements.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === 'All' || role.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const handleApplyClick = (role) => {
    const { icon, ...roleWithoutIcon } = role;
    if (!user) {
      showToast('Please sign in to submit a recruitment form.', 'warning');
      navigate('/login', { state: { from: { pathname: `/apply` }, role: roleWithoutIcon } });
    } else {
      navigate('/apply', { state: { role: roleWithoutIcon } });
    }
  };

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-20 px-6 md:px-12 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold">Careers Portal</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white">Join the Core Club</h1>
          <p className="text-white/60">
            Work with us to engineer high-impact solutions, host national hackathons, and accelerate your coding potential.
          </p>
        </div>

        {/* Google Careers Style Search & Filter Panel */}
        <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by role title, keyword, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-6 py-4 text-sm text-white placeholder-white/35 focus:outline-none focus:border-brand-gold/50 transition-colors"
            />
          </div>

          {/* Domain Category pills */}
          <div className="flex flex-wrap gap-2">
            {domainsList.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg tracking-wider transition-colors duration-200 cursor-pointer ${
                  selectedDomain === domain
                    ? 'bg-brand-gold text-brand-brown-dark'
                    : 'glass text-white/70 hover:text-white'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRoles.map((role) => (
              <motion.div
                layout
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 border border-white/5 hover:border-brand-gold/25 transition-all flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-brand-gold/10">
                        {role.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-white leading-tight">{role.title}</h3>
                        <p className="text-xs text-brand-gold font-semibold mt-0.5">{role.domain}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-white/50 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-gold" /> {role.openings} Openings
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-gold" /> Deadline: {role.deadline}
                    </span>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed mt-2">{role.description}</p>

                  <div className="flex flex-col gap-2 mt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Responsibilities:</h4>
                    <ul className="list-disc pl-5 text-xs text-white/60 flex flex-col gap-1.5">
                      {role.responsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Requirements:</h4>
                    <ul className="list-disc pl-5 text-xs text-white/60 flex flex-col gap-1.5">
                      {role.requirements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyClick(role)}
                  className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Apply Now
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No positions found matching current query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Careers;
