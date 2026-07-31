import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Contact = () => {
  const { showToast } = useNotification();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Contact form submitted:', data);
    showToast('Your message has been sent successfully! We will get back to you soon.', 'success');
    reset();
  };

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-20 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold">Get In Touch</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white">Contact Our Club</h1>
          <p className="text-white/60">
            Have questions regarding recruitments, workshops, or partner sponsorships? Drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto w-full items-start">
          
          {/* Contact Information */}
          <div className="flex flex-col gap-8 text-white">
            <h2 className="font-display text-2xl font-bold">Contact Information</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              If you prefer direct emails or want to visit the department labs, find our contact credentials below.
            </p>

            <ul className="flex flex-col gap-6 text-sm">
              <li className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/10 text-brand-gold flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Office Address</h4>
                  <p className="text-white/60">SRKR Engineering College, Bhimavaram, Andhra Pradesh - 534204</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/10 text-brand-gold flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Email Coordinates</h4>
                  <a href="mailto:codingclub@srkrec.edu.in" className="text-white/60 hover:text-brand-gold transition-colors">
                    codingclub@srkrec.edu.in
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/10 text-brand-gold flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Phone Helpline</h4>
                  <p className="text-white/60">+91 98765 43210</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 border border-white/5"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 transition-colors"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' }
                  })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 transition-colors"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  placeholder="Sponsorship Proposal / General query"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 transition-colors"
                  {...register('subject', { required: 'Subject is required' })}
                />
                {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white/80 uppercase tracking-wider">Message Description</label>
                <textarea
                  placeholder="How can we collaborate?"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 transition-colors resize-none"
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message must be at least 10 characters' }
                  })}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

            </form>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
