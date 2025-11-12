
import React, { useState, useEffect } from 'react';
import { UserProfile, AISuggestion } from '../types';
import { getAISuggestions } from '../services/geminiService';
import { Sparkles, ArrowRight } from './Icons';

interface SuggestionsProps {
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onSelectUser: (user: UserProfile) => void;
}

const SuggestionCard: React.FC<{suggestion: AISuggestion, onClick: () => void}> = ({ suggestion, onClick }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-sky-300 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between">
            <div>
                <h4 className="font-bold text-lg text-slate-800">{suggestion.name}</h4>
                <p className="mt-2 text-sm text-slate-600 italic">"{suggestion.reason}"</p>
            </div>
            <button 
                onClick={onClick}
                className="mt-4 text-sm font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 self-start"
            >
                View Profile <ArrowRight />
            </button>
        </div>
    );
};

const Suggestions: React.FC<SuggestionsProps> = ({ currentUser, allUsers, onSelectUser }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // --- Caching Logic ---
        // FIX: Use uid for cache key for consistency.
        const cacheKey = `ai_suggestions_cache_${currentUser.uid}`;
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
        setError(null);
        // FIX: Use uid to filter users.
        const otherUsers = allUsers.filter(u => u.uid !== currentUser.uid);
        const result = await getAISuggestions(currentUser, otherUsers);
        setSuggestions(result);

        // --- Save to Cache ---
        const expiry = new Date().getTime() + 3 * 24 * 60 * 60 * 1000; // 3 days
        localStorage.setItem(cacheKey, JSON.stringify({ suggestions: result, expiry }));
        // --- End Save to Cache ---

      } catch (err) {
        setError("Could not fetch AI suggestions. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.uid]); // Rerun only when user ID changes

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    // FIX: Find user by uid, as AISuggestion has uid, not id.
    const userToView = allUsers.find(u => u.uid === suggestion.uid);
    if (userToView) {
        onSelectUser(userToView);
    }
  }

  return (
    <div className="bg-sky-50/50 border border-sky-200 p-6 rounded-xl">
        <div className="flex items-center gap-3">
            <Sparkles />
            <h2 className="text-2xl font-bold text-slate-800">Weekly Suggestions</h2>
        </div>
        <p className="text-slate-600 mt-2">AI-powered recommendations to help you find meaningful connections.</p>
        
        <div className="mt-6">
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white/50 p-6 rounded-lg animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-1"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-600">{error}</p>}
            {!isLoading && !error && suggestions.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map(s => (
                        // FIX: Use uid for the key, as AISuggestion has uid, not id.
                        <SuggestionCard key={s.uid} suggestion={s} onClick={() => handleSuggestionClick(s)} />
                    ))}
                 </div>
            )}
             {!isLoading && !error && suggestions.length === 0 && (
                <p className="text-slate-500 text-center py-4">No suggestions available at the moment.</p>
             )}
        </div>
    </div>
  );
};

export default Suggestions;