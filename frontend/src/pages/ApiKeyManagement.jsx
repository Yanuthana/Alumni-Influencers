import React from 'react';
import PanelCard from '../components/dashboard/PanelCard';
import { toast } from 'react-hot-toast';

function ApiKeyManagement() {
    let [keys, setKeys] = React.useState([
        { id: 1, name: 'Main Production Key', prefix: 'ai_live_...', created: '2024-03-20', status: 'Active' },
        { id: 2, name: 'Testing Sandbox', prefix: 'ai_test_...', created: '2024-04-15', status: 'Revoked' },
    ]);

    function handleCreateKey() {
        toast.success('Successfully generated a new API key');
    }

    function handleRevoke(id) {
        if (window.confirm('Are you sure you want to revoke this API key? This action is irreversible.')) {
            setKeys(function(prevKeys) {
                let newKeys = [];
                for (let i = 0; i < prevKeys.length; i++) {
                    let k = prevKeys[i];
                    if (k.id === id) {
                        newKeys.push({
                            id: k.id,
                            name: k.name,
                            prefix: k.prefix,
                            created: k.created,
                            status: 'Revoked'
                        });
                    } else {
                        newKeys.push(k);
                    }
                }
                return newKeys;
            });
            toast.success('Key revoked successfully');
        }
    }

    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-10 rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_right,_rgba(139,0,75,0.1),_transparent_28%)] p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="mb-3 text-[11px] font-label uppercase tracking-[0.28em] text-primary/80">Security</p>
                            <h1 className="font-headline text-4xl text-on-surface md:text-6xl">API Access</h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-secondary md:text-base">
                                Manage your application credentials and monitor programmatic access to the platform.
                            </p>
                        </div>
                        <button 
                            onClick={handleCreateKey}
                            className="px-8 py-3 rounded-2xl murrey-gradient text-on-primary font-headline shadow-lg hover:scale-105 transition-transform"
                        >
                            Generate New Key
                        </button>
                    </div>
                </header>

                <PanelCard title="Active Keys" eyebrow="Management">
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-left">
                            <thead className="border-b border-outline-variant/30 text-xs font-label uppercase tracking-widest text-secondary">
                                <tr>
                                    <th className="pb-4 px-4 font-normal">Key Name</th>
                                    <th className="pb-4 px-4 font-normal">Prefix</th>
                                    <th className="pb-4 px-4 font-normal">Created</th>
                                    <th className="pb-4 px-4 font-normal text-center">Status</th>
                                    <th className="pb-4 px-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {keys.map(function(key) {
                                    return (
                                        <tr key={key.id} className="border-b border-outline-variant/10 hover:bg-black/10 transition-colors">
                                            <td className="py-6 px-4 font-headline text-on-surface">{key.name}</td>
                                            <td className="py-6 px-4 font-mono text-secondary">{key.prefix}</td>
                                            <td className="py-6 px-4 text-secondary">{key.created}</td>
                                            <td className="py-6 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    key.status === 'Active' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                                                }`}>
                                                    {key.status}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                {key.status === 'Active' ? (
                                                    <button 
                                                        onClick={function() { handleRevoke(key.id); }}
                                                        className="text-error hover:underline font-label text-xs uppercase tracking-wider"
                                                    >
                                                        Revoke
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </PanelCard>
            </div>
        </main>
    );
}

export default ApiKeyManagement;
