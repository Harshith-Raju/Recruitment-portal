import React from 'react';
import { NavLink } from 'react-router-dom';
import { Code2, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-brown-dark/70 border-t border-white/5 pt-16 pb-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        
        {/* Brand Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-gold/30 bg-white p-0.5 flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              SRKR <span className="text-brand-gold font-extrabold">CODING CLUB</span>
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            Nurturing innovation, engineering excellence, and computer science leadership at SRKR Engineering College. Join us to shape your coding career.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-brand-gold hover:text-brand-brown-dark text-white/80 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-brand-gold hover:text-brand-brown-dark text-white/80 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-brand-gold hover:text-brand-brown-dark text-white/80 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-wider">Navigation</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <NavLink to="/" className="text-white/60 hover:text-brand-gold transition-colors">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about" className="text-white/60 hover:text-brand-gold transition-colors">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="text-white/60 hover:text-brand-gold transition-colors">Contact Support</NavLink>
            </li>
            <li>
              <NavLink to="/admin/login" className="text-white/40 hover:text-brand-gold transition-colors font-mono text-[11px] uppercase tracking-wider">Admin Login</NavLink>
            </li>
          </ul>
        </div>

        {/* Opportunities */}
        <div>
          <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-wider">Opportunities</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <NavLink to="/careers" className="text-white/60 hover:text-brand-gold transition-colors">Apply for Club Roles</NavLink>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-display font-semibold text-white mb-6 text-sm uppercase tracking-wider">Get in Touch</h4>
          <ul className="flex flex-col gap-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>SRKR Engineering College, Bhimavaram, Andhra Pradesh - 534204</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <a href="mailto:codingclub@srkrec.edu.in" className="hover:text-brand-gold transition-colors">codingclub@srkrec.edu.in</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>© {currentYear} SRKR Coding Club. All Rights Reserved.</p>
        <p className="font-mono">Designed & Developed by the Club Web Team</p>
      </div>
    </footer>
  );
};

export default Footer;
