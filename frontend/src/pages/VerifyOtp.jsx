import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const VerifyOtp = () => {
  const { verifyOtp } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.debugOtp) {
      setDebugOtp(location.state.debugOtp);
      showToast(`Sandbox Mode: Verification OTP is ${location.state.debugOtp}`, 'info', 6000);
    }
  }, [location.state, showToast]);

  const onSubmit = async (data) => {
    const targetEmail = email || data.email;
    try {
      await verifyOtp(targetEmail, data.otp);
      showToast('Account verified successfully!', 'success');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Verification failed. Invalid OTP.';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-brand-brown-dark relative overflow-hidden">
      <div className="absolute top-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-gold/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 border border-white/5 relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <ShieldCheck className="text-brand-gold w-12 h-12 mx-auto mb-2" />
          <h2 className="font-display text-2xl font-extrabold text-white">Email Verification</h2>
          <p className="text-xs text-white/50 mt-1">
            We have sent a 6-digit verification code to <span className="text-white font-semibold">{email || 'your email'}</span>.
          </p>
        </div>



        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email input (only if missing in navigation state) */}
          {!email && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-gold" /> Confirm Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                {...register('email', { required: !email ? 'Email confirmation is required' : false })}
              />
              {errors.email && <span className="text-red-400 text-[10px] mt-0.5">{errors.email.message}</span>}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wide">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-[0.4em] font-mono text-white focus:outline-none focus:border-brand-gold/50"
              {...register('otp', {
                required: 'OTP is required',
                minLength: { value: 6, message: 'Must be 6 digits' },
              })}
            />
            {errors.otp && <span className="text-red-400 text-[10px] mt-0.5">{errors.otp.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-display font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
