import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      if (!res.user.isAdmin) {
        showToast('Access denied: You are not registered as an administrator.', 'error');
        return;
      }
      showToast('Welcome, Administrator!', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Login failed. Invalid admin credentials.';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center px-6 py-12 bg-brand-brown-dark relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 border border-brand-gold/25 relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <ShieldCheck className="text-brand-gold w-12 h-12 mx-auto mb-2" />
          <h2 className="font-display text-2xl font-extrabold text-white">Admin Portal</h2>
          <p className="text-xs text-white/50 mt-1">Authorized access only. Sign in with admin credentials.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" /> Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@srkrec.edu.in"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('email', {
                required: 'Admin email is required',
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
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-gold" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="text-red-400 text-[10px] mt-0.5">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Admin Sign In'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
