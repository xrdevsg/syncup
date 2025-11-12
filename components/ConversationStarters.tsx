import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getConversationStarters } from '../services/geminiService';
import { ChatBubble } from './Icons';

interface ConversationStartersProps {
    currentUser: UserProfile;
    otherUser: UserProfile;
    onSelectStarter: (starter: string) => void;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ currentUser, otherUser, onSelectStarter }) => {
    const [starters, setStarters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStarters = async () => {
            setIsLoading(true);
            const result = await getConversationStarters(currentUser, otherUser);
            setStarters(result);
            setIsLoading(false);
        };
        fetchStarters();
    }, [currentUser, otherUser]);

    if (isLoading) {
        return (
            <div className="p-4 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-500 text-center">Generating conversation starters...</p>
                <div className="mt-2 space-y-2 animate-pulse">
                    <div className="h-10 bg-slate-200 rounded-lg"></div>
                    <div className="h-10 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        );
    }
    
    if (starters.length === 0) {
        return null;
    }

    return (
        <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-3 text-center">Need an icebreaker? Try one of these:</h3>
            <div className="flex flex-col items-center gap-2">
                {starters.map((starter, index) => (
                    <button 
                        key={index}
                        onClick={() => onSelectStarter(starter)}
                        className="w-full max-w-md text-left p-3 bg-sky-50 text-sky-800 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200 flex items-start gap-3"
                    >
                       <ChatBubble />
                       <span className="flex-1 text-sm">{starter}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ConversationStarters;
