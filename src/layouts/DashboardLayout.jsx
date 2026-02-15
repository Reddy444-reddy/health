import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';
import SearchHistory from '../components/SearchHistory';

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/auth');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/analysis', label: 'Analyze' },
        { path: '/diet', label: 'Diet' },
        { path: '/nearby', label: 'Hospitals' },
        { path: '/prevention', label: 'Prevention' },
        { path: '/chat', label: 'AI Chat' }
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            {/* Static Top Header - Simplified Structure - FORCE HORIZONTAL */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 w-full">
                <div
                    className="glass-panel w-full px-6 py-3 shadow-lg"
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap' }}
                >
                    {/* LEFT GROUP: BRANDING */}
                    <div
                        className="flex-shrink-0"
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
                                HA
                            </div>
                            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight whitespace-nowrap">
                                HealthAI
                            </span>
                        </div>
                        <div className="hidden xl:flex text-xs font-mono text-slate-500 border-l border-white/10 pl-4 whitespace-nowrap" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="opacity-50">ID:</span>
                            <span className="text-slate-400 tracking-wider">8F-2049-XQ</span>
                        </div>
                    </div>

                    {/* RIGHT GROUP: NAV + ACTIONS */}
                    <div
                        className="flex-shrink-0"
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.5rem' }}
                    >
                        {/* Navigation Links */}
                        <nav
                            className="bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/5"
                            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.25rem' }}
                        >
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] border border-cyan-500/20'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User & Logout */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                            {/* Search History */}
                            <SearchHistory />

                            <div className="hidden lg:flex flex-col items-end text-right leading-tight whitespace-nowrap">
                                <div className="text-xs text-white font-medium">Dr. Alex</div>
                                <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Premium</div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="group px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 whitespace-nowrap"
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span className="font-medium text-sm">Logout</span>
                                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pt-24 px-4 pb-8 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
