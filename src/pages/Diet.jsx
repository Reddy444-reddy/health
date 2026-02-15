import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, Check, FileText, Sparkles } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useSearchHistory } from '../contexts/SearchHistoryContext';

const Diet = () => {
    const { dietPlan, currentReport, hasRecentHealthData } = useHealthData();
    const { addSearch } = useSearchHistory();
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        height: '',
        goal: 'lose'
    });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load auto-generated diet plan from context on mount
    useEffect(() => {
        if (dietPlan && dietPlan.meals) {
            setPlan(dietPlan);
        }
    }, [dietPlan]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/diet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: currentReport?.score || 90, // Fallback if no report
                    conditions: currentReport?.conditions || [],
                    restrictions: currentReport?.dietaryRestrictions || []
                }),
            });

            if (!response.ok) throw new Error("Failed to generate diet plan");

            const data = await response.json();

            setPlan(data);

            // Track in search history
            await addSearch({
                query: `Diet Plan: ${formData.goal} (Age: ${formData.age}, Weight: ${formData.weight}kg)`,
                page: 'diet',
                title: 'Diet Plan Generated',
                data: formData
            });
        } catch (error) {
            console.error("Diet plan generation error:", error);
            // Fallback to mock data
            setPlan({
                calories: "2200 kcal",
                protein: "140g",
                carbs: "200g",
                fats: "70g",
                meals: [
                    { name: "Breakfast", items: ["Oatmeal with berries", "2 Boiled Eggs", "Green Tea"] },
                    { name: "Lunch", items: ["Grilled Chicken Breast", "Quinoa Salad", "Avocado"] },
                    { name: "Snack", items: ["Greek Yogurt", "Almonds"] },
                    { name: "Dinner", items: ["Baked Salmon", "Steamed Broccoli", "Sweet Potato"] }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col lg:flex-row gap-8 min-h-[80vh]">
            {/* Input Section */}
            <div className="flex-1">
                <div className="glass-panel p-8 sticky top-4">
                    <div className="flex items-center gap-3 mb-6 text-cyan-400">
                        <ChefHat size={32} />
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                            Diet Planner
                        </h2>
                    </div>

                    {/* Health Report Banner */}
                    {hasRecentHealthData() && currentReport && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Sparkles className="text-purple-400" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-purple-300 mb-1">Health-Optimized Plan</h4>
                                    <p className="text-sm text-slate-400">
                                        {dietPlan && dietPlan.basedOnReport
                                            ? `Based on your ${dietPlan.basedOnReport} analysis`
                                            : "Personalized for your health conditions"}
                                    </p>
                                    {currentReport.conditions && currentReport.conditions.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {currentReport.conditions.map((condition, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded-full">
                                                    {condition}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Age</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Weight (kg)</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Height (cm)</label>
                            <input
                                type="number"
                                required
                                className="input-field"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Goal</label>
                            <select
                                className="input-field bg-slate-900"
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            >
                                <option value="lose">Weight Loss</option>
                                <option value="maintain">Maintenance</option>
                                <option value="gain">Muscle Gain</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Generating Plan...' : 'Generate AI Plan'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Result Section */}
            <div className="flex-[1.5]">
                {plan ? (
                    <div className="space-y-6 animate-fade-in">
                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-4">
                            {['calories', 'protein', 'carbs', 'fats'].map((macro) => (
                                <div key={macro} className="glass-card p-4 text-center">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{macro}</div>
                                    <div className="text-xl font-bold text-white">{plan[macro]}</div>
                                </div>
                            ))}
                        </div>

                        {/* Meals */}
                        <div className="space-y-4">
                            {plan.meals.map((meal, index) => (
                                <div key={index} className="glass-panel p-6 border-l-4 border-cyan-500" style={{ animationDelay: `${index * 100}ms` }}>
                                    <h3 className="text-lg font-bold text-slate-200 mb-3">{meal.name}</h3>
                                    <ul className="space-y-2">
                                        {meal.items.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-400">
                                                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                                                    <Check size={12} />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center glass-card p-12 border-dashed border-2 border-slate-700 bg-transparent">
                        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 text-slate-600">
                            <ChefHat size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-500">Your plan will appear here</h3>
                        <p className="text-slate-600 mt-2 text-center max-w-xs">
                            Fill out your details to get a personalized meal plan customized by AI.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Diet;
