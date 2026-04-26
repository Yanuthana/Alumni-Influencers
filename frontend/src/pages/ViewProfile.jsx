import React from 'react';
import PanelCard from '../components/dashboard/PanelCard';

function InfoRow({ label, value, icon }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
            <div>
                <p className="text-[11px] font-label uppercase tracking-widest text-secondary">{label}</p>
                <p className="font-headline text-lg text-on-surface">{value || 'Not provided'}</p>
            </div>
        </div>
    );
}

function ViewProfile({ user }) {
    if (!user) return null;

    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <div className="inline-flex w-24 h-24 rounded-full border-2 border-primary/30 p-1 mb-6">
                        <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-primary">person</span>
                        </div>
                    </div>
                    <h1 className="font-headline text-4xl text-on-surface md:text-5xl">
                        {user.first_name} {user.last_name}
                    </h1>
                    <p className="mt-2 text-secondary font-label uppercase tracking-[0.2em]">{user.role}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <PanelCard eyebrow="Identity" title="Personal Details">
                        <div className="space-y-4">
                            <InfoRow label="First Name" value={user.first_name} icon="badge" />
                            <InfoRow label="Last Name" value={user.last_name} icon="badge" />
                            <InfoRow label="Email Address" value={user.email} icon="mail" />
                        </div>
                    </PanelCard>

                    <PanelCard eyebrow="System" title="Account Status">
                        <div className="space-y-4">
                            <InfoRow label="User Role" value={user.role} icon="shield_person" />
                            <InfoRow label="Account ID" value={`#${user.user_id}`} icon="fingerprint" />
                            <InfoRow label="Verified" value={user.is_verified ? 'Yes' : 'No'} icon={user.is_verified ? 'verified' : 'error'} />
                        </div>
                    </PanelCard>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-secondary text-sm">
                        Interested in editing your professional details? 
                        <br />
                        Head over to the <a href="/manage-profile" className="text-primary hover:underline font-medium">Manage Profile</a> section.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default ViewProfile;
