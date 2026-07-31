import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: <Target className="w-6 h-6 text-brand-gold" />,
    title: 'Mission Driven',
    description: 'We strive to build real-world software solutions and guide every student to discover their hidden programming potential.'
  },
  {
    icon: <Eye className="w-6 h-6 text-brand-gold" />,
    title: 'Forward Vision',
    description: 'Preparing members for high-scale systems, competitive programming, research papers, and top global job careers.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand-gold" />,
    title: 'Engineering Quality',
    description: 'We strictly practice clean code, peer reviews, Git workflows, CI/CD, and professional engineering architecture.'
  },
  {
    icon: <Heart className="w-6 h-6 text-brand-gold" />,
    title: 'Inclusivity',
    description: 'We believe code is for everyone. Irrespective of branch or background, we mentor from zero to full-stack hero.'
  }
];

const coordinators = [
  {
    name: 'Dr. M. Jagapathi Raju',
    role: 'Principal & Chief Patron',
    designation: 'Department of CSE, SRKREC',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256'
  },
  {
    name: 'Dr. G. N. V. G. Sirisha',
    role: 'Faculty Coordinator',
    designation: 'Professor, CSE Department',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256'
  }
];

const About = () => {
  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-20 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-24 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold"
          >
            About SRKR Coding Club
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-extrabold text-white"
          >
            Fostering the Future of Software Engineering
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg leading-relaxed"
          >
            Established with a vision to bridge the gap between classroom theory and industry practice, the SRKR Coding Club has evolved into a premier coding hub.
          </motion.p>
        </div>

        {/* Mission & Vision Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="glass-white-card p-10 flex flex-col gap-6">
            <div className="p-3 w-fit rounded-lg bg-brand-brown/10 text-brand-brown-light">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-brand-brown-light">Our Founding Vision</h2>
            <p className="text-brand-brown-light/80 text-sm leading-relaxed">
              We started as a small group of enthusiastic programmers who wanted to build cool tools and compete in contests. Today, we stand as a 500+ member-strong community driving open-source commits, high-impact startup ideas, and top-tier placements at leading companies.
            </p>
          </div>

          <div className="flex flex-col gap-6 text-white">
            <h3 className="font-display text-2xl font-bold">Bridging Industry Needs</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Modern companies look for students who can deploy code on Day 1. The club conducts intensive training bootcamps on Next.js, Docker, API designs, data structures, and algorithms to ensure members are well ahead of the curve.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-brand-gold font-medium">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Weekly Hands-on Coding Bootcamps
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Mentoring sessions from club alumni
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Direct access to internal hackathons
              </li>
            </ul>
          </div>
        </div>

        {/* Core Values */}
        <div className="flex flex-col gap-12">
          <h2 className="font-display text-3xl font-extrabold text-white text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 border border-white/5 hover:border-brand-gold/20 transition-all flex flex-col gap-4"
              >
                <div className="p-3 w-fit rounded-lg bg-brand-gold/10">
                  {v.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-white">{v.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Faculty Coordinators */}
        <div className="flex flex-col gap-12">
          <h2 className="font-display text-3xl font-extrabold text-white text-center">Faculty Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
            {coordinators.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 border border-white/5 hover:border-brand-gold/25 transition-all"
              >
                <img 
                  src={c.image} 
                  alt={c.name} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-brand-gold/30"
                />
                <div className="flex flex-col text-center sm:text-left gap-1">
                  <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-brand-gold font-medium">{c.role}</p>
                  <p className="text-xs text-white/50">{c.designation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
