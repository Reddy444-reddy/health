import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertTriangle, Activity, Loader2, Sparkles } from 'lucide-react';
import { useSearchHistory } from '../contexts/SearchHistoryContext';

const Prevention = () => {
    const { addSearch } = useSearchHistory();
    const [searchTerm, setSearchTerm] = useState('');
    const [aiTips, setAiTips] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const tips = [
        {
            id: 1,
            title: "Common Cold Prevention",
            source: "Mayo Clinic",
            type: "Viral",
            content: "Wash your hands frequently, avoid close contact with sick individuals, and boost your immune system with Vitamin C and Zinc.",
            icon: ShieldAlert,
            color: "cyan"
        },
        {
            id: 2,
            title: "Heart Disease Risks",
            source: "World Health Organization",
            type: "Chronic",
            content: "Maintain a healthy diet low in salt and saturated fats. engage in at least 150 minutes of moderate aerobic activity per week.",
            icon: Activity,
            color: "rose"
        },
        {
            id: 3,
            title: "Diabetes Management",
            source: "American Diabetes Association",
            type: "Chronic",
            content: "Monitor blood sugar levels regularly, eat fiber-rich foods, and avoid sugary drinks. Regular check-ups are essential.",
            icon: AlertTriangle,
            color: "orange"
        },
        {
            id: 4,
            title: "Seasonal Allergies",
            source: "Medical News Today",
            type: "Environmental",
            content: "Keep windows closed during high pollen times, use air purifiers, and shower after being outdoors to remove pollen from skin.",
            icon: CheckCircle,
            color: "violet"
        }
    ];

    const filteredTips = tips.filter(tip =>
        tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Auto-trigger AI search with debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim() && filteredTips.length === 0 && aiTips.length === 0 && !isLoading) {
                handleAskAI();
            }
        }, 1200); // 1.2s delay to allow typing to finish

        return () => clearTimeout(timer);
    }, [searchTerm, filteredTips.length]); // Dependencies: search term or local results changing

    const handleAskAI = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        // Don't clear AI tips immediately to avoid flickering if re-fetching? 
        // Actually for a new search we should clear.
        // But the useEffect clears it via setAiTips([]) in onChange previously?
        // Let's check onChange handler.
        // It does: setAiTips([]).

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/prevention`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm: searchTerm
                }),
            });

            if (!response.ok) throw new Error("Failed to get prevention tips");

            const aiData = await response.json();

            // Add icons and colors to AI data
            const enhancedData = aiData.map((tip, idx) => ({
                ...tip,
                id: `ai-${Date.now()}-${idx}`,
                icon: Sparkles,
                color: "indigo"
            }));

            setAiTips(enhancedData);

            // Track search in history
            await addSearch({
                query: searchTerm,
                page: 'prevention',
                title: `Prevention: ${searchTerm}`
            });
        } catch (err) {
            console.error("AI Error:", err);
            // Don't show error for auto-search, just fail silently or show small text
            // setError("Could not fetch AI tips.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-4">
                    Disease Prevention
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Verified tips and health advice from trusted global medical sources.
                </p>

                <div className="mt-8 relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for symptoms, diseases, or prevention tips..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setAiTips([]); // Clear AI tips on new search
                            setError(null);
                        }}
                        className="w-full glass-card pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-cyan-500 transition-all rounded-xl"
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {/* Local Results */}
                {filteredTips.map(tip => (
                    <div key={tip.id} className="glass-panel p-6 flex gap-4 hover:bg-white/5 transition-colors group">
                        <div className={`w-12 h-12 rounded-xl bg-${tip.color}-500/20 flex items-center justify-center text-${tip.color}-400 shrink-0 group-hover:scale-110 transition-transform`}>
                            <tip.icon size={24} />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-100">{tip.title}</h3>
                                <span className="text-xs font-semibold text-slate-500 border border-slate-700 px-2 py-1 rounded">
                                    {tip.type}
                                </span>
                            </div>

                            <p className="text-slate-400 mb-4 leading-relaxed">
                                {tip.content}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Source: {tip.source}
                            </div>
                        </div>
                    </div>
                ))}

                {/* AI Results */}
                {aiTips.map(tip => (
                    <div key={tip.id} className="glass-panel p-6 flex gap-4 hover:bg-white/5 transition-colors group border border-indigo-500/30">
                        <div className={`w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform`}>
                            <Sparkles size={24} />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-100">{tip.title}</h3>
                                <span className="text-xs font-semibold text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/10">
                                    AI Generated • {tip.type}
                                </span>
                            </div>

                            <p className="text-slate-300 mb-4 leading-relaxed whitespace-pre-line">
                                {tip.content}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                Source: {tip.source}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-cyan-400" size={32} />
                        <p className="text-slate-400 animate-pulse">
                            AI is finding verified tips for "{searchTerm}"...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-400 py-8">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prevention;
