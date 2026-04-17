import React from 'react';
import PanelCard from './components/dashboard/PanelCard';
import StatCard from './components/dashboard/StatCard';
import {
    getGlobalDashboardInsights,
    getPersonalDashboardInsights,
} from './services/dashboard-service';

function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">{eyebrow}</p>
                <h2 className="font-headline text-3xl text-on-surface md:text-4xl">{title}</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-secondary">{description}</p>
        </div>
    );
}

function SkeletonCard({ className = '' }) {
    return <div className={`animate-pulse rounded-[24px] border border-outline-variant/30 bg-surface-container-low ${className}`} />;
}

function EmptyState({ title, description }) {
    return (
        <PanelCard title={title}>
            <p className="text-secondary">{description}</p>
        </PanelCard>
    );
}

function ErrorState({ title, message }) {
    return (
        <PanelCard title={title}>
            <div className="rounded-2xl border border-error/30 bg-error/8 p-4 text-sm text-on-surface">
                {message}
            </div>
        </PanelCard>
    );
}

function ProgressRing({ value }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="52" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="transparent"
                    stroke="url(#progressGradient)"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="12"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb0c9" />
                        <stop offset="100%" stopColor="#8b004b" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <p className="font-headline text-4xl text-on-surface">{safeValue}%</p>
                <p className="text-xs uppercase tracking-[0.24em] text-secondary">Ready</p>
            </div>
        </div>
    );
}

