import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Utensils, ShieldCheck, MapPin, Activity, ArrowRight, FileText, TrendingUp, Heart, Upload } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';

const Home = () => {
    const navigate = useNavigate();
    const { currentReport, dietPlan, hasRecentHealthData } = useHealthData();

    const features = [
        {
            id: 'chat',
            title: 'AI Health Assistant',
            desc: 'Chat with our advanced AI for instant health advice, symptom checks, and more.',
            icon: MessageSquare,
            color: 'cyan',
            path: '/chat'
        },
        {
            id: 'diet',
            title: 'Diet Planner',
            desc: 'Get personalized meal plans based on your body metrics and goals.',
            icon: Utensils,
            color: 'emerald',
            path: '/diet'
        },
        {
            id: 'prevention',
            title: 'Disease Prevention',
            desc: 'Explore verified health tips and prevention strategies for common ailments.',
            icon: ShieldCheck,
            color: 'violet',
            path: '/prevention'
        },
        {
            id: 'nearby',
            title: 'Nearby Services',
            desc: 'Find the closest hospitals and pharmacies with live wait times.',
            icon: MapPin,
            color: 'rose',
            path: '/nearby'
        },
        {
            id: 'analysis',
            title: 'Health Analysis',
            desc: 'Track your vital trends and get AI-driven health insights.',
            icon: Activity,
            color: 'amber',
            path: '/analysis'
        }
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-8">
            {/* Health Dashboard - Only shown if user has recent health data */}
            {hasRecentHealthData() && currentReport && (
                <div className="animate-slide-up">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-cyan-400" />
                        Your Health Dashboard
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Health Score Card */}
                        <div className="glass-card p-6 border-l-4 border-l-cyan-500 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/analysis')}>
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent group-hover:from-cyan-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <Activity className="text-cyan-400" size={24} />
                                    <span className="text-xs text-slate-500">Latest</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-1">{currentReport.score}</div>
                                <div className="text-slate-400 text-sm">Health Score</div>
                            </div>
                        </div>

                        {/* Heart Rate Card */}
                        <div className="glass-card p-6 border-l-4 border-l-violet-500 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/analysis')}>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent group-hover:from-violet-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <Heart className="text-violet-400" size={24} />
                                    <span className="text-xs text-slate-500">Avg</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-1">{currentReport.heartRate}</div>
                                <div className="text-slate-400 text-sm">BPM</div>
                            </div>
                        </div>

                        {/* Sleep Card */}
                        <div className="glass-card p-6 border-l-4 border-l-rose-500 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/analysis')}>
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent group-hover:from-rose-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    <span className="text-xs text-slate-500">Avg</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-1">{currentReport.sleep}</div>
                                <div className="text-slate-400 text-sm">Sleep</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Diet Plan Quick Access */}
                        {dietPlan && (
                            <button
                                onClick={() => navigate('/diet')}
                                className="glass-card p-5 text-left hover:bg-slate-800/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Utensils size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Your Diet Plan Ready</h4>
                                        <p className="text-sm text-slate-400">{dietPlan.calories} • {dietPlan.protein} • {dietPlan.carbs}</p>
                                    </div>
                                    <ArrowRight className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>
                        )}

                        {/* Nearby Services Quick Access */}
                        {currentReport.specializations && currentReport.specializations.length > 0 && (
                            <button
                                onClick={() => navigate('/nearby')}
                                className="glass-card p-5 text-left hover:bg-slate-800/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">Find Specialized Care</h4>
                                        <p className="text-sm text-slate-400">
                                            {currentReport.specializations.slice(0, 2).join(', ')}
                                            {currentReport.specializations.length > 2 && ` +${currentReport.specializations.length - 2} more`}
                                        </p>
                                    </div>
                                    <ArrowRight className="text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Report CTA - Shown if no health data */}
            {!hasRecentHealthData() && (
                <div className="animate-slide-up bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-8 rounded-2xl text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                        <Upload className="text-blue-400" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Start Your Health Journey</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Upload your medical report to get personalized health insights, diet plans, and nearby service recommendations.
                    </p>
                    <button
                        onClick={() => navigate('/analysis')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 hover:scale-105"
                    >
                        Upload Your Report
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="text-center animate-slide-up" style={{ animationDelay: hasRecentHealthData() ? '200ms' : '0ms' }}>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 mb-4">
                    Your Health, Reimagined
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    AI-driven insights, personalized care, and real-time medical support, all in one premium dashboard.
                </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, idx) => (
                    <div
                        key={feature.id}
                        onClick={() => navigate(feature.path)}
                        className="glass-card p-6 cursor-pointer group animate-slide-up relative overflow-hidden"
                        style={{ animationDelay: `${idx * 100 + (hasRecentHealthData() ? 300 : 100)}ms` }}
                    >
                        {/* Background Glow */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${feature.color}-500/20 rounded-full blur-3xl group-hover:bg-${feature.color}-500/30 transition-colors`}></div>

                        <div className="relative z-10">
                            <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon size={28} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300">
                                {feature.desc}
                            </p>

                            <div className={`flex items-center gap-2 text-${feature.color}-400 font-medium text-sm group-hover:translate-x-2 transition-transform`}>
                                Open Feature <ArrowRight size={16} />
                            </div>
                        </div>

                        {/* Hover Stroke */}
                        <div className={`absolute inset-0 border-2 border-${feature.color}-500/0 rounded-2xl group-hover:border-${feature.color}-500/30 transition-all duration-300`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
