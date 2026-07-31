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
    title: 'AI / Machine Learning Engineer',
    domain: 'AI',
    icon: <Cpu className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 28, 2026',
    description: 'Work on incorporating LLMs, regression models, and neural nets into club assessment tools and local college research portals.',
    responsibilities: [
      'Preprocess datasets from campus programming scores.',
      'Deploy inference servers using FastAPI and Docker.',
      'Fine-tune classification algorithms for auto-grading code submissions.'
    ],
    requirements: [
      'Basic knowledge of PyTorch or TensorFlow.',
      'Familiarity with Python, pandas, and numpy.',
      'Understanding of basic training cycles and loss functions.'
    ]
  },
  {
    id: 'career-2',
    title: 'MERN Stack Web Developer',
    domain: 'Web Development',
    icon: <Layout className="w-5 h-5 text-brand-gold" />,
    openings: 5,
    deadline: 'Aug 25, 2026',
    description: 'Collaborate with the web operations team to develop the recruitment systems, hackathon dashboards, and contest scoreboards.',
    responsibilities: [
      'Write server-side APIs in Node.js & Express.',
      'Design clean UI layouts in React with Tailwind CSS.',
      'Implement authentication routes and secure sessions using JWT and cookies.'
    ],
    requirements: [
      'Prior hands-on experience with modern Javascript / ES6+.',
      'Understanding of React hooks and context variables.',
      'Basic database designing skills (MongoDB / SQL).'
    ]
  },
  {
    id: 'career-3',
    title: 'Flutter App Developer',
    domain: 'App Development',
    icon: <Smartphone className="w-5 h-5 text-brand-gold" />,
    openings: 2,
    deadline: 'Aug 30, 2026',
    description: 'Create the official mobile application for the coding club, ensuring push alerts for hackathons reach every student immediately.',
    responsibilities: [
      'Maintain clean state management structures using Provider or Bloc.',
      'Establish cross-platform compatibility across Android & iOS.',
      'Integrate local SQLite storage and REST clients.'
    ],
    requirements: [
      'Knowledge of Dart scripting.',
      'Understanding of Material design guidelines.',
      'Prior flutter project uploaded on GitHub.'
    ]
  },
  {
    id: 'career-4',
    title: 'Competitive Programming Coach',
    domain: 'Competitive Programming',
    icon: <Trophy className="w-5 h-5 text-brand-gold" />,
    openings: 4,
    deadline: 'Aug 22, 2026',
    description: 'Formulate algorithmic code reviews, lead training batches for ICPC / CodeChef tournaments, and maintain our daily leaderboard.',
    responsibilities: [
      'Curate problem sheets for junior batches.',
      'Create editorials explaining complex tree and graph approaches.',
      'Conduct mock contests on platforms like Codeforces.'
    ],
    requirements: [
      'Active Codeforces rating (1400+) or CodeChef 4-star+ preferred.',
      'Deep command of C++ STL or Java collections.',
      'Thorough knowledge of greedy methods, segment trees, and DP.'
    ]
  },
  {
    id: 'career-5',
    title: 'UI/UX Brand Designer',
    domain: 'Design Team',
    icon: <Paintbrush className="w-5 h-5 text-brand-gold" />,
    openings: 2,
    deadline: 'Aug 26, 2026',
    description: 'Design premium graphic assets, posters, social media banners, and landing layouts that represent the premium brand of SRKR Coding Club.',
    responsibilities: [
      'Draft UI mockups and design systems in Figma.',
      'Create digital illustrations for club event launches.',
      'Ensure high fidelity export matching the gold/brown aesthetics.'
    ],
    requirements: [
      'Proficient portfolio demonstrating typography and space rules.',
      'Expertise in Figma prototyping.'
    ]
  },
  {
    id: 'career-6',
    title: 'Technical Writer & Copywriter',
    domain: 'Content Team',
    icon: <FileText className="w-5 h-5 text-brand-gold" />,
    openings: 3,
    deadline: 'Aug 24, 2026',
    description: 'Produce clear event documentation, monthly tech newsletters, blog postings, and promotional scripts.',
    responsibilities: [
      'Draft LinkedIn announcements for hackathon winners.',
      'Author technical tutorials and guides for junior members.',
      'Edit scripts for promotional videos.'
    ],
    requirements: [
      'Excellent written English grammar.',
      'Capable of summarizing complex technological steps simply.'
    ]
  },
  {
    id: 'career-7',
    title: 'Lead Organizer & Coordinator',
    domain: 'Event Management',
    icon: <CalendarRange className="w-5 h-5 text-brand-gold" />,
    openings: 5,
    deadline: 'Aug 29, 2026',
    description: 'Handle operations for hackathons and inter-college events, ensuring smooth execution from registry check-ins to panel grading.',
    responsibilities: [
      'Coordinate hospitality and logistics for visiting delegates.',
      'Liaise with college administration for campus hall allotments.',
      'Orchestrate the offline volunteers task-force.'
    ],
    requirements: [
      'Strong leadership and communication qualities.',
      'Prior experience volunteering or organizing college fests.'
    ]
  }
];

const domainsList = [
  'All',
  'AI',
  'Web Development',
  'App Development',
  'Competitive Programming',
  'Design Team',
  'Content Team',
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
