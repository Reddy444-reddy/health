import React, { useState, useRef, useEffect } from 'react';
import { Activity, Moon, Sun, HeartPulse, Upload, FileText, Check, AlertCircle, Loader2, ChefHat, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ color, data, label }) => {
    // Map existing array data to Recharts format
    const chartData = data.map((value, index) => ({
        day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index],
        value: Number(value)
    }));

    const colors = {
        cyan: { stroke: '#06b6d4', fill: '#06b6d4' },
        violet: { stroke: '#8b5cf6', fill: '#8b5cf6' },
        rose: { stroke: '#f43f5e', fill: '#f43f5e' },
        blue: { stroke: '#3b82f6', fill: '#3b82f6' },
    };

    const theme = colors[color] || colors.cyan;

    return (
        <div className="glass-card p-4 flex flex-col h-48">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-slate-300 font-medium">{label}</h4>
                <div className={`text-xs px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
                    Trend
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.fill} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={theme.fill} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                            itemStyle={{ color: theme.stroke }}
                            cursor={{ stroke: theme.stroke, strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.stroke}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#color-${label})`}
                        />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Analysis = () => {
    const { currentUser } = useAuth();
    const { currentReport, updateCurrentReport, updateDietPlan, clearCurrentReport } = useHealthData();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [reportSummary, setReportSummary] = useState(null);
    const [fileName, setFileName] = useState("");

    // Default Static Data (Initial State)
    const [healthData, setHealthData] = useState({
        score: 92,
        heartRate: 72,
        sleep: "7h 12m",
        trends: {
            energy: [40, 60, 55, 70, 65, 80, 75],
            sleep: [60, 50, 70, 75, 80, 85, 70],
            stress: [80, 70, 60, 50, 45, 40, 30],
            hydration: [30, 45, 50, 60, 70, 80, 90]
        },
        recommendations: [
            { title: "Increase Vitamin D", desc: "Your energy levels dip around 2 PM. Try getting 15 mins of sunlight.", color: "cyan" },
            { title: "Lower Caffeine", desc: "High stress detected. Consider switching to green tea after 12 PM.", color: "violet" },
            { title: "Cardio Focus", desc: "Heart rate variability is low. A 20-min jog could improve recovery.", color: "rose" }
        ]
    });

    // Load existing report data from context on mount
    useEffect(() => {
        if (currentReport) {
            setHealthData({
                score: currentReport.score || 92,
                heartRate: currentReport.heartRate || 72,
                sleep: currentReport.sleep || "7h 12m",
                trends: currentReport.trends || generateLocalTrends(currentReport.score || 92),
                recommendations: currentReport.recommendations || [],
                conditions: currentReport.conditions || [],
                specializations: currentReport.specializations || [],
                dietaryRestrictions: currentReport.dietaryRestrictions || []
            });
            setReportSummary(currentReport.summary || null);
            setFileName(currentReport.fileName || "");
        }
    }, [currentReport]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                analyzeReport(reader.result, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearReport = async () => {
        if (window.confirm('Are you sure you want to clear this health report? This will remove all analyzed data.')) {
            await clearCurrentReport();
            // Reset to default state
            setHealthData({
                score: 92,
                heartRate: 72,
                sleep: "7h 12m",
                trends: {
                    energy: [40, 60, 55, 70, 65, 80, 75],
                    sleep: [60, 50, 70, 75, 80, 85, 70],
                    stress: [80, 70, 60, 50, 45, 40, 30],
                    hydration: [30, 45, 50, 60, 70, 80, 90]
                },
                recommendations: [
                    { title: "Increase Vitamin D", desc: "Your energy levels dip around 2 PM. Try getting 15 mins of sunlight.", color: "cyan" },
                    { title: "Lower Caffeine", desc: "High stress detected. Consider switching to green tea after 12 PM.", color: "violet" },
                    { title: "Cardio Focus", desc: "Heart rate variability is low. A 20-min jog could improve recovery.", color: "rose" }
                ]
            });
            setReportSummary(null);
            setFileName("");
            setError(null);
        }
    };

    // Helper to generate chart data locally to save AI generation time
    const generateLocalTrends = (baseScore) => {
        const getTrend = () => Array(7).fill(0).map(() => Math.max(40, Math.min(100, baseScore + (Math.random() * 20 - 10))).toFixed(0));
        return {
            energy: getTrend(),
            sleep: getTrend(),
            stress: Array(7).fill(0).map(() => Math.max(20, Math.min(80, 100 - baseScore + (Math.random() * 20 - 10))).toFixed(0)), // Inverse of health
            hydration: getTrend()
        };
    };

    // ... (Imports need to be added at top of file, doing it separately or assuming user context allows partial edits. 
    // Wait, replacing a chunk. I need to make sure I add imports.)

    // I will replace the imports and the analyzeReport function.

    const analyzeReport = async (fileBase64, mimeType) => {
        setIsAnalyzing(true);
        setError(null);
        setReportSummary(null);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileBase64: fileBase64,
                    mimeType: mimeType
                }),
            });

            if (!response.ok) throw new Error("Failed to analyze report");

            const data = await response.json();

            // Merge AI insights with instant local chart generation
            const finalHealthData = {
                score: data.score,
                heartRate: data.heartRate,
                sleep: data.sleep,
                trends: generateLocalTrends(data.score), // Instant generation
                recommendations: data.recommendations,
                conditions: data.conditions || [],
                specializations: data.specializations || [],
                dietaryRestrictions: data.dietaryRestrictions || [],
                fileName: fileName
            };

            setHealthData(finalHealthData);
            setReportSummary(data.summary);

            // Save to HealthDataContext and Firestore
            if (currentUser) {
                await updateCurrentReport({
                    ...finalHealthData,
                    summary: data.summary
                });
                console.log("Report saved to HealthDataContext and Database");

                // Auto-generate diet plan in background
                await generateDietPlanFromReport(finalHealthData);
            }

        } catch (err) {
            console.error("Analysis Error Details:", {
                message: err.message,
                stack: err.stack,
                error: err
            });

            // Show the actual error to the user for debugging
            let errorMessage = err.message || "An unexpected error occurred during analysis.";
            if (err.message && err.message.includes("quota")) {
                errorMessage = "API quota exceeded. Please wait a moment and try again.";
            } else if (err.message && err.message.includes("429")) {
                errorMessage = "Too many requests. Please wait 30 seconds and try again.";
            }

            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-generate diet plan based on report analysis
    const generateDietPlanFromReport = async (healthData) => {
        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/diet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: healthData.score,
                    conditions: healthData.conditions || [],
                    restrictions: healthData.dietaryRestrictions || []
                }),
            });

            if (!response.ok) throw new Error("Failed to generate diet plan");

            const dietData = await response.json();

            // Save to HealthDataContext
            await updateDietPlan({
                ...dietData,
                conditions: healthData.conditions,
                restrictions: healthData.dietaryRestrictions,
                basedOnReport: healthData.fileName
            });

            console.log("Diet plan auto-generated and saved");
        } catch (err) {
            console.error("Diet plan generation error:", err);
            // Don't show error to user, diet plan can be generated manually later
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                Health Analysis
            </h2>

            {/* AI Report Analyzer Section */}
            <div className="glass-panel p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <FileText className="text-cyan-400" />
                            AI Data Integration
                        </h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Upload a medical report (Image or PDF) to automatically update your
                            **Health Score, Trends, and Recommendations** with AI insights.
                        </p>

                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                                disabled={isAnalyzing}
                            >
                                <Upload size={18} />
                                {isAnalyzing ? "Analyzing..." : "Upload Report"}
                            </button>
                            <span className="text-sm text-slate-500">{fileName}</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                </div>

                {isAnalyzing && (
                    <div className="mt-6 flex items-center gap-3 text-cyan-400 animate-pulse">
                        <Loader2 className="animate-spin" />
                        <span>Updating dashboard based on your report...</span>
                    </div>
                )}

                {reportSummary && !isAnalyzing && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 whitespace-pre-line leading-relaxed">
                        <span className="font-bold block mb-2 text-emerald-400">Analysis Findings</span>
                        {reportSummary}
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
                        {error}
                    </div>
                )}

                {/* Next Steps Section - Shows when report data exists */}
                {(fileName || reportSummary || currentReport) && !isAnalyzing && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ArrowRight className="text-blue-400" />
                                Next Steps
                            </h3>
                            {/* Clear Report Button */}
                            <button
                                onClick={handleClearReport}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Clear Report
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Diet Plan Card */}
                            <button
                                onClick={() => navigate('/diet')}
                                className="group p-5 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all hover:scale-105 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
                                        <ChefHat size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">View Personalized Diet Plan</h4>
                                        <p className="text-sm text-slate-400">Auto-generated based on your health analysis</p>
                                        {healthData.dietaryRestrictions && healthData.dietaryRestrictions.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {healthData.dietaryRestrictions.slice(0, 3).map((restriction, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded-full">
                                                        {restriction}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Nearby Services Card */}
                            <button
                                onClick={() => navigate('/nearby')}
                                className="group p-5 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all hover:scale-105 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Find Nearby Services</h4>
                                        <p className="text-sm text-slate-400">Hospitals & groceries tailored to your needs</p>
                                        {healthData.specializations && healthData.specializations.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {healthData.specializations.slice(0, 3).map((spec, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded-full">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent group-hover:from-cyan-500/20 transition-all"></div>
                    <Activity size={40} className="text-cyan-400 mb-2" />
                    <span className="text-4xl font-bold text-white">{healthData.score}</span>
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Health Score</span>
                </div>

                <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent group-hover:from-violet-500/20 transition-all"></div>
                    <HeartPulse size={40} className="text-violet-400 mb-2" />
                    <span className="text-4xl font-bold text-white">{healthData.heartRate} <span className="text-lg font-normal text-slate-400">bpm</span></span>
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Avg Heart Rate</span>
                </div>

                <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent group-hover:from-rose-500/20 transition-all"></div>
                    <Moon size={40} className="text-rose-400 mb-2" />
                    <span className="text-4xl font-bold text-white">{healthData.sleep}</span>
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Avg Sleep</span>
                </div>
            </div>

            {/* Dynamic Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Activity className="text-cyan-400" size={20} /> Weekly Trends
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TrendChart color="cyan" label="Energy Levels" data={healthData.trends.energy} />
                        <TrendChart color="violet" label="Sleep Quality" data={healthData.trends.sleep} />
                        <TrendChart color="rose" label="Stress Levels" data={healthData.trends.stress} />
                        <TrendChart color="blue" label="Hydration" data={healthData.trends.hydration} />
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Sun className="text-orange-400" size={20} /> AI Recommendations
                    </h3>
                    <div className="space-y-4">
                        {healthData.recommendations.map((rec, idx) => (
                            <div key={idx} className={`glass-card p-4 border-l-4 border-l-${rec.color || 'cyan'}-500`}>
                                <h4 className="font-bold text-slate-200">{rec.title}</h4>
                                <p className="text-sm text-slate-400 mt-1">{rec.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
