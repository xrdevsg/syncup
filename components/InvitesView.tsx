import React from 'react';
// FIX: Import InviteStatus enum to pass correct values to onInviteResponse.
import { Invite, Connection, UserProfile, InviteStatus } from '../types';
import { Users } from './Icons';

interface InvitesViewProps {
  receivedInvites: Invite[];
  connections: Connection[];
  // FIX: Update prop type to use InviteStatus enum.
  onInviteResponse: (inviteId: number, response: InviteStatus.Accepted | InviteStatus.Declined) => void;
  onSelectConnection: (connection: Connection) => void;
  onViewProfile: (user: UserProfile) => void;
}

const InviteCard: React.FC<{ invite: Invite, onAccept: () => void, onDecline: () => void, onViewProfile: (user: UserProfile) => void }> = ({ invite, onAccept, onDecline, onViewProfile }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div 
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => onViewProfile(invite.fromUser)}
            >
                <img 
                    src={invite.fromUser.vibePhotoUrl}
                    alt={invite.fromUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 hover:underline">{invite.fromUser.name}</h4>
                    <p className="text-sm text-slate-500">{invite.fromUser.intro.substring(0, 60)}...</p>
                    {invite.message && (
                        <div className="mt-2 text-sm bg-slate-100 p-3 rounded-md italic text-slate-600">
                            "{invite.message}"
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
                <button onClick={onDecline} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">
                    Decline
                </button>
                <button onClick={onAccept} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors">
                    Accept
                </button>
            </div>
        </div>
    );
};

const ConnectionCard: React.FC<{ connection: Connection, currentUser: UserProfile, onSelect: () => void }> = ({ connection, currentUser, onSelect }) => {
    // FIX: Compare uid (string) instead of id (number) for type safety.
    const otherUser = connection.participant1.uid === currentUser.uid ? connection.participant2 : connection.participant1;
    const lastMessage = connection.chatHistory[connection.chatHistory.length - 1];

    return (
        <div onClick={onSelect} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <img 
                src={otherUser.vibePhotoUrl}
                alt={otherUser.name}
                className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
                <h4 className="font-bold text-slate-800">{otherUser.name}</h4>
                {lastMessage && (
                    <p className="text-sm text-slate-500 mt-1">
                        {/* FIX: Compare senderId with uid (string) instead of id (number). */}
                        {lastMessage.senderId === currentUser.uid ? 'You: ' : ''}{lastMessage.text.substring(0, 50)}...
                    </p>
                )}
            </div>
        </div>
    );
}

const InvitesView: React.FC<InvitesViewProps> = ({ receivedInvites, connections, onInviteResponse, onSelectConnection, onViewProfile }) => {
  // A bit of a hack to get the current user from the connections list
  const currentUser = connections.length > 0 ? (receivedInvites[0]?.toUser || connections[0].participant1) : receivedInvites[0]?.toUser;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Connections</h1>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Pending Invites ({receivedInvites.length})</h2>
        <div className="space-y-4">
          {receivedInvites.length > 0
            ? receivedInvites.map(invite => (
                <InviteCard
                  key={invite.id}
                  invite={invite}
                  onViewProfile={onViewProfile}
                  // FIX: Use InviteStatus enum members for type safety.
                  onAccept={() => onInviteResponse(invite.id, InviteStatus.Accepted)}
                  onDecline={() => onInviteResponse(invite.id, InviteStatus.Declined)}
                />
              ))
            : <div className="text-center text-slate-500 py-8 bg-white rounded-lg border border-dashed"><p>No new invites.</p></div>
          }
        </div>
      </div>
      
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-4">
            <Users />
            <h2 className="text-xl font-semibold text-slate-800">Messages ({connections.length})</h2>
        </div>
        <div className="space-y-4">
            {connections.length > 0 && currentUser
            ? connections.map(conn => (
                <ConnectionCard 
                    key={conn.id}
                    connection={conn}
                    currentUser={currentUser}
                    onSelect={() => onSelectConnection(conn)}
                />
              ))
            : <div className="text-center text-slate-500 py-8 bg-white rounded-lg border border-dashed"><p>Accepted invites will appear here.</p></div>
          }
        </div>
      </div>
    </div>
  );
};

export default InvitesView;