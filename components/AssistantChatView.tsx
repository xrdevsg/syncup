import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ArrowLeft, Send, SyncUpAssistantIcon } from './Icons';

const AssistantBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isAssistant = message.senderId === 'interactive-assistant';
    if (!isAssistant) return null;

    return (
        <div className="flex items-start gap-3 self-start max-w-xs md:max-w-md">
            <div className="flex-shrink-0 text-sky-600 bg-sky-100 p-2 rounded-full">
                <SyncUpAssistantIcon />
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 text-slate-800 border border-sky-200">
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
};

const UserBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    return (
        <div className="bg-sky-600 text-white self-end max-w-xs md:max-w-md p-3 rounded-2xl">
            <p className="text-sm">{message.text}</p>
        </div>
    );
};


interface AssistantChatViewProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    isTyping: boolean;
    onBack: () => void;
}

const AssistantChatView: React.FC<AssistantChatViewProps> = ({ messages, onSendMessage, isTyping, onBack }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg flex flex-col h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-lg rounded-t-xl z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200">
                    <ArrowLeft />
                </button>
                 <div className="flex-shrink-0 text-sky-600 bg-sky-100 p-2 rounded-full">
                    <SyncUpAssistantIcon />
                </div>
                <div>
                    <h2 className="font-bold text-lg">SyncUp Assistant</h2>
                    <p className="text-sm text-slate-500">Your personal AI helper</p>
                </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="flex flex-col gap-4">
                    {messages.map(message => (
                        message.senderId === 'interactive-assistant' 
                        ? <AssistantBubble key={message.id} message={message} />
                        : <UserBubble key={message.id} message={message} />
                    ))}
                    {isTyping && (
                         <div className="flex items-start gap-3 self-start max-w-xs md:max-w-md">
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
                        placeholder="Ask me to find someone, draft a message..."
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

export default AssistantChatView;