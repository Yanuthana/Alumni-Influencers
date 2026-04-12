import React from 'react';

function Navbar({ onSignupClick, onSigninClick, user, onLogout, showDropDown, onDropDownClick }) {

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-none">
        <div className="text-2xl font-serif text-[#e5e2e1] italic font-headline tracking-tight">
          Westminster Regent
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors" href="#">Network</a>
          <a className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors" href="#">Mentorship</a>
          <a className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors" href="#">Knowledge Hub</a>
          <a className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors" href="#">Events</a>
        </div>
        <div className="flex items-center space-x-6">
          {!user ? (
            <>
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
            </>
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

              {showDropDown && (
                <div className="absolute right-0 mt-2 w-40 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-on-surface hover:bg-surface-variant transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-error text-lg">logout</span>
                    <span className="font-headline font-medium text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
