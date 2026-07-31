import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Code2, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  // Dynamic links based on auth
  const activeLinks = [...links];
  if (user) {
    activeLinks.push({ name: 'Profile', path: '/profile' });
    if (user.isAdmin) {
      activeLinks.push({ name: 'Admin Panel', path: '/admin/dashboard' });
    }
  } else {
    activeLinks.push({ name: 'Login', path: '/login' });
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-40 glass border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-gold/30 bg-white p-0.5 flex-shrink-0 transition-transform group-hover:scale-105">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg text-white leading-tight tracking-wide">
            SRKR <span className="text-brand-gold font-extrabold">CODING CLUB</span>
          </span>
          <span className="text-[10px] text-white/50 tracking-[0.15em] uppercase font-mono">
            Recruitment Portal
          </span>
        </div>
      </NavLink>

      {/* Desktop Links */}
      <div className="hidden xl:flex items-center gap-8">
        {activeLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `relative font-sans text-sm font-medium tracking-wide transition-colors py-1 ${
                isActive ? 'text-brand-gold' : 'text-white/75 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Apply Button / User Indicator */}
      <div className="hidden xl:block">
        {user ? (
          <NavLink
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border border-brand-gold/30 bg-brand-gold/10 text-white hover:bg-brand-gold hover:text-brand-brown-dark transition-all duration-300"
          >
            <User className="w-3.5 h-3.5" /> {user.name.split(' ')[0]}
          </NavLink>
        ) : (
          <NavLink
            to="/careers"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-brand-gold/30 bg-brand-gold/10 hover:bg-brand-gold text-white hover:text-brand-brown-dark transition-all duration-300 shadow-sm hover:shadow-brand-gold/30"
          >
            Join Club <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden text-white hover:text-brand-gold p-2 transition-colors focus:outline-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 glass border-b border-white/5 flex flex-col p-6 gap-4 xl:hidden"
          >
            {activeLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `font-sans text-base font-semibold tracking-wide py-2 ${
                    isActive ? 'text-brand-gold border-l-2 border-brand-gold pl-3' : 'text-white/80 pl-3'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {!user && (
              <NavLink
                to="/careers"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-center py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </NavLink>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
