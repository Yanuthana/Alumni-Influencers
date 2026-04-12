import React, { useState, useEffect } from 'react';
import { login } from '../services/auth-service';
import toast from 'react-hot-toast';

function SigninForm({ isOpen, onClose, initialEmail = '', onSignupClick, onLoginSuccess, onForgotPasswordClick }) {
  const initialFormState = {
    email: initialEmail,
    password: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
          email: initialEmail,
          password: ''
      });
      setErrors({});
    }
  }, [isOpen, initialEmail]);


  if (!isOpen) return null;

  const validate = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid university email';
      }
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await login(formData);
        if (response && response.status === 'success') {
          toast.success('Welcome back! Login successful.');
          // Store token if necessary
          if (response.data && response.data.api_token) {
              localStorage.setItem('api_token', response.data.api_token);
              localStorage.setItem('user', JSON.stringify(response.data));
              
              if (onLoginSuccess) {
                onLoginSuccess(response.data);
              }
          } else {
            onClose();
          }
        } else {
          toast.error(response.message || 'Invalid email or password.');
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignupToggle = (e) => {
    e.preventDefault();
    if (onSignupClick) {
      onSignupClick();
    }
  };
    

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-md rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline italic font-bold text-on-surface">Sign In</h1>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-label text-secondary" htmlFor="email">Email address</label>
              <input 
                type="email" id="email" 
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-surface-container-low border ${errors.email ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface`}
                placeholder="john.doe@westminster.ac.uk"
              />
              {errors.email && <p className="text-xs text-error font-label">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-label text-secondary" htmlFor="password">Password</label>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onForgotPasswordClick) {
                      onForgotPasswordClick();
                    }
                  }}
                  className="text-xs text-primary hover:underline font-label"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} id="password" 
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-low border ${errors.password ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 pr-11 outline-none focus:border-primary transition-colors text-on-surface`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px] block">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error font-label">{errors.password}</p>}
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full murrey-gradient text-on-primary font-headline py-3 rounded-lg text-lg font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-secondary font-label">
                Don't have an account? <a href="#" className="text-primary hover:underline" onClick={handleSignupToggle}>Sign Up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SigninForm;