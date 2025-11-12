import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Close, Sparkles, Send, SuggestTimeIcon } from './Icons';
import { getInviteMessageSuggestion, getMeetingTimeSuggestion } from '../services/geminiService';

interface InviteModalProps {
  currentUser: UserProfile;
  targetUser: UserProfile;
  onClose: () => void;
  onSend: (message: string, suggestedTime?: string) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ currentUser, targetUser, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestingTime, setIsSuggestingTime] = useState(false);

  const handleSuggestMessage = async () => {
    setIsSuggesting(true);
    const suggestion = await getInviteMessageSuggestion(currentUser, targetUser);
    setMessage(suggestion);
    setIsSuggesting(false);
  };

  const handleSuggestTime = async () => {
      setIsSuggestingTime(true);
      const timeSuggestion = await getMeetingTimeSuggestion(currentUser, targetUser);
      setSuggestedTime(timeSuggestion);
      setIsSuggestingTime(false);
  }

  const handleSend = () => {
      onSend(message, suggestedTime);
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-slate-800/50 backdrop-blur-sm z-30 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative transition-all duration-300 transform scale-95 opacity-0 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
        
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Send Invite to <span className="text-sky-600">{targetUser.name}</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Close />
          </button>
        </div>

        <div className="p-6">
          <label htmlFor="invite-message" className="text-sm font-semibold text-slate-700 mb-2 block">
            Add a personal note (optional)
          </label>
          <textarea
            id="invite-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Start with a shared interest or goal..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          />
          
          {suggestedTime && (
              <div className="mt-2 p-3 bg-sky-50 border-l-4 border-sky-300 text-sm text-sky-800 rounded-r-lg">
                  <strong>Suggested time:</strong> "{suggestedTime}"
              </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
             <button
              onClick={handleSuggestTime}
              disabled={isSuggestingTime}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <SuggestTimeIcon /> {isSuggestingTime ? 'Thinking...' : 'Suggest a Time'}
            </button>
            <button
              onClick={handleSuggestMessage}
              disabled={isSuggesting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 font-semibold rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors disabled:opacity-50"
            >
              <Sparkles /> {isSuggesting ? 'Thinking...' : 'Suggest Message'}
            </button>
          </div>
          <div className="mt-3">
             <button
                onClick={handleSend}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
            >
                <Send /> Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;