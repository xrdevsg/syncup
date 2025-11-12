import React, { useState, useEffect } from 'react';
import { Connection, SchedulingSuggestion, UserProfile } from '../types';
import { getSchedulingSuggestions } from '../services/geminiService';
import { AssistantNavIcon, ChatBubble } from './Icons';

interface AssistantViewProps {
    currentUser: UserProfile;
    connections: Connection[];
    onSchedule: (connectionId: number) => void;
    onStartChat: () => void;
}

const SuggestionCard: React.FC<{ suggestion: SchedulingSuggestion, onSchedule: (id: number) => void }> = ({ suggestion, onSchedule }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <p className="text-slate-600">
                    <span className="font-bold text-slate-800">{suggestion.participantName}</span>
                    <span className="text-slate-500"> — </span>
                    <span className="italic">"{suggestion.reason}"</span>
                </p>
            </div>
            <button
                onClick={() => onSchedule(suggestion.connectionId)}
                className="bg-sky-600 text-white font-bold py-2 px-5 rounded-full hover:bg-sky-700 transition-colors shadow-sm whitespace-nowrap"
            >
                Help Schedule
            </button>
        </div>
    );
};


const AssistantView: React.FC<AssistantViewProps> = ({ currentUser, connections, onSchedule, onStartChat }) => {
    const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            // --- Caching Logic ---
            const cacheKey = `ai_scheduling_cache_${currentUser.id}`;
            const cachedItem = localStorage.getItem(cacheKey);

            if (cachedItem) {
                const cachedData = JSON.parse(cachedItem);
                if (new Date().getTime() < cachedData.expiry) {
                    setSuggestions(cachedData.suggestions);
                    setIsLoading(false);
                    return; // Use cached data
                }
            }
            // --- End Caching Logic ---

            setIsLoading(true);
            const result = await getSchedulingSuggestions(connections, currentUser);
            setSuggestions(result);

            // --- Save to Cache ---
            const expiry = new Date().getTime() + 1 * 60 * 60 * 1000; // 1 hour
            localStorage.setItem(cacheKey, JSON.stringify({ suggestions: result, expiry }));
            // --- End Save to Cache ---

            setIsLoading(false);
        };
        fetchSuggestions();
    }, [connections, currentUser]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center bg-sky-100 rounded-full p-4 mb-4">
                    <AssistantNavIcon active />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">SyncUp Assistant</h1>
                <p className="mt-2 text-lg text-slate-600">Your personal AI helper. I can find people, draft messages, and schedule meetings.</p>
                 <button
                    onClick={onStartChat}
                    className="mt-6 inline-flex items-center justify-center gap-3 bg-sky-600 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    <ChatBubble /> Start a Conversation
                </button>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Follow-ups</h2>
                
                {isLoading && (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(2)].map((_, i) => (
                             <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                <div className="h-10 bg-slate-200 rounded-full w-32"></div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && suggestions.length > 0 && (
                     <div className="space-y-4">
                        {suggestions.map(suggestion => (
                            <SuggestionCard 
                                key={suggestion.connectionId} 
                                suggestion={suggestion}
                                onSchedule={onSchedule}
                            />
                        ))}
                     </div>
                )}

                {!isLoading && suggestions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-slate-500">Looks like you're all caught up!</p>
                        <p className="text-sm text-slate-400 mt-1">I'll let you know if I spot any new scheduling opportunities.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssistantView;