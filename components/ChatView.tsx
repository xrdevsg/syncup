import React, { useState, useRef, useEffect } from 'react';
import { Connection, UserProfile, ChatMessage } from '../types';
import { ArrowLeft, Calendar, Send, SyncUpAssistantIcon } from './Icons';
import ConversationStarters from './ConversationStarters';

const ChatBubble: React.FC<{ message: ChatMessage; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
    const isAssistant = message.senderId === 'assistant';

    if (isAssistant) {
        return (
            <div className="flex items-start gap-3 self-start max-w-xs md:max-w-md">
                <div className="flex-shrink-0 text-sky-600 bg-sky-100 p-2 rounded-full">
                    <SyncUpAssistantIcon />
                </div>
                <div className="p-3 rounded-2xl bg-sky-50 text-slate-800 border border-sky-200">
                    <p className="text-sm font-medium text-sky-800">SyncUp Assistant</p>
                    <p className="text-sm mt-1">{message.text}</p>
                </div>
            </div>
        );
    }
    
    const bubbleClasses = isCurrentUser
        ? 'bg-sky-600 text-white self-end'
        : 'bg-slate-200 text-slate-800 self-start';
    
    return (
        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${bubbleClasses}`}>
            <p className="text-sm">{message.text}</p>
            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-sky-200' : 'text-slate-500'} text-right`}>{message.timestamp}</p>
        </div>
    );
};


interface ChatViewProps {
    connection: Connection;
    currentUser: UserProfile;
    onBack: () => void;
    onSendMessage: (text: string) => void;
    isAssistantTyping: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ connection, currentUser, onBack, onSendMessage, isAssistantTyping }) => {
    const [newMessage, setNewMessage] = useState('');
    // FIX: Compare uid (string) instead of id (number) for type safety.
    const otherUser = connection.participant1.uid === currentUser.uid ? connection.participant2 : connection.participant1;
    const chatEndRef = useRef<HTMLDivElement>(null);

    const showStarters = connection.chatHistory.length < 3;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [connection.chatHistory, isAssistantTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    const handleBookMeetingClick = () => {
        const message = "Let's find a time to connect!";
        setNewMessage(message);
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg flex flex-col h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-lg rounded-t-xl z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200">
                    <ArrowLeft />
                </button>
                <img src={otherUser.vibePhotoUrl} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover"/>
                <div>
                    <h2 className="font-bold text-lg">{otherUser.name}</h2>
                    <p className="text-sm text-slate-500">Connected</p>
                </div>
                <div className="flex-grow text-right">
                    <button 
                        onClick={handleBookMeetingClick}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors"
                    >
                       <Calendar /> Book a Meeting
                    </button>
                </div>
            </div>
            
            {showStarters && (
                <ConversationStarters
                    currentUser={currentUser}
                    otherUser={otherUser}
                    onSelectStarter={setNewMessage}
                />
            )}

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="flex flex-col gap-4">
                    {connection.chatHistory.map(message => (
                        <ChatBubble 
                            key={message.id}
                            message={message}
                            // FIX: Compare senderId with uid (string) instead of id (number).
                            isCurrentUser={message.senderId === currentUser.uid}
                        />
                    ))}
                    {isAssistantTyping && (
                         <div className="flex items-center gap-3 self-start max-w-xs md:max-w-md">
                            <div className="flex-shrink-0 text-sky-600 bg-sky-100 p-2 rounded-full">
                                <SyncUpAssistantIcon />
                            </div>
                            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center gap-2">
                                <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 w-full p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                    />
                    <button type="submit" className="bg-sky-600 text-white rounded-full p-3 hover:bg-sky-700 transition-colors shadow-sm disabled:bg-slate-400" disabled={!newMessage.trim()}>
                        <Send />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;