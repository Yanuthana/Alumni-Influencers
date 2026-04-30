import React from 'react';
import PanelCard from '../components/dashboard/PanelCard';

function ViewDocumentation() {
    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-10 rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_left,_rgba(139,0,75,0.1),_transparent_28%)] p-8 shadow-2xl">
                    <p className="mb-3 text-[11px] font-label uppercase tracking-[0.28em] text-primary/80">Documentation</p>
                    <h1 className="font-headline text-4xl text-on-surface md:text-6xl">Developer Guide</h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-secondary md:text-base">
                        Explore our API references and integration guides to build powerful tools atop the Alumni-Influencers ecosystem.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    <PanelCard title="Rest API Reference">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-black/20 border border-outline-variant/20">
                                <span className="text-xs font-label text-primary uppercase">GET</span>
                                <p className="font-mono text-sm text-on-surface mt-1">/api/v1/alumni</p>
                                <p className="text-xs text-secondary mt-2">Retrieve a list of verified alumni with professional insights.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-black/20 border border-outline-variant/20">
                                <span className="text-xs font-label text-secondary uppercase">POST</span>
                                <p className="font-mono text-sm text-on-surface mt-1">/api/v1/verify-credential</p>
                                <p className="text-xs text-secondary mt-2">Submit a credential for platform verification.</p>
                            </div>
                        </div>
                    </PanelCard>

                    <PanelCard title="Authentication">
                        <p className="text-secondary text-sm mb-4"> All API requests must be authenticated using a Bearer token in the Authorization header. </p>
                        <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20">
                            <code className="text-xs text-primary font-mono select-all">
                                Authorization: Bearer YOUR_API_KEY
                            </code>
                        </div>
                    </PanelCard>
                </div>
            </div>
        </main>
    );
}

export default ViewDocumentation;
