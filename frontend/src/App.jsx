import React from 'react';

function App() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* Top Navigation Bar */}
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
            <button className="font-headline tracking-tight text-[#c6c6c6] hover:text-[#e5e2e1] transition-colors active:scale-95 transition-transform">Sign In</button>
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-md font-headline tracking-tight hover:bg-[#2a2a2a] transition-all duration-300 active:scale-95 transition-transform">Sign Up</button>
          </div>
        </div>
      </nav>

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
              Legacy Meets <br/>
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
