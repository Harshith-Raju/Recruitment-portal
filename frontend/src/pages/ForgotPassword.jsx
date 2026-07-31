import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ForgotPassword = () => {
  const { forgotPassword: forgotPasswordApi } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await forgotPasswordApi(data.email);
      showToast(res.message || 'OTP code sent!', 'success');
      
      // Route to Reset page
      navigate('/reset-password', {
        state: {
          email: data.email,
          debugOtp: res.debugOtp
        }
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Error requesting password reset.';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-brown-dark relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 border border-white/5 relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <KeyRound className="text-brand-gold w-12 h-12 mx-auto mb-2" />
          <h2 className="font-display text-2xl font-extrabold text-white">Forgot Password</h2>
          <p className="text-xs text-white/50 mt-1">
            Provide your email and we'll dispatch an OTP code to restore your portal access.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" /> Registered Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <span className="text-red-400 text-[10px] mt-0.5">{errors.email.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Requesting...' : 'Get Reset OTP'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-white/40 mt-1">
          Back to{' '}
          <Link to="/login" className="text-brand-gold hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
