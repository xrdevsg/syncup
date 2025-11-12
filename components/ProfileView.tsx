import React from 'react';
import { UserProfile } from '../types';
import Tag from './Tag';
import { LocationPin, Calendar, Goal, Quote, ChatAlt, Mail, KudosIcon } from './Icons';

interface ProfileViewProps {
  user: UserProfile;
  onInvite: (user: UserProfile) => void;
  onStartChat: (user: UserProfile) => void;
  // FIX: Changed userId type from number to string to match UserProfile.uid
  onGiveKudos: (userId: string) => void;
  isInviteSent: boolean;
  isConnected: boolean;
  hasBeenInvited: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onInvite, onStartChat, onGiveKudos, isInviteSent, isConnected, hasBeenInvited }) => {
  const getButtonState = () => {
      if (isConnected) {
          return { text: 'Open Chat', disabled: false, action: () => onStartChat(user), icon: <ChatAlt /> };
      }
      if (hasBeenInvited) {
        return { text: 'Respond to Invite', disabled: true, action: () => {}, icon: <Mail /> };
      }
      if (isInviteSent) {
          return { text: 'Invite Sent', disabled: true, action: () => {}, icon: null };
      }
      return { text: 'Send Connection Invite', disabled: false, action: () => onInvite(user), icon: null };
  }

  const buttonState = getButtonState();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img className="h-64 w-full object-cover md:w-64" src={user.vibePhotoUrl} alt={`Vibe photo of ${user.name}`} />
        </div>
        <div className="p-8 flex-grow">
          <div className="flex justify-between items-start">
            <div>
                <p className="uppercase tracking-wide text-sm text-sky-600 font-bold">{user.mode} Mode</p>
                <p className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-1 rounded-full inline-block mt-1">{user.role}</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <KudosIcon />
                    <span className="text-2xl font-bold text-slate-800">{user.kudos}</span>
                </div>
                <p className="text-xs text-slate-500">Kudos</p>
            </div>
          </div>
          <h1 className="block mt-1 text-4xl leading-tight font-extrabold text-black">{user.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <LocationPin /> <span>{user.location}</span>
          </div>
           <div className="mt-2 flex items-center gap-2 text-slate-500">
            <Calendar /> <span>{user.availability}</span>
          </div>
          
          <p className="mt-6 text-slate-700">{user.intro}</p>
          
          {user.presenceUpdate && (
             <div className="mt-6 p-4 bg-sky-50 rounded-lg italic border-l-4 border-sky-200">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-sky-500"><Quote /></div>
                    <p className="text-slate-600">"{user.presenceUpdate}"</p>
                </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Interests & Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {user.tags.map(tag => (
                        <Tag key={tag} text={tag} />
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Looking for...</h3>
                <ul className="space-y-2">
                {user.goals.map(goal => (
                    <li key={goal} className="flex items-center gap-3 text-slate-600">
                        <Goal />
                        <span>{goal}</span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
         <div className="mt-8 text-center flex items-center justify-center gap-4">
            <button 
              onClick={buttonState.action}
              disabled={buttonState.disabled}
              className="inline-flex items-center justify-center gap-3 bg-sky-600 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {buttonState.icon}
              {buttonState.text}
            </button>
            {isConnected && (
                <button
                    // FIX: Pass user.uid (string) instead of user.id (number)
                    onClick={() => onGiveKudos(user.uid)}
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-full hover:bg-yellow-500 transition-colors shadow-md hover:shadow-lg"
                    title={`Give kudos to ${user.name}`}
                >
                    <KudosIcon /> Give Kudos
                </button>
            )}
         </div>
         <div className="mt-6 text-center text-xs text-slate-400 space-x-4">
            <button onClick={() => alert(`Blocking ${user.name}. This will prevent them from seeing your profile or contacting you.`)} className="hover:text-slate-600 hover:underline">Block User</button>
            <button onClick={() => alert(`Thank you for your report. A moderator will review ${user.name}'s profile.`)} className="hover:text-slate-600 hover:underline">Report Profile</button>
         </div>
      </div>
    </div>
  );
};

export default ProfileView;