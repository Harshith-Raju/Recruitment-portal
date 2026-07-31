import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Hash, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
  const { register: registerApi } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await registerApi(data.name, data.email, data.password, data.registerNo, data.deptYear);
      showToast(res.message || 'OTP verification sent!', 'success');
      
      // Navigate to OTP verification passing state
      navigate('/verify-otp', { 
        state: { 
          email: data.email,
          debugOtp: res.debugOtp // Pass OTP for easy testing
        } 
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Registration failed. Try again.';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="w-full min-h-[90vh] flex items-center justify-center px-6 py-12 bg-brand-brown-dark relative overflow-hidden">
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 border border-white/5 relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Club Portal</span>
          <h2 className="font-display text-2xl font-extrabold text-white mt-1">Student Signup</h2>
          <p className="text-xs text-white/50 mt-1">Create an account to submit your coding club application.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-gold" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Mercer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className="text-red-400 text-[10px] mt-0.5">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" /> Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <span className="text-red-400 text-[10px] mt-0.5">{errors.email.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Register No */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-brand-gold" /> Register No
              </label>
              <input
                type="text"
                placeholder="23B91A0501"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
                {...register('registerNo', { required: 'Register Number is required' })}
              />
              {errors.registerNo && <span className="text-red-400 text-[10px] mt-0.5">{errors.registerNo.message}</span>}
            </div>

            {/* Department Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-gold" /> Year & Dept
              </label>
              <input
                type="text"
                placeholder="2nd Yr CSE"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
                {...register('deptYear', { required: 'Department is required' })}
              />
              {errors.deptYear && <span className="text-red-400 text-[10px] mt-0.5">{errors.deptYear.message}</span>}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-gold" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {errors.password && <span className="text-red-400 text-[10px] mt-0.5">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-white/40 mt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-gold hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
