import React, { useState, useEffect } from 'react';
import { login } from '../services/auth-service';
import toast from 'react-hot-toast';

function SigninForm(props) {
  let isOpen = props.isOpen;
  let onClose = props.onClose;
  let initialEmail = props.initialEmail || '';
  let onSignupClick = props.onSignupClick;
  let onLoginSuccess = props.onLoginSuccess;
  let onForgotPasswordClick = props.onForgotPasswordClick;

  let initialFormState = {
    email: initialEmail,
    password: ''
  };

  let [formData, setFormData] = useState(initialFormState);
  let [errors, setErrors] = useState({});
  let [isLoading, setIsLoading] = useState(false);
  let [showPassword, setShowPassword] = useState(false);

  useEffect(function() {
    if (isOpen) {
      setFormData({
          email: initialEmail,
          password: ''
      });
      setErrors({});
    }
  }, [isOpen, initialEmail]);


  if (!isOpen) {
    return null;
  }

  function validate() {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid university email';
      }
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    let keys = Object.keys(newErrors);
    if (keys.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let isValid = validate();
    if (isValid) {
      setIsLoading(true);
      try {
        let response = await login(formData);
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
          if (response.message) {
            toast.error(response.message);
          } else {
            toast.error('Invalid email or password.');
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  }

  function handleSignupToggle(e) {
    e.preventDefault();
    if (onSignupClick) {
      onSignupClick();
    }
  }
    
  function handleChange(e) {
    let id = e.target.id;
    let value = e.target.value;
    
    setFormData(function(prev) {
      let newData = { ...prev };
      newData[id] = value;
      return newData;
    });
    
    if (errors[id]) {
      setErrors(function(prev) {
        let newErrors = { ...prev };
        newErrors[id] = '';
        return newErrors;
      });
    }
  }

  function handleForgotPasswordClick(e) {
    e.preventDefault();
    if (onForgotPasswordClick) {
      onForgotPasswordClick();
    }
  }

  function togglePassword() {
    if (showPassword === true) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }

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
              {errors.email ? <p className="text-xs text-error font-label">{errors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-label text-secondary" htmlFor="password">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPasswordClick}
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
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px] block">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password ? <p className="text-xs text-error font-label">{errors.password}</p> : null}
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