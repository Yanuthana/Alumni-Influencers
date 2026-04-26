import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import SignupForm from './components/signup';
import SigninForm from './components/Signin';
import ForgotPasswordForm from './components/Forgotpassword';
import Navbar from './components/Navbar';
import Dashboard from './Dashboard';
import BidArena from './pages/BidArena';
import Home from './pages/Home';
import ManageProfile from './pages/ManageProfile';
import ViewProfile from './pages/ViewProfile';
import ViewDocumentation from './pages/ViewDocumentation';
import ApiKeyManagement from './pages/ApiKeyManagement';
import { toastConfig } from './config/toast-config';
import { verifyEmail, logout } from './services/auth-service';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = React.useState(false);
  const [showSignin, setShowSignin] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [prefilledEmail, setPrefilledEmail] = React.useState('');
  const [showDropDown, setShowDropDown] = React.useState(false);
  const [user, setUser] = React.useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const verificationStarted = React.useRef(false);

  React.useEffect(() => {

    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('verify_token');
    const email = urlParams.get('email');

    if (token && !verificationStarted.current) {
      verificationStarted.current = true;
      const performVerification = async () => {
        try {
          const response = await verifyEmail(token);
          if (response && response.status === 'success') {
            toast.success('Email verified successfully! Please sign in.');
            setPrefilledEmail(email || '');
            setShowSignin(true);
          } else {
            toast.error(response.message || 'Verification failed.');
          }
        } catch (err) {
          toast.error('Verification failed due to a network error.');
        } finally {
          // Clean up URL using router instead of window.history
          navigate(location.pathname, { replace: true });
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
  }, [location.pathname, location.search, showDropDown, navigate]);


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
    localStorage.setItem('user', JSON.stringify(userData));
    setShowSignin(false);
    navigate('/dashboard');
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
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handlePrimaryCta = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      handleSigninClick();
    }
  };

  const handleSecondaryCta = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      handleSignupClick();
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

      <Routes>
        <Route
          path="/"
          element={
            <Home 
              user={user} 
              onPrimaryCta={handlePrimaryCta} 
              onSecondaryCta={handleSecondaryCta} 
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/bid-arena"
          element={
            user ? (
              <BidArena user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/manage-profile"
          element={
            user?.role?.toLowerCase() === 'alumni' ? (
              <ManageProfile user={user} setUser={setUser} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/view-profile"
          element={
            user ? (
              <ViewProfile user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/docs"
          element={
            user?.role?.toLowerCase() === 'developer' ? (
              <ViewDocumentation />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/api-keys"
          element={
            user?.role?.toLowerCase() === 'developer' ? (
              <ApiKeyManagement />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        {/* Fallback route to prevent black screen on unknown paths */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  );
}


export default App;
