import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Redirect target
  const from = location.state?.from?.pathname || '/profile';

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      
      if (err.response?.status === 403 && err.response?.data?.unverified) {
        showToast('Account unverified. Redirecting to OTP page...', 'warning');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        showToast(errorMsg, 'error');
      }
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-brown-dark relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 border border-white/5 relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Club Portal</span>
          <h2 className="font-display text-2xl font-extrabold text-white mt-1">Student Login</h2>
          <p className="text-xs text-white/50 mt-1">Welcome back. Enter credentials to manage applications.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
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

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-gold" /> Password
              </label>
              <Link to="/forgot-password" className="text-[10px] text-brand-gold hover:underline font-semibold">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-red-400 text-[10px] mt-0.5">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Logging In...' : 'Login'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-white/40 mt-2">
          New to the portal?{' '}
          <Link to="/register" className="text-brand-gold hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
