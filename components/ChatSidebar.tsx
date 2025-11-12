import React from 'react';
import { Invite, Connection, UserProfile, InviteStatus } from '../types';
import { Mail, Check } from './Icons';

interface ChatSidebarProps {
  receivedInvites: Invite[];
  connections: Connection[];
  currentUser: UserProfile;
  onInviteResponse: (inviteId: number, response: InviteStatus.Accepted | InviteStatus.Declined) => void;
  onSelectConnection: (connection: Connection) => void;
  onViewProfile: (user: UserProfile) => void;
}

const SidebarInviteCard: React.FC<{ invite: Invite, onAccept: () => void, onDecline: () => void, onViewProfile: (user: UserProfile) => void }> = ({ invite, onAccept, onDecline, onViewProfile }) => {
    return (
        <div className="p-2 rounded-lg hover:bg-slate-100 transition-colors group">
            <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => onViewProfile(invite.fromUser)}
            >
                <img 
                    src={invite.fromUser.vibePhotoUrl}
                    alt={invite.fromUser.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:underline">{invite.fromUser.name}</p>
                    <p className="text-xs text-slate-500 leading-tight">Sent you an invite.</p>
                </div>
            </div>
             {invite.message && (
                <div className="mt-2 text-xs bg-slate-200 p-2 rounded-md italic text-slate-700 ml-13">
                    "{invite.message.substring(0, 40)}{invite.message.length > 40 ? '...' : ''}"
                </div>
            )}
            <div className="mt-2 flex justify-end gap-2">
                <button onClick={onDecline} title="Decline" className="p-1.5 text-sm font-semibold text-slate-500 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <button onClick={onAccept} title="Accept" className="p-1.5 text-sm font-semibold text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-colors">
                    <Check />
                </button>
            </div>
        </div>
    );
};


const SidebarConnectionCard: React.FC<{ connection: Connection, currentUser: UserProfile, onSelect: () => void }> = ({ connection, currentUser, onSelect }) => {
    // FIX: Compare uid (string) instead of id (number) for type safety.
    const otherUser = connection.participant1.uid === currentUser.uid ? connection.participant2 : connection.participant1;
    const lastMessage = connection.chatHistory[connection.chatHistory.length - 1];

    return (
        <div onClick={onSelect} className="p-2 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="relative flex-shrink-0">
                <img 
                    src={otherUser.vibePhotoUrl}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
            </div>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-semibold text-sm text-slate-800 truncate">{otherUser.name}</h4>
                {lastMessage ? (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                        {/* FIX: Compare senderId with uid (string) instead of id (number). */}
                        {lastMessage.senderId === currentUser.uid ? <span className="font-semibold">You: </span> : ''}{lastMessage.text}
                    </p>
                ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">Start the conversation!</p>
                )}
            </div>
        </div>
    );
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ receivedInvites, connections, currentUser, onInviteResponse, onSelectConnection, onViewProfile }) => {
  return (
    <aside className="sticky top-24">
      <div className="bg-white rounded-xl shadow-md border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Mail /> Connections</h2>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase px-2 py-1">Invites ({receivedInvites.length})</h3>
                <div className="space-y-1 mt-1">
                    {receivedInvites.length > 0
                        ? receivedInvites.map(invite => (
                            <SidebarInviteCard
                                key={invite.id}
                                invite={invite}
                                onViewProfile={onViewProfile}
                                onAccept={() => onInviteResponse(invite.id, InviteStatus.Accepted)}
                                onDecline={() => onInviteResponse(invite.id, InviteStatus.Declined)}
                            />
                        ))
                        : <div className="text-center text-slate-400 text-xs py-4"><p>No new invites.</p></div>
                    }
                </div>
            </div>
            <div className="p-2 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase px-2 py-1">Messages ({connections.length})</h3>
                <div className="space-y-1 mt-1">
                    {connections.length > 0 && currentUser
                        ? connections.map(conn => (
                            <SidebarConnectionCard 
                                key={conn.id}
                                connection={conn}
                                currentUser={currentUser}
                                onSelect={() => onSelectConnection(conn)}
                            />
                        ))
                        : <div className="text-center text-slate-400 text-xs py-4"><p>No active conversations.</p></div>
                    }
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;