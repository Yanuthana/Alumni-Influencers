import React, { useState, useEffect, useRef } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '../services/auth-service';
import toast from 'react-hot-toast';

function ForgotPasswordForm({ isOpen, onClose }) {
  const [phase, setPhase] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken,setResetToken] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (isOpen) {
      setPhase('email');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setResetToken('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.status === 'success') {
        toast.success(response.message || 'OTP sent to your email');
        setOtp('');
        setPhase('otp');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setIsLoading(true);
    try {
      const response = await verifyOtp(email, otp);
      if (response.status === 'success') {
        toast.success('OTP verified successfully');

        setPhase('reset');
        setResetToken(response.data.reset_token);
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred while verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // If user deleted character
    if (!value) {
      const newOtpArr = otp.split('');
      newOtpArr[index] = '';
      setOtp(newOtpArr.join(''));
      return;
    }

    // Handle single digit input
    const char = value.slice(-1);
    const newOtpArr = otp.split('');
    newOtpArr[index] = char;
    const combinedOtp = newOtpArr.join('');
    setOtp(combinedOtp);

    // Auto focus next
    if (char && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs[index - 1].current.focus();
      }
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (!resetToken) return toast.error('Please verify OTP first');
    
    setIsLoading(true);
    try {
      const response = await resetPassword(confirmPassword,newPassword,resetToken);
      if (response.status === 'success') {
        toast.success('Password reset successfully! Please sign in with your new password.');
        onClose();
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-md rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline italic font-bold text-on-surface">
              {phase === 'email' && 'Forgot Password'}
              {phase === 'otp' && 'Verify OTP'}
              {phase === 'reset' && 'Reset Password'}
            </h1>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {phase === 'email' && (
            <form className="space-y-6" onSubmit={handleEmailSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="email">Email address</label>
                <input 
                  type="email" id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface"
                  placeholder="john.doe@westminster.ac.uk"
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full murrey-gradient text-on-primary font-headline py-3 rounded-lg text-lg font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {phase === 'otp' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
                </div>
                <p className="text-on-surface-variant text-center text-sm leading-relaxed max-w-[280px]">
                  We've sent a 6-digit verification code to your email address.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="flex justify-between gap-2 px-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center text-xl font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-6">
                  <button 
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className={`w-full murrey-gradient text-on-primary font-headline py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] ${isLoading || otp.length < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'VERIFYING...' : 'VERIFY ACCOUNT'}
                  </button>

                  <div className="flex justify-center items-center px-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setPhase('email');
                        setOtp('');
                      }}
                      className="text-xs font-label font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-center border-t border-outline-variant/10">
                  <div className="flex items-center gap-2 text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span className="text-[10px] font-label uppercase tracking-[0.2em]">End-to-end Encrypted</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {phase === 'reset' && (
            <form className="space-y-6" onSubmit={handleResetSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="newPassword">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} id="newPassword" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 pr-11 outline-none focus:border-primary transition-colors text-on-surface"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px] block">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full murrey-gradient text-on-primary font-headline py-3 rounded-lg text-lg font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;