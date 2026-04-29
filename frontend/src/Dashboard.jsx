import React from 'react';
import { useNavigate } from 'react-router-dom';
import PanelCard from './components/dashboard/PanelCard';
import StatCard from './components/dashboard/StatCard';
import {
    getGlobalDashboardInsights,
} from './services/dashboard-service';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

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
        [globalData.topSkills, globalData.topOccupations, globalData.topCertifications, globalData.topCourses, globalData.topDegrees].some(
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
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <StatCard
                                    icon="group"
                                    label="Total Alumni"
                                    value={globalData.totalAlumni || 0}
                                    helper="Registered on the platform"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <PanelCard eyebrow="Demand" title="Skills Demand (Bar)">
                                    <div className="h-64">
                                        <Bar
                                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                            data={{
                                                labels: globalData.topSkills?.slice(0, 5).map(s => s.label) || [],
                                                datasets: [{
                                                    label: 'Alumni',
                                                    data: globalData.topSkills?.slice(0, 5).map(s => s.count) || [],
                                                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                                }]
                                            }}
                                        />
                                    </div>
                                </PanelCard>

                                <PanelCard eyebrow="Trends" title="Growth Trends (Line)">
                                    <div className="h-64">
                                        <Line
                                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                            data={{
                                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                                datasets: [{
                                                    label: 'Growth',
                                                    data: [12, 19, 3, 5, 2, 3].map(v => v * (globalData.totalAlumni || 1) / 10),
                                                    borderColor: 'rgba(54, 162, 235, 1)',
                                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                    fill: true,
                                                }]
                                            }}
                                        />
                                    </div>
                                </PanelCard>

                                <PanelCard eyebrow="Industry" title="Industry Distribution (Pie)">
                                    <div className="h-64 relative flex justify-center items-center">
                                        <Pie
                                            options={{ responsive: true, maintainAspectRatio: false }}
                                            data={{
                                                labels: globalData.topOccupations?.slice(0, 4).map(o => o.label) || [],
                                                datasets: [{
                                                    data: globalData.topOccupations?.slice(0, 4).map(o => o.count) || [],
                                                    backgroundColor: [
                                                        'rgba(255, 99, 132, 0.6)',
                                                        'rgba(54, 162, 235, 0.6)',
                                                        'rgba(255, 206, 86, 0.6)',
                                                        'rgba(75, 192, 192, 0.6)'
                                                    ],
                                                }]
                                            }}
                                        />
                                    </div>
                                </PanelCard>

                                <PanelCard eyebrow="Certifications" title="Certifications (Doughnut)">
                                    <div className="h-64 relative flex justify-center items-center">
                                        <Doughnut
                                            options={{ responsive: true, maintainAspectRatio: false }}
                                            data={{
                                                labels: globalData.topCertifications?.slice(0, 4).map(c => c.label) || [],
                                                datasets: [{
                                                    data: globalData.topCertifications?.slice(0, 4).map(c => c.count) || [],
                                                    backgroundColor: [
                                                        'rgba(153, 102, 255, 0.6)',
                                                        'rgba(255, 159, 64, 0.6)',
                                                        'rgba(255, 99, 132, 0.6)',
                                                        'rgba(75, 192, 192, 0.6)'
                                                    ],
                                                }]
                                            }}
                                        />
                                    </div>
                                </PanelCard>

                                <PanelCard eyebrow="Comparison" title="Skill Comparison (Radar)">
                                    <div className="h-64 relative flex justify-center items-center">
                                        <Radar
                                            options={{ responsive: true, maintainAspectRatio: false, scales: { r: { ticks: { display: false } } } }}
                                            data={{
                                                labels: globalData.topSkills?.slice(0, 5).map(s => s.label) || [],
                                                datasets: [{
                                                    label: 'Skill Proficiency/Demand',
                                                    data: globalData.topSkills?.slice(0, 5).map(s => s.count) || [],
                                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                    borderColor: 'rgba(255, 99, 132, 1)',
                                                    borderWidth: 1,
                                                }]
                                            }}
                                        />
                                    </div>
                                </PanelCard>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Dashboard;