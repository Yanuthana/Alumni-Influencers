import React from 'react';

function Home({ user, onPrimaryCta, onSecondaryCta }) {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="relative flex-1 flex items-center px-8 md:px-24 pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-surface">
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10"></div>
          <img
            alt="Dramatic gothic university hallway"
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
            <button
              className="murrey-gradient text-on-primary px-8 py-4 rounded-md font-headline text-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
              onClick={onPrimaryCta}
            >
              {user ? 'Open Your Dashboard' : 'Begin Your Mentorship'}
            </button>
            <button
              className="border border-outline-variant/30 text-on-surface px-8 py-4 rounded-md font-headline text-xl hover:bg-surface-container-high transition-all active:scale-95"
              onClick={onSecondaryCta}
            >
              {user ? 'View Platform Insights' : 'Explore the Network'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
