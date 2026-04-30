import React, { useState, useEffect, useRef } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '../services/auth-service';
import toast from 'react-hot-toast';

function ForgotPasswordForm(props) {
  let isOpen = props.isOpen;
  let onClose = props.onClose;

  let [phase, setPhase] = useState('email'); // 'email', 'otp', 'reset'
  let [email, setEmail] = useState('');
  let [otp, setOtp] = useState('');
  let [newPassword, setNewPassword] = useState('');
  let [confirmPassword, setConfirmPassword] = useState('');
  let [isLoading, setIsLoading] = useState(false);
  let [showPassword, setShowPassword] = useState(false);
  let [resetToken, setResetToken] = useState('');
  
  let otpRef0 = useRef();
  let otpRef1 = useRef();
  let otpRef2 = useRef();
  let otpRef3 = useRef();
  let otpRef4 = useRef();
  let otpRef5 = useRef();
  let otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  useEffect(function() {
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

  if (!isOpen) {
    return null;
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      let response = await forgotPassword(email);
      if (response.status === 'success') {
        if (response.message) {
          toast.success(response.message);
        } else {
          toast.success('OTP sent to your email');
        }
        setOtp('');
        setPhase('otp');
      } else {
        if (response.message) {
          toast.error(response.message);
        } else {
          toast.error('Failed to send OTP');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setIsLoading(true);
    try {
      let response = await verifyOtp(email, otp);
      if (response.status === 'success') {
        toast.success('OTP verified successfully');

        setPhase('reset');
        setResetToken(response.data.reset_token);
      } else {
        if (response.message) {
          toast.error(response.message);
        } else {
          toast.error('Invalid OTP');
        }
      }
    } catch (error) {
      toast.error('An error occurred while verifying OTP');
    } finally {
      setIsLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    // If user deleted character
    if (!value) {
      let newOtpArr = otp.split('');
      newOtpArr[index] = '';
      setOtp(newOtpArr.join(''));
      return;
    }

    // Handle single digit input
    let char = value.slice(-1);
    let newOtpArr = otp.split('');
    newOtpArr[index] = char;
    let combinedOtp = newOtpArr.join('');
    setOtp(combinedOtp);

    
    if (char && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs[index - 1].current.focus();
      }
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!resetToken) {
      toast.error('Please verify OTP first');
      return;
    }

    setIsLoading(true);
    try {
      let response = await resetPassword(confirmPassword, newPassword, resetToken);
      if (response.status === 'success') {
        toast.success('Password reset successfully! Please sign in with your new password.');
        onClose();
      } else {
        if (response.message) {
          toast.error(response.message);
        } else {
          toast.error('Failed to reset password');
        }
      }
    } catch (error) {
      toast.error('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handleNewPasswordChange(e) {
    setNewPassword(e.target.value);
  }

  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  function togglePassword() {
    if (showPassword === true) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }

  function handleChangeEmailClick() {
    setPhase('email');
    setOtp('');
  }

  let titleText = '';
  if (phase === 'email') {
    titleText = 'Forgot Password';
  } else if (phase === 'otp') {
    titleText = 'Verify OTP';
  } else if (phase === 'reset') {
    titleText = 'Reset Password';
  }

  let otpIndices = [0, 1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-md rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline italic font-bold text-on-surface">
              {titleText}
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {phase === 'email' ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="email">Email address</label>
                <input
                  type="email" id="email"
                  value={email}
                  onChange={handleEmailChange}
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
          ) : null}

          {phase === 'otp' ? (
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
                  {otpIndices.map(function(index) {
                    return (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        maxLength={1}
                        value={otp[index] ? otp[index] : ''}
                        onChange={function(e) { handleOtpChange(index, e.target.value); }}
                        onKeyDown={function(e) { handleKeyDown(index, e); }}
                        className="w-12 h-14 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center text-xl font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    );
                  })}
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
                      onClick={handleChangeEmailClick}
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
          ) : null}

          {phase === 'reset' ? (
            <form className="space-y-6" onSubmit={handleResetSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="newPassword">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} id="newPassword"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 pr-11 outline-none focus:border-primary transition-colors text-on-surface"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
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
                  onChange={handleConfirmPasswordChange}
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
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;