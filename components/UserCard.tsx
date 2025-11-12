import React from 'react';
import { UserProfile } from '../types';
import Tag from './Tag';
import { LocationPin, Calendar, StatusConnected, StatusInviteReceived, StatusInviteSent } from './Icons';
import { ConnectionStatus } from '../App';

interface UserCardProps {
  user: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  status: ConnectionStatus;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelectUser, status }) => {

  const StatusOverlay: React.FC = () => {
    if (status === 'none') {
      return null;
    }

    let overlayContent = {
        text: '',
        icon: null as React.ReactNode,
        bgColor: '',
    };

    switch (status) {
        case 'connected':
            overlayContent = { text: 'Connected', icon: <StatusConnected />, bgColor: 'bg-green-600/75' };
            break;
        case 'received':
            overlayContent = { text: 'New Invite', icon: <StatusInviteReceived />, bgColor: 'bg-sky-500/80' };
            break;
        case 'sent':
            overlayContent = { text: 'Invite Sent', icon: <StatusInviteSent />, bgColor: 'bg-slate-700/75' };
            break;
    }

    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-white font-bold p-4 text-center ${overlayContent.bgColor} rounded-t-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100`}>
            {overlayContent.icon}
            <span className="text-lg tracking-wide">{overlayContent.text}</span>
        </div>
    );
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col group"
      onClick={() => onSelectUser(user)}
    >
      <div className="relative">
        <img className="h-48 w-full object-cover" src={user.vibePhotoUrl} alt={`Vibe photo from ${user.name}`} />
        <StatusOverlay />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center">
            <p className="tracking-wide text-sm text-sky-600 font-semibold">{user.mode}</p>
            <p className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{user.role}</p>
        </div>
        <h3 className="block mt-1 text-xl leading-tight font-bold text-black">{user.name}</h3>
        <p className="mt-2 text-slate-600 text-sm flex-grow">{user.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.tags.slice(0, 3).map(tag => (
            <Tag key={tag} text={tag} />
          ))}
          {user.tags.length > 3 && <Tag text={`+${user.tags.length - 3}`} />}
        </div>
      </div>
       <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <LocationPin />
            <span>{user.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar />
            <span>{user.availability}</span>
          </div>
        </div>
    </div>
  );
};

export default UserCard;