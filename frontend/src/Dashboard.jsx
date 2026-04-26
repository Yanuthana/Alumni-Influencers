import React from 'react';
import { useNavigate } from 'react-router-dom';
import PanelCard from './components/dashboard/PanelCard';
import StatCard from './components/dashboard/StatCard';
import {
    getGlobalDashboardInsights,
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
    const navigate = useNavigate();
    const isAlumni = String(user?.role || '').toLowerCase() === 'alumni';

    const [globalState, setGlobalState] = React.useState({
        data: null,
        error: '',
        loading: true,
    });

    React.useEffect(() => {
        let isMounted = true;

        if (isAlumni) {

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
                                    ? 'This workspace focuses on platform-wide signals and ecosystem trends. Visit your dedicated profile section for detailed personal performance and record management.'
                                    : 'This workspace highlights platform-wide signals and ecosystem trends tailored for non-alumni roles without exposing personal alumni bidding data.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-outline-variant/35 bg-black/20 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-secondary">Role</p>
                                <p className="mt-2 font-headline text-2xl capitalize text-on-surface">{user?.role || 'member'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeader
                        eyebrow="Global Insights"
                        title="Platform-wide alumni intelligence"
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