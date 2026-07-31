import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Award, Users, Calendar, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const stats = [
  { label: 'Active Members', value: '500+' },
  { label: 'Hackathons Won', value: '50+' },
  { label: 'Events Hosted', value: '120+' },
  { label: 'Line of Code Written', value: '2M+' },
];

const sponsors = [
  { name: 'GitHub Education', logo: 'GitHub' },
  { name: 'Google Cloud', logo: 'Google Cloud' },
  { name: 'MongoDB', logo: 'MongoDB' },
  { name: 'Vercel', logo: 'Vercel' },
  { name: 'Postman', logo: 'Postman' },
];

const Home = () => {
  return (
    <div className="w-full relative overflow-hidden bg-brand-brown-dark">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-xs font-semibold text-brand-gold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Empowering the Next Gen of Tech Leaders
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Where Code Meets <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-gold via-[#ffd700] to-white bg-clip-text text-transparent">
              Infinite Possibility
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl text-base sm:text-lg md:text-xl text-white/70 leading-relaxed font-sans"
          >
            Welcome to the SRKR Coding Club Recruitment Portal. Build production-ready projects, excel in national hackathons, and shape your professional software career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
          >
            <Link
              to="/careers"
              className="px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-gold/20 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 group"
            >
              Explore Openings
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 glass hover:bg-white/5 border border-white/10 text-white font-display font-semibold rounded-xl transition-all hover:-translate-y-0.5 text-center"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-8 border border-white/5 text-center hover:border-brand-gold/20 transition-colors"
              >
                <h3 className="font-display text-4xl sm:text-5xl font-extrabold text-brand-gold mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-semibold tracking-wide text-white/50 uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Club Core Offerings / Highlights */}
      <section className="py-24 border-t border-white/5 bg-brand-brown-dark/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Why Join the SRKR Coding Club?
            </h2>
            <p className="text-white/60">
              We aren't just another college club. We are a startup-incubator style technical community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -8 }}
              className="glass-card p-8 border border-white/5 hover:border-brand-gold/30 transition-all flex flex-col gap-4"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-gold/10 text-brand-gold">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Full-Stack Development</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Work on real-world projects like this ATS portal. Learn Git workflows, Node.js REST APIs, database scaling, and premium UI designs.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-card p-8 border border-white/5 hover:border-brand-gold/30 transition-all flex flex-col gap-4"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-gold/10 text-brand-gold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Hackathon Masterclass</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Participate in nationwide coding tournaments. Our club regularly secures top ranks in SIH (Smart India Hackathon) and other events.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8 }}
              className="glass-card p-8 border border-white/5 hover:border-brand-gold/30 transition-all flex flex-col gap-4"
            >
              <div className="p-3 w-fit rounded-lg bg-brand-gold/10 text-brand-gold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Industry Network</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Unlock direct mentoring from top alumni working in Google, Microsoft, Amazon, and high-growth technology startups.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsors Section
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-10 font-bold">
            Supported and Sponsored By Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 hover:opacity-85 transition-opacity duration-300">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="font-display text-xl md:text-2xl font-black text-white hover:text-brand-gold transition-colors duration-200"
              >
                {sponsor.logo}
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
