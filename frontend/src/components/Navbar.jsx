import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar(props) {
  let onSignupClick = props.onSignupClick;
  let onSigninClick = props.onSigninClick;
  let user = props.user;
  let onLogout = props.onLogout;
  let showDropDown = props.showDropDown;
  let onDropDownClick = props.onDropDownClick;

  let baseLinkClass = "font-headline tracking-tight transition-colors";
  let desktopNavLinks = [
    { label: 'Home', to: '/', requiresAuth: false },
    { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
    { label: 'Alumni Directory', to: '/alumni-view', requiresAuth: true },
    { label: 'Manage Profile', to: '/manage-profile', requiresAuth: true, alumniOnly: true },
    { label: 'Bid Arena', to: '/bid-arena', requiresAuth: true },
    { label: 'Docs', to: '/docs', requiresAuth: true, developerOnly: true },
    { label: 'API Keys', to: '/api-keys', requiresAuth: true, developerOnly: true },
  ];

  let visibleLinks = [];
  for (let i = 0; i < desktopNavLinks.length; i++) {
    let item = desktopNavLinks[i];
    let shouldShow = true;

    if (item.requiresAuth && !user) {
      shouldShow = false;
    }

    if (item.alumniOnly) {
      if (!user || !user.role || user.role.toLowerCase() !== 'alumni') {
        shouldShow = false;
      }
    }

    if (item.developerOnly) {
      if (!user || !user.role || user.role.toLowerCase() !== 'developer') {
        shouldShow = false;
      }
    }

    if (shouldShow) {
      visibleLinks.push(item);
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-none">
        <div className="text-2xl font-serif text-[#e5e2e1] italic font-headline tracking-tight">
          <NavLink to="/" className="hover:text-primary transition-colors">
            Westminster Regent
          </NavLink>
        </div>

        {user ? (
          <div className="hidden md:flex items-center space-x-8">
            {visibleLinks.map(function (item) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={function ({ isActive }) {
                    if (isActive) {
                      return baseLinkClass + " text-primary";
                    } else {
                      return baseLinkClass + " text-[#c6c6c6] hover:text-[#e5e2e1]";
                    }
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center space-x-6">
          {!user ? (
            <React.Fragment>
              <button
                className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors active:scale-95"
                onClick={onSigninClick}
              >
                Sign In
              </button>
              <button
                className="bg-primary-container text-on-primary-container px-6 py-2 rounded-md font-headline tracking-tight hover:bg-[#2a2a2a] transition-all duration-300 active:scale-95"
                onClick={onSignupClick}
              >
                Sign Up
              </button>
            </React.Fragment>
          ) : (
            <div className="relative user-profile-dropdown">
              <div
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={onDropDownClick}
              >
                <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-high group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person</span>
                </div>
                <span className="text-[#e5e2e1] font-headline font-medium tracking-tight">
                  {user.first_name}
                </span>
              </div>

              {showDropDown ? (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <NavLink
                    to="/view-profile"
                    onClick={onDropDownClick}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-variant transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-primary text-lg">account_circle</span>
                    <span className="font-headline font-medium text-sm">View Profile</span>
                  </NavLink>
                  <div className="h-px bg-outline-variant/30 mx-2 my-1"></div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-variant transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-error text-lg">logout</span>
                    <span className="font-headline font-medium text-sm">Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
