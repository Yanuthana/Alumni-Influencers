import React, { useState, useEffect } from 'react';
import {signup} from '../services/auth-service';
import toast from 'react-hot-toast';

function SignupForm({ isOpen, onClose }) {
  const initialFormState = {
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

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const validate = () => {
    let newErrors = {};

    // Email check
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password check (relaxed: min 8 chars and at least 1 number)
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRegex = /^(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and include at least one number';
      }
    }

    // Other required fields
    if (!formData.fname.trim()) newErrors.fname = 'First name is required';
    if (!formData.lname.trim()) newErrors.lname = 'Last name is required';
    if (!formData.day || !formData.month || !formData.year) newErrors.dob = 'Complete date of birth is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const date_of_birth = `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`;
      
      let submissionRole = formData.role;
      if(submissionRole === 'admin') {
        submissionRole = 'developer';
      }

      const userInformation = {
        first_name: formData.fname,
        last_name: formData.lname,
        email: formData.email,
        password: formData.password,
        role: submissionRole,
        date_of_birth: date_of_birth,
        phone_number: formData.phoneNumber
      };

      try {
        const response = await signup(userInformation);
        if (response && response.status === 'success') {
          toast.success('Registration successful! Please check your email for verification.');
          onClose();
        } else {
          toast.error(response.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleDobChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
  };

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
                {errors.fname && <p className="text-xs text-error font-label">{errors.fname}</p>}
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
                {errors.lname && <p className="text-xs text-error font-label">{errors.lname}</p>}
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
              {errors.email && <p className="text-xs text-error font-label">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-label text-secondary" htmlFor="password">Password</label>
              <input 
                type="password" id="password" 
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-surface-container-low border ${errors.password ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-on-surface`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-error font-label leading-tight">{errors.password}</p>}
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
              {errors.phoneNumber && <p className="text-xs text-error font-label">{errors.phoneNumber}</p>}
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
                    onChange={(e) => handleDobChange(e, 'day')}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Day"
                  >
                    <option value="">Day</option>
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select 
                    value={formData.month}
                    onChange={(e) => handleDobChange(e, 'month')}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Month"
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
                      <option key={i} value={i + 1}>{month}</option>
                    ))}
                  </select>
                  <select 
                    value={formData.year}
                    onChange={(e) => handleDobChange(e, 'year')}
                    className={`bg-surface-container-low border ${errors.dob ? 'border-error' : 'border-outline-variant/30'} rounded-lg px-2 py-2.5 outline-none focus:border-primary transition-colors text-on-surface appearance-none text-sm`}
                    aria-label="Year"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.dob && <p className="text-xs text-error font-label">{errors.dob}</p>}
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