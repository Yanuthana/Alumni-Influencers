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
import AlumniDirectory from './pages/AlumniDirectory';
import { toastConfig } from './config/toast-config';
import { verifyEmail, logout } from './services/auth-service';

function App() {
  let location = useLocation();
  let navigate = useNavigate();
  
  let [showSignup, setShowSignup] = React.useState(false);
  let [showSignin, setShowSignin] = React.useState(false);
  let [showForgotPassword, setShowForgotPassword] = React.useState(false);
  let [prefilledEmail, setPrefilledEmail] = React.useState('');
  let [showDropDown, setShowDropDown] = React.useState(false);
  
  function getInitialUser() {
    let savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        let parsedUser = JSON.parse(savedUser);
        return parsedUser;
      } catch (error) {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  }
  
  let [user, setUser] = React.useState(getInitialUser());
  let verificationStarted = React.useRef(false);

  React.useEffect(function() {
    let urlParams = new URLSearchParams(location.search);
    let token = urlParams.get('verify_token');
    let email = urlParams.get('email');

    if (token) {
      if (verificationStarted.current === false) {
        verificationStarted.current = true;
        
        async function performVerification() {
          try {
            let response = await verifyEmail(token);
            if (response && response.status === 'success') {
              toast.success('Email verified successfully! Please sign in.');
              if (email) {
                setPrefilledEmail(email);
              } else {
                setPrefilledEmail('');
              }
              setShowSignin(true);
            } else {
              if (response.message) {
                toast.error(response.message);
              } else {
                toast.error('Verification failed.');
              }
            }
          } catch (err) {
            toast.error('Verification failed due to a network error.');
          } finally {
            navigate(location.pathname, { replace: true });
          }
        }
        performVerification();
      }
    }

    function handleClickOutside(e) {
      if (showDropDown === true) {
        if (!e.target.closest('.user-profile-dropdown')) {
          setShowDropDown(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname, location.search, showDropDown, navigate]);

  function handleSignupClick() {
    setShowSignin(false);
    setShowSignup(true);
  }

  function handleSigninClick() {
    setShowSignup(false);
    setShowForgotPassword(false);
    setShowSignin(true);
  }

  function handleForgotPasswordClick() {
    setShowSignin(false);
    setShowForgotPassword(true);
  }

  function handleLoginSuccess(userData) {
    setUser(userData);
    let userString = JSON.stringify(userData);
    localStorage.setItem('user', userString);
    setShowSignin(false);
    navigate('/dashboard');
  }

  function handleDropDown() {
    if (showDropDown === true) {
      setShowDropDown(false);
    } else {
      setShowDropDown(true);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      localStorage.removeItem('api_token');
      localStorage.removeItem('user');
      setUser(null);
      setShowDropDown(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  }

  function handlePrimaryCta() {
    if (user !== null) {
      navigate('/dashboard');
    } else {
      handleSigninClick();
    }
  }

  function handleSecondaryCta() {
    if (user !== null) {
      navigate('/dashboard');
    } else {
      handleSignupClick();
    }
  }

  function closeSignup() {
    setShowSignup(false);
  }

  function closeSignin() {
    setShowSignin(false);
  }

  function closeForgotPassword() {
    setShowForgotPassword(false);
  }

  // Helper functions for checking roles
  function isDeveloper() {
    if (user && user.role && user.role.toLowerCase() === 'developer') {
      return true;
    }
    return false;
  }

  function isAlumni() {
    if (user && user.role && user.role.toLowerCase() === 'alumni') {
      return true;
    }
    return false;
  }

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

      <SignupForm isOpen={showSignup} onClose={closeSignup} />
      <SigninForm
        isOpen={showSignin}
        onClose={closeSignin}
        initialEmail={prefilledEmail}
        onSignupClick={handleSignupClick}
        onLoginSuccess={handleLoginSuccess}
        onForgotPasswordClick={handleForgotPasswordClick}
      />
      <ForgotPasswordForm
        isOpen={showForgotPassword}
        onClose={closeForgotPassword}
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
            user !== null ? (
              <Dashboard user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/bid-arena"
          element={
            user !== null ? (
              <BidArena user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/alumni-view"
          element={
            user !== null ? (
              <AlumniDirectory user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/manage-profile"
          element={
            isAlumni() ? (
              <ManageProfile user={user} setUser={setUser} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/view-profile"
          element={
            user !== null ? (
              <ViewProfile user={user} />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/docs"
          element={
            isDeveloper() ? (
              <ViewDocumentation />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route
          path="/api-keys"
          element={
            isDeveloper() ? (
              <ApiKeyManagement />
            ) : (
              <Navigate replace to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
