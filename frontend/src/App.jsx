import React from 'react';
import SignupForm from './components/signup';
import SigninForm from './components/Signin';
import ForgotPasswordForm from './components/Forgotpassword';
import Navbar from './components/Navbar';
import { Toaster, toast } from 'react-hot-toast';
import { toastConfig } from './config/toast-config';
import { verifyEmail, logout } from './services/auth-service';

function App() {
  const [showSignup, setShowSignup] = React.useState(false);
  const [showSignin, setShowSignin] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [prefilledEmail, setPrefilledEmail] = React.useState('');
  const [showDropDown, setShowDropDown] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const verificationStarted = React.useRef(false);

  React.useEffect(() => {
    // Check for logged in user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verify_token');
    const email = urlParams.get('email');

    if (token && !verificationStarted.current) {
      verificationStarted.current = true;
      const performVerification = async () => {
        const response = await verifyEmail(token);
        if (response && response.status === 'success') {
          toast.success('Email verified successfully! Please sign in.');
          setPrefilledEmail(email || '');
          setShowSignin(true);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          toast.error(response.message || 'Verification failed.');
          // Even if failed, clean up URL to prevent loops
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      performVerification();
    }

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (showDropDown && !e.target.closest('.user-profile-dropdown')) {
        setShowDropDown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropDown]);


  const handleSignupClick = () => {
    setShowSignin(false);
    setShowSignup(true);
  };

  const handleSigninClick = () => {
    setShowSignup(false);
    setShowForgotPassword(false);
    setShowSignin(true);
  };

  const handleForgotPasswordClick = () => {
    setShowSignin(false);
    setShowForgotPassword(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowSignin(false);
  };

  const handleDropDown = () => {
    setShowDropDown(!showDropDown);
  }

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('api_token');
      localStorage.removeItem('user');
      setUser(null);
      setShowDropDown(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <Toaster {...toastConfig} />
      <Navbar 
        onSignupClick={handleSignupClick} 
        onSigninClick={handleSigninClick} 
        user={user}
        onLogout={handleLogout}
        showDropDown={showDropDown}
        onDropDownClick={handleDropDown}
      />
      <SignupForm isOpen={showSignup} onClose={() => setShowSignup(false)} />
      <SigninForm 
        isOpen={showSignin} 
        onClose={() => setShowSignin(false)} 
        initialEmail={prefilledEmail} 
        onSignupClick={handleSignupClick}
        onLoginSuccess={handleLoginSuccess}
        onForgotPasswordClick={handleForgotPasswordClick}
      />
      <ForgotPasswordForm 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />



      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex items-center px-8 md:px-24 overflow-hidden">

          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10"></div>
            <img
              alt=""
              className="w-full h-full object-cover grayscale opacity-40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVjYt1pNaqB2lgms7HEZNLfYopElXG8gNQ5HxhgSktlBdZKi16yLCSZU13vVa_kL5ApWaJHUr8jpjPjNmvtM0oVU48UKVqNbI50JSQAiAPZPT8dB9nT2z0GRu_45tNV4KfyiAxtaWebQwoi9C9t-F4lmKs9vSsUov_i55aoehQtdU9ajr6wvWhDYJrbiNRaYEwKho2G4CFxkblrMMrvaxQmxAuKPA8fkHDBXUo5fdz0gVZLbbPOWfw8hpKxlUl1d1LUEbp1egTSOrg" 
            />
          </div>


          <div className="relative z-20 max-w-4xl">
            <span className="text-sm uppercase tracking-[0.2em] text-primary mb-6 block font-label font-semibold">
              The Digital Atelier of Excellence
            </span>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[0.9] tracking-tighter text-on-surface mb-8 italic">
              Legacy Meets <br />
              <span className="text-secondary opacity-80 font-normal">Innovation.</span>
            </h1>
            <p className="text-xl md:text-2xl font-headline text-secondary max-w-2xl mb-12 leading-relaxed">
              Bridging the gap between the historic halls of Westminster and the global frontiers of industry through an exclusive alumni-student mentorship ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="murrey-gradient text-on-primary px-8 py-4 rounded-md font-headline text-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                Begin Your Mentorship
              </button>
              <button className="border border-outline-variant/30 text-on-surface px-8 py-4 rounded-md font-headline text-xl hover:bg-surface-container-high transition-all active:scale-95">
                Explore the Network
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
