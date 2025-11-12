import React, { useState } from 'react';
import { Goal } from './Icons';

interface OnboardingModalProps {
    userName: string;
    goalOptions: string[];
    onComplete: (selectedGoals: string[]) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userName, goalOptions, onComplete }) => {
    const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
    const MAX_GOALS = 2;

    const handleGoalToggle = (goal: string) => {
        const newSelection = new Set(selectedGoals);
        if (newSelection.has(goal)) {
            newSelection.delete(goal);
        } else {
            if (newSelection.size < MAX_GOALS) {
                newSelection.add(goal);
            }
        }
        setSelectedGoals(newSelection);
    };

    return (
        <div className="fixed inset-0 bg-slate-800/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transition-all duration-300 transform opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up { animation: fade-in-up 0.4s forwards cubic-bezier(0.16, 1, 0.3, 1); }
                `}</style>
                <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome to SyncUp, {userName}!</h1>
                    <p className="mt-2 text-slate-600">To help us find the right connections for you, please select your primary goals.</p>
                </div>
                <div className="p-8 border-t border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">What are you here for? (Select up to {MAX_GOALS})</h2>
                    <div className="space-y-3">
                        {goalOptions.map(goal => {
                            const isSelected = selectedGoals.has(goal);
                            return (
                                <button
                                    key={goal}
                                    onClick={() => handleGoalToggle(goal)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${isSelected ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200' : 'bg-white border-slate-200 hover:border-slate-400'}`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-sky-500' : 'bg-slate-200'}`}>
                                        {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-sky-800' : 'text-slate-700'}`}>{goal}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-b-xl text-right">
                    <button
                        onClick={() => onComplete(Array.from(selectedGoals))}
                        disabled={selectedGoals.size === 0}
                        className="bg-sky-600 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;