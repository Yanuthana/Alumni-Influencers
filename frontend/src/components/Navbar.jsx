import React from 'react';

function Navbar({ onSignupClick }) {
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
          <button 
            className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors active:scale-95 transition-transform" 
            onClick={onSignupClick}
          >
            Sign In
          </button>
          <button 
            className="bg-primary-container text-on-primary-container px-6 py-2 rounded-md font-headline tracking-tight hover:bg-[#2a2a2a] transition-all duration-300 active:scale-95 transition-transform" 
            onClick={onSignupClick}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
