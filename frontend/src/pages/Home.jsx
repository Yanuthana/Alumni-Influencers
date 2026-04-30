import React from 'react';
import { getFeaturedAlumni } from '../services/featured-alumni-service';
import { getSlotByDate } from '../services/bid-service';

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">{eyebrow}</p>
                <h2 className="font-headline text-3xl text-on-surface md:text-4xl">{title}</h2>
            </div>
            {description && <p className="max-w-2xl text-sm leading-6 text-secondary">{description}</p>}
        </div>
    );
}

function SkeletonCard({ className = '' }) {
    return <div className={`animate-pulse rounded-[24px] border border-outline-variant/30 bg-surface-container-low ${className}`} />;
}


function CredentialCard({ icon, label, children }) {
    return (
        <div className="group rounded-[24px] border border-outline-variant/20 bg-surface-container-low/40 p-5 transition-all duration-300 hover:border-primary/25 hover:bg-surface-container-low/70 hover:shadow-lg hover:shadow-black/20">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">{label}</h4>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}


function CredentialItem({ title, subtitle }) {
    return (
        <div className="rounded-xl border border-outline-variant/10 bg-black/15 px-4 py-3">
            <p className="text-sm font-semibold text-on-surface">{title}</p>
            <p className="mt-1 text-xs text-secondary">{subtitle}</p>
        </div>
    );
}


function InfoChip({ icon, children, href }) {
    let className = "inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-black/20 px-4 py-2 text-sm text-secondary transition-colors hover:border-primary/40 hover:text-on-surface";

    if (href) {
        return (
            <a href={href} target="_blank" rel="noreferrer" className={className}>
                <span className="material-symbols-outlined text-base text-primary/70">{icon}</span>
                {children}
            </a>
        );
    }

    return (
        <span className={className}>
            <span className="material-symbols-outlined text-base text-primary/70">{icon}</span>
            {children}
        </span>
    );
}

/* ── Featured Alumni Section ───────────────────────────── */
function FeaturedAlumniSection({ winner, loading }) {
    if (loading) {
        return (
            <section id="featured-alumni-section" className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
                <SectionHeader
                    eyebrow="Daily Spotlight"
                    title="Featured Alumni"
                    description="Recognizing excellence and platform contribution."
                />
                <div className="grid gap-6 md:grid-cols-3">
                    <SkeletonCard className="h-72" />
                    <SkeletonCard className="col-span-2 h-72" />
                </div>
            </section>
        );
    }

    if (!winner) return null;

   
    let categories = [];

    if (winner.degrees && winner.degrees.length > 0) {
        let items = [];
        for (let i = 0; i < winner.degrees.length; i++) {
            let d = winner.degrees[i];
            items.push({ title: d.title, subtitle: d.institution + ' • ' + d.year });
        }
        categories.push({ id: 'education', label: 'Academic Background', icon: 'school', items: items });
    }

    if (winner.employment_history && winner.employment_history.length > 0) {
        let items = [];
        for (let i = 0; i < winner.employment_history.length; i++) {
            let e = winner.employment_history[i];
            items.push({ title: e.position, subtitle: e.company + ' • ' + e.years });
        }
        categories.push({ id: 'experience', label: 'Employment History', icon: 'work', items: items });
    }

    if (winner.certifications && winner.certifications.length > 0) {
        let items = [];
        for (let i = 0; i < winner.certifications.length; i++) {
            let c = winner.certifications[i];
            items.push({ title: c.name, subtitle: c.issuer + ' • ' + c.year });
        }
        categories.push({ id: 'certifications', label: 'Certifications', icon: 'verified', items: items });
    }

    if (winner.licenses && winner.licenses.length > 0) {
        let items = [];
        for (let i = 0; i < winner.licenses.length; i++) {
            let l = winner.licenses[i];
            items.push({ title: l.name, subtitle: l.authority + ' • ' + l.year });
        }
        categories.push({ id: 'licenses', label: 'Professional Licenses', icon: 'badge', items: items });
    }

    return (
        <section id="featured-alumni-section" className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <SectionHeader
                eyebrow="Alumni Excellence"
                title="Featured Alumni of the Day"
                description="Highlighting the professional journey and achievements of our distinguished members."
            />

            
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

                
                <div className="relative w-full overflow-hidden rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_center,_rgba(255,176,201,0.18),_transparent_55%),linear-gradient(180deg,_rgba(42,42,42,0.95),_rgba(19,19,19,1))] shadow-[0_24px_60px_rgba(0,0,0,0.32)] lg:w-72 xl:w-80 shrink-0">
                    
                    <div className="h-1 w-full murrey-gradient" />

                    
                    <div className="pointer-events-none absolute left-1/2 top-16 h-52 w-52 -translate-x-1/2 rounded-full bg-primary/12 blur-[60px]" />

                    <div className="relative flex flex-col items-center px-8 pb-10 pt-10 text-center">
                        
                        <div className="relative mb-6">
                            
                            <div className="absolute inset-0 rounded-full border border-primary/20 scale-[1.18]" />
                            <div className="absolute inset-0 rounded-full border border-primary/10 scale-[1.35]" />

                            
                            <div className="relative h-36 w-36 overflow-hidden rounded-full border-[3px] border-surface-container-high shadow-[0_0_40px_rgba(255,176,201,0.2)]">
                                {winner.profile_image ? (
                                    <img
                                        src={winner.profile_image}
                                        className="h-full w-full object-cover"
                                        alt={winner.full_name}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-5xl font-headline text-primary">
                                        {winner.full_name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            
                            <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full murrey-gradient text-white shadow-xl ring-[3px] ring-[#1a1a1a]">
                                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                            </div>
                        </div>

                        
                        <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                            {winner.full_name}
                        </h3>

                        
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1">
                            <span className="h-1.5 w-1.5 rounded-full murrey-gradient" />
                            <span className="text-[11px] font-label font-bold uppercase tracking-[0.2em] text-primary">
                                Featured Alumni
                            </span>
                        </div>

                        
                        <div className="my-6 h-px w-full bg-outline-variant/15" />

                        
                        <p className="text-sm leading-relaxed text-secondary italic">
                            "{winner.headline || 'Dedicated to excellence and contributing to the global Westminster alumni community.'}"
                        </p>

                        
                        <div className="my-6 h-px w-full bg-outline-variant/15" />

                        
                        <div className="flex w-full flex-col gap-3">
                            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-black/20 px-4 py-3 text-left">
                                <span className="material-symbols-outlined text-lg text-primary/70">mail</span>
                                <span className="truncate text-xs text-secondary">{winner.email}</span>
                            </div>
                            {winner.linkedin_url && (
                                <a
                                    href={winner.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-black/20 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <span className="material-symbols-outlined text-lg text-primary/70">link</span>
                                    <span className="text-xs text-secondary">LinkedIn Profile</span>
                                    <span className="material-symbols-outlined ml-auto text-sm text-primary/40">open_in_new</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                
                <div className="flex-1 rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,176,201,0.08),_transparent_40%),linear-gradient(135deg,_rgba(42,42,42,0.95),_rgba(19,19,19,1))] shadow-[0_24px_60px_rgba(0,0,0,0.28)] overflow-hidden">
                    
                    <div className="border-b border-outline-variant/15 px-8 py-5">
                        <p className="text-[11px] font-label font-bold uppercase tracking-[0.28em] text-primary/60">
                            Professional Credentials
                        </p>
                    </div>

                    {categories.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:p-8">
                            {categories.map(function (cat) {
                                return (
                                    <CredentialCard key={cat.id} icon={cat.icon} label={cat.label}>
                                        {cat.items.map(function (item, idx) {
                                            return <CredentialItem key={idx} title={item.title} subtitle={item.subtitle} />;
                                        })}
                                    </CredentialCard>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high">
                                <span className="material-symbols-outlined text-2xl text-secondary/50">folder_open</span>
                            </div>
                            <p className="text-sm text-secondary">No credentials have been added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function Home(props) {
    let user = props.user;
    let onPrimaryCta = props.onPrimaryCta;
    let onSecondaryCta = props.onSecondaryCta;

    const [featuredAlumni, setFeaturedAlumni] = React.useState(null);
    const [featuredLoading, setFeaturedLoading] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;

        const fetchFeaturedAlumni = async () => {
            try {
                if (isMounted) setFeaturedLoading(true);
                
                // Calculate target date: Before 6 PM show yesterday, After 6 PM show today
                const now = new Date();
                const targetDate = new Date(now);
                if (now.getHours() < 18) {
                    targetDate.setDate(now.getDate() - 1);
                }
                const dateStr = targetDate.toLocaleDateString('en-CA'); // Gets YYYY-MM-DD in local time
                
                const slotResult = await getSlotByDate(user?.user_id || 0, dateStr);

                if (slotResult && slotResult.status === 'success' && slotResult.data) {
                    const result = await getFeaturedAlumni(slotResult.data.slot_id);
                    if (result && result.status === 'success' && isMounted) {
                        setFeaturedAlumni(result.data);
                    }
                }
            } catch (error) {
                console.log('Failed to fetch featured alumni on Home:', error);
            } finally {
                if (isMounted) setFeaturedLoading(false);
            }
        };

        fetchFeaturedAlumni();

        return () => { isMounted = false; };
    }, [user?.user_id]);

    return (
        <main className="min-h-screen flex flex-col bg-surface">
            
            <section className="relative min-h-[85vh] flex items-center px-8 md:px-24 pt-28 pb-24 overflow-hidden">
              
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10"></div>
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
                            onClick={() => {
                                if (user) {
                                    document.getElementById('featured-alumni-section')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    onSecondaryCta();
                                }
                            }}
                        >
                            {user ? 'View Alumni' : 'Explore the Network'}
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Featured Alumni ── */}
            <FeaturedAlumniSection winner={featuredAlumni} loading={featuredLoading} />
        </main>
    );
}

export default Home;
