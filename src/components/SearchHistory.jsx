import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../contexts/SearchHistoryContext';
import { History, X, Trash2, MessageSquare, Utensils, MapPin, ShieldCheck, Clock } from 'lucide-react';

const SearchHistory = () => {
    const navigate = useNavigate();
    const { searchHistory, clearHistory, deleteSearch } = useSearchHistory();
    const [isOpen, setIsOpen] = useState(false);

    const getIconForPage = (page) => {
        switch (page) {
            case 'chat':
                return <MessageSquare size={14} />;
            case 'diet':
                return <Utensils size={14} />;
            case 'nearby':
                return <MapPin size={14} />;
            case 'prevention':
                return <ShieldCheck size={14} />;
            default:
                return <History size={14} />;
        }
    };

    const getColorForPage = (page) => {
        switch (page) {
            case 'chat':
                return 'cyan';
            case 'diet':
                return 'emerald';
            case 'nearby':
                return 'rose';
            case 'prevention':
                return 'violet';
            default:
                return 'slate';
        }
    };

    const handleSearchClick = (search) => {
        // Navigate to the page and trigger the search
        if (search.page === 'chat') {
            navigate('/chat', { state: { query: search.query } });
        } else if (search.page === 'diet') {
            navigate('/diet', { state: { formData: search.data } });
        } else if (search.page === 'nearby') {
            navigate('/nearby', { state: { searchQuery: search.query } });
        } else if (search.page === 'prevention') {
            navigate('/prevention', { state: { searchQuery: search.query } });
        }
        setIsOpen(false);
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* History Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Search History"
            >
                <History size={20} />
                {searchHistory.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full text-xs text-white flex items-center justify-center">
                        {searchHistory.length > 9 ? '9+' : searchHistory.length}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="text-cyan-400" size={20} />
                                <h3 className="font-bold text-white">Search History</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {searchHistory.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Clear all search history?')) {
                                                clearHistory();
                                            }
                                        }}
                                        className="px-3 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[400px]">
                            {searchHistory.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <History size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No search history yet</p>
                                    <p className="text-xs mt-1">Your searches will appear here</p>
                                </div>
                            ) : (
                                <div className="p-2">
                                    {searchHistory.map((search) => {
                                        const color = getColorForPage(search.page);
                                        return (
                                            <div
                                                key={search.id}
                                                className="group p-3 hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer relative"
                                            >
                                                <div
                                                    onClick={() => handleSearchClick(search)}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center text-${color}-400 flex-shrink-0`}>
                                                        {getIconForPage(search.page)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-white font-medium truncate">
                                                            {search.query || search.title || 'Search'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 bg-${color}-500/10 text-${color}-400 rounded-full capitalize`}>
                                                                {search.page}
                                                            </span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {formatTime(search.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteSearch(search.id);
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-slate-800 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchHistory;
