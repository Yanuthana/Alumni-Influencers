import React, { useState, useEffect } from 'react';
import {signup} from '../services/auth-service';
import toast from 'react-hot-toast';

function SignupForm(props) {
  let isOpen = props.isOpen;
  let onClose = props.onClose;

  let initialFormState = {
    fname: '',
    lname: '',
    email: '',
    password: '',
    role: 'student',
    day: '',
    month: '',
    year: '',
    phoneNumber: ''
  };

  let [formData, setFormData] = useState(initialFormState);
  let [errors, setErrors] = useState({});
  let [isLoading, setIsLoading] = useState(false);
  let [showPassword, setShowPassword] = useState(false);

  useEffect(function() {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function validate() {
    let newErrors = {};

    // Email check
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password check (relaxed: min 8 chars and at least 1 number)
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      let passwordRegex = /^(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and include at least one number';
      }
    }

    // Other required fields
    if (!formData.fname.trim()) {
      newErrors.fname = 'First name is required';
    }
    
    if (!formData.lname.trim()) {
      newErrors.lname = 'Last name is required';
    }
    
    if (!formData.day || !formData.month || !formData.year) {
      newErrors.dob = 'Complete date of birth is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      let phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
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
      
      let dayStr = String(formData.day);
      if (dayStr.length === 1) {
        dayStr = '0' + dayStr;
      }
      
      let monthStr = String(formData.month);
      if (monthStr.length === 1) {
        monthStr = '0' + monthStr;
      }
      
      let date_of_birth = formData.year + '-' + monthStr + '-' + dayStr;
      
      let submissionRole = formData.role;
      if(submissionRole === 'admin') {
        submissionRole = 'developer';
      }

      let userInformation = {
        first_name: formData.fname,
        last_name: formData.lname,
        email: formData.email,
        password: formData.password,
        role: submissionRole,
        date_of_birth: date_of_birth,
        phone_number: formData.phoneNumber
      };

      try {
        let response = await signup(userInformation);
        if (response && response.status === 'success') {
          toast.success('Registration successful! Please check your email for verification.');
          onClose();
        } else {
          if (response.message) {
            toast.error(response.message);
          } else {
            toast.error('Registration failed. Please try again.');
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
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

  function handleDobChange(e, field) {
    let value = e.target.value;
    
    setFormData(function(prev) {
      let newData = { ...prev };
      newData[field] = value;
      return newData;
    });
    
    if (errors.dob) {
      setErrors(function(prev) {
        let newErrors = { ...prev };
        newErrors.dob = '';
        return newErrors;
      });
    }
  }

  function togglePassword() {
    if (showPassword === true) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }

  // Generate arrays for days, months, and years
  let daysList = [];
  for (let i = 1; i <= 31; i++) {
    daysList.push(i);
  }

  let monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  let yearsList = [];
  let currentYear = new Date().getFullYear();
  for (let i = 0; i < 100; i++) {
    yearsList.push(currentYear - i);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-high w-full max-w-lg rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline italic font-bold text-on-surface">Sign Up</h1>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="fname">First Name</label>
                <input 
                  type="text" id="fname" 
                  value={formData.fname}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-low border ${errors.fname ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface`}
                  placeholder="John"
                />
                {errors.fname ? <p className="text-xs text-error font-label">{errors.fname}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="lname">Last Name</label>
                <input 
                  type="text" id="lname" 
                  value={formData.lname}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-low border ${errors.lname ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface`}
                  placeholder="Doe"
                />
                {errors.lname ? <p className="text-xs text-error font-label">{errors.lname}</p> : null}
              </div>
            </div>

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
              <label className="text-sm font-label text-secondary" htmlFor="password">Password</label>
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
              {errors.password ? <p className="text-sm text-error font-label leading-tight">{errors.password}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-label text-secondary" htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel" id="phoneNumber" 
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full bg-surface-container-low border ${errors.phoneNumber ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface`}
                placeholder="+44 7700 900000"
              />
              {errors.phoneNumber ? <p className="text-xs text-error font-label">{errors.phoneNumber}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary" htmlFor="role">Role</label>
                <select 
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-label text-secondary">Date of Birth</label>
                <div className="grid grid-cols-3 gap-2">
                  <select 
                    value={formData.day}
                    onChange={function(e) { handleDobChange(e, 'day'); }}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Day"
                  >
                    <option value="">Day</option>
                    {daysList.map(function(dayValue) {
                      return <option key={dayValue} value={dayValue}>{dayValue}</option>;
                    })}
                  </select>
                  <select 
                    value={formData.month}
                    onChange={function(e) { handleDobChange(e, 'month'); }}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Month"
                  >
                    <option value="">Month</option>
                    {monthsList.map(function(month, i) {
                      return <option key={i} value={i + 1}>{month}</option>;
                    })}
                  </select>
                  <select 
                    value={formData.year}
                    onChange={function(e) { handleDobChange(e, 'year'); }}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Year"
                  >
                    <option value="">Year</option>
                    {yearsList.map(function(year) {
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
                {errors.dob ? <p className="text-xs text-error font-label">{errors.dob}</p> : null}
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full murrey-gradient text-on-primary font-headline py-3 rounded-lg text-lg font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;