function InsightList({ items, variant = 'bars' }) {
    if (!items?.length) {
        return <p className="text-secondary">No items available yet.</p>;
    }

    const maxCount = Math.max(...items.map((item) => item.count || 0), 1);

    if (variant === 'tags') {
        return (
            <div className="flex flex-wrap gap-3">
                {items.map((item) => (
                    <span
                        key={item.label}
                        className="rounded-full border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-sm text-on-surface"
                    >
                        {item.label}
                        {item.provider ? ` • ${item.provider}` : ''}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-on-surface">{item.label}</span>
                        <span className="text-secondary">
                            {item.provider ? `${item.provider} • ` : ''}
                            {item.count}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/35">
                        <div
                            className="h-2 rounded-full murrey-gradient transition-all duration-700"
                            style={{ width: `${Math.max(((item.count || 0) / maxCount) * 100, 12)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function Dashboard({ user }) {
    const isAlumni = String(user?.role || '').toLowerCase() === 'alumni';
    const [personalState, setPersonalState] = React.useState({
        data: null,
        error: '',
        loading: isAlumni,
    });
    const [globalState, setGlobalState] = React.useState({
        data: null,
        error: '',
        loading: true,
    });

    React.useEffect(() => {
        let isMounted = true;

        if (isAlumni) {
            setPersonalState({ data: null, error: '', loading: true });
            getPersonalDashboardInsights()
                .then((data) => {
                    if (!isMounted) {
                        return;
                    }
                    setPersonalState({ data, error: '', loading: false });
                })
                .catch((error) => {
                    if (!isMounted) {
                        return;
                    }
                    setPersonalState({
                        data: null,
                        error: error.message || 'Failed to load personal insights.',
                        loading: false,
                    });
                });
        } else {
            setPersonalState({ data: null, error: '', loading: false });
        }

        setGlobalState({ data: null, error: '', loading: true });
        getGlobalDashboardInsights()
            .then((data) => {
                if (!isMounted) {
                    return;
                }
                setGlobalState({ data, error: '', loading: false });
            })
            .catch((error) => {
                if (!isMounted) {
                    return;
                }
                setGlobalState({
                    data: null,
                    error: error.message || 'Failed to load global insights.',
                    loading: false,
                });
            });

        return () => {
            isMounted = false;
        };
    }, [isAlumni, user?.user_id]);

    const personalData = personalState.data;
    const globalData = globalState.data;
    const hasGlobalData = Boolean(
        globalData &&
        [globalData.topOccupations, globalData.topCertifications, globalData.topCourses, globalData.topDegrees].some(
            (items) => items?.length
        )
    );

    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="mb-10 rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_left,_rgba(255,176,201,0.2),_transparent_28%),linear-gradient(135deg,_rgba(42,42,42,0.95),_rgba(19,19,19,1))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-[11px] font-label uppercase tracking-[0.28em] text-primary/80">
                                Hybrid Dashboard
                            </p>
                            <h1 className="font-headline text-4xl text-on-surface md:text-6xl">
                                Welcome back, {user?.first_name || 'Member'}.
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-secondary md:text-base">
                                {isAlumni
                                    ? 'Your workspace blends personal performance signals with platform-wide opportunities so you can act on both your progress and the broader alumni market.'
                                    : 'This workspace highlights platform-wide signals and ecosystem trends tailored for non-alumni roles without exposing personal alumni bidding data.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-outline-variant/35 bg-black/20 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Role</p>
                                <p className="mt-2 font-headline text-2xl capitalize text-on-surface">{user?.role || 'member'}</p>
                            </div>
                            <div className="rounded-2xl border border-outline-variant/35 bg-black/20 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Access</p>
                                <p className="mt-2 font-headline text-2xl text-on-surface">
                                    {isAlumni ? 'Personal + Global' : 'Global Only'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {isAlumni ? (
                    <section className="mb-12">
                        <SectionHeader
                            eyebrow="Personal Insights"
                            title="Your profile and bidding momentum"
                            description="These widgets are rendered only for alumni users and combine your completion status, skill signals, and bidding outcomes."
                        />

                        {personalState.loading ? (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <SkeletonCard className="h-44" />
                                    <SkeletonCard className="h-44" />
                                    <SkeletonCard className="h-44" />
                                    <SkeletonCard className="h-44" />
                                </div>
                                <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                                    <SkeletonCard className="h-96" />
                                    <SkeletonCard className="h-96" />
                                </div>
                            </div>
                        ) : personalState.error ? (
                            <ErrorState title="Personal insights unavailable" message={personalState.error} />
                        ) : !personalData ? (
                            <EmptyState
                                title="No personal data available"
                                description="Complete your profile and participate in bidding to unlock personal analytics."
                            />
                        ) : (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <StatCard
                                        icon="groups"
                                        label="Total Alumni"
                                        value={personalData.totalAlumni}
                                        helper="Platform context metric"
                                        accent="from-primary/35 to-secondary-container/70"
                                    />
                                    <StatCard
                                        icon="check_circle"
                                        label="Profile Completion"
                                        value={personalData.profileCompletion}
                                        suffix="%"
                                        helper="Based on your core profile sections"
                                        progress={personalData.profileCompletion}
                                        accent="from-primary/35 to-primary-container/80"
                                    />
                                    <StatCard
                                        icon="military_tech"
                                        label="Monthly Bid Wins"
                                        value={personalData.monthlyBidWins}
                                        helper="Won bids recorded this month"
                                        accent="from-primary/35 to-[#5f163d]"
                                    />
                                    <StatCard
                                        icon="bolt"
                                        label="Active Bidders"
                                        value={personalData.activeBidders}
                                        helper="System-wide market activity"
                                        accent="from-secondary-container/60 to-surface-bright"
                                    />
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                                    <PanelCard
                                        eyebrow="Skills Pulse"
                                        title="Personal Skills Panel"
                                        action={<button className="text-xs font-label uppercase tracking-[0.24em] text-primary">Strongest focus</button>}
                                    >
                                        {personalData.skills?.length ? (
                                            <InsightList items={personalData.skills} />
                                        ) : (
                                            <p className="text-secondary">No personal data available</p>
                                        )}
                                    </PanelCard>

                                    <PanelCard eyebrow="Completion" title="Profile Strength">
                                        <div className="flex flex-col items-center gap-6">
                                            <ProgressRing value={personalData.profileCompletion} />
                                            <div className="w-full space-y-3">
                                                {[
                                                    ['Education', personalData.profileBreakdown?.education],
                                                    ['Certifications', personalData.profileBreakdown?.certifications],
                                                    ['Experience', personalData.profileBreakdown?.experience],
                                                    ['Professional Courses', personalData.profileBreakdown?.professionalCourses],
                                                ].map(([label, complete]) => (
                                                    <div key={label} className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3">
                                                        <span className="text-sm text-on-surface">{label}</span>
                                                        <span className={`material-symbols-outlined text-lg ${complete ? 'text-tertiary' : 'text-secondary/60'}`}>
                                                            {complete ? 'check_circle' : 'radio_button_unchecked'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="w-full rounded-2xl murrey-gradient px-5 py-3 font-headline text-lg text-on-primary transition-transform hover:-translate-y-0.5">
                                                Complete Profile
                                            </button>
                                        </div>
                                    </PanelCard>
                                </div>

                                <PanelCard eyebrow="Performance" title="Personal Bidding Performance">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <StatCard
                                            icon="emoji_events"
                                            label="Wins"
                                            value={personalData.biddingStats?.wins || 0}
                                            helper="All recorded winning bids"
                                        />
                                        <StatCard
                                            icon="gavel"
                                            label="Total Bids"
                                            value={personalData.biddingStats?.totalBids || 0}
                                            helper="Participations across slots"
                                            accent="from-secondary-container/60 to-surface-bright"
                                        />
                                        <StatCard
                                            icon="monitoring"
                                            label="Win Rate"
                                            value={personalData.biddingStats?.winRate || 0}
                                            suffix="%"
                                            helper={
                                                personalData.biddingStats?.activeWinner
                                                    ? 'You are currently marked as an active winner'
                                                    : 'Keep bidding to improve your conversion'
                                            }
                                            progress={personalData.biddingStats?.winRate || 0}
                                            accent="from-primary/35 to-[#5f163d]"
                                        />
                                    </div>
                                </PanelCard>
                            </div>
                        )}
                    </section>
                ) : null}

                <section>
                    <SectionHeader
                        eyebrow="Global Insights"
                        title="Platform-wide alumni intelligence"
                        description="Visible to every logged-in user. These widgets summarize occupations, certifications, courses, and degree distributions across the wider alumni ecosystem."
                    />

                    {globalState.loading ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <SkeletonCard className="h-80" />
                            <SkeletonCard className="h-80" />
                            <SkeletonCard className="h-80" />
                            <SkeletonCard className="h-80" />
                        </div>
                    ) : globalState.error ? (
                        <ErrorState title="Global insights unavailable" message={globalState.error} />
                    ) : !hasGlobalData ? (
                        <EmptyState
                            title="No global insights available"
                            description="As more alumni profiles are completed, this section will surface broader platform patterns."
                        />
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            <PanelCard eyebrow="Occupations" title="Occupation Toplist">
                                <InsightList items={globalData.topOccupations} />
                            </PanelCard>
                            <PanelCard eyebrow="Certifications" title="Certifications Overview">
                                <InsightList items={globalData.topCertifications} variant="tags" />
                            </PanelCard>
                            <PanelCard eyebrow="Courses" title="Professional Courses Trend">
                                <InsightList items={globalData.topCourses} />
                            </PanelCard>
                            <PanelCard eyebrow="Degrees" title="Degrees Distribution">
                                <InsightList items={globalData.topDegrees} />
                            </PanelCard>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Dashboard;