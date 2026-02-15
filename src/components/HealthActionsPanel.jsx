import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHealthData } from '../contexts/HealthDataContext';
import { ChefHat, MapPin, ChevronRight, ChevronLeft, X, FileText } from 'lucide-react';

const HealthActionsPanel = () => {
    const navigate = useNavigate();
    const { currentReport, dietPlan, hasRecentHealthData } = useHealthData();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    // Don't show if no health data
    if (!hasRecentHealthData() || !currentReport) {
        return null;
    }

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed right-4 bottom-4 z-40 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
                title="Show Health Actions"
            >
                <FileText size={20} />
            </button>
        );
    }

    return (
        <div className={`fixed right-0 top-20 z-40 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-16'}`}>
            <div className="h-full bg-slate-900/95 border-l border-slate-700 shadow-2xl backdrop-blur-sm">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {isExpanded && (
                        <h3 className="font-bold text-white text-sm">Quick Actions</h3>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                        {isExpanded && (
                            <button
                                onClick={() => setIsVisible(false)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isExpanded && (
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {/* Current Report Info */}
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                            <div className="text-xs text-slate-500 mb-2">Latest Report</div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">Score: {currentReport.score}</div>
                                    <div className="text-xs text-slate-400">{currentReport.fileName || 'Medical Report'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Health Conditions */}
                        {currentReport.conditions && currentReport.conditions.length > 0 && (
                            <div>
                                <div className="text-xs text-slate-500 mb-2">Conditions</div>
                                <div className="flex flex-wrap gap-1">
                                    {currentReport.conditions.map((condition, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 bg-rose-500/10 text-rose-300 rounded-full border border-rose-500/20">
                                            {condition}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* View Full Analysis */}
                            <button
                                onClick={() => navigate('/analysis')}
                                className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Full Analysis</div>
                                        <div className="text-xs text-slate-400">View complete report</div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </div>
                            </button>

                            {/* Diet Plan */}
                            <button
                                onClick={() => navigate('/diet')}
                                className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <ChefHat size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Diet Plan</div>
                                        <div className="text-xs text-slate-400">
                                            {dietPlan ? 'View your plan' : 'Generate plan'}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </div>
                            </button>

                            {/* Nearby Services */}
                            <button
                                onClick={() => navigate('/nearby')}
                                className="w-full p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Nearby Services</div>
                                        <div className="text-xs text-slate-400">
                                            {currentReport.specializations && currentReport.specializations.length > 0
                                                ? `${currentReport.specializations.length} specialization${currentReport.specializations.length > 1 ? 's' : ''}`
                                                : 'Find services'}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-rose-400 transition-colors" />
                                </div>
                            </button>
                        </div>

                        {/* Specializations */}
                        {currentReport.specializations && currentReport.specializations.length > 0 && (
                            <div>
                                <div className="text-xs text-slate-500 mb-2">Recommended Specialists</div>
                                <div className="flex flex-wrap gap-1">
                                    {currentReport.specializations.map((spec, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthActionsPanel;
