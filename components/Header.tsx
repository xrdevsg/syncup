import React, { useState, useRef, useEffect } from 'react';
import { Mode, UserProfile } from '../types';
import ModeToggle from './ModeToggle';
import { LogoIcon } from './Logo';
import { Mail, UserCircle, LogOut, AssistantNavIcon } from './Icons';

type View = 'list' | 'invites' | 'chat' | 'profile' | 'assistant' | 'assistantChat';

interface HeaderProps {
  currentUser: UserProfile;
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  pendingInvitesCount: number;
  onLogout: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, selectedMode, setSelectedMode, currentView, setCurrentView, pendingInvitesCount, onLogout, onHomeClick }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    onLogout();
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={onHomeClick}
        >
          <LogoIcon />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              SyncUp
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Connect on purpose.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            {currentView === 'list' && (
                <ModeToggle selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
            )}

            <button 
                className={`relative p-2 rounded-full transition-colors ${(currentView === 'assistant' || currentView === 'assistantChat') ? 'bg-sky-100' : 'hover:bg-slate-200'}`}
                onClick={() => setCurrentView('assistant')}
                aria-label="View Assistant"
            >
                <AssistantNavIcon active={currentView === 'assistant' || currentView === 'assistantChat'} />
            </button>

            <button 
                className={`relative p-2 rounded-full transition-colors ${currentView === 'invites' ? 'bg-sky-100' : 'hover:bg-slate-200'}`}
                onClick={() => setCurrentView('invites')}
                aria-label="View Invites"
            >
                <Mail />
                {pendingInvitesCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {pendingInvitesCount}
                    </span>
                )}
            </button>

            <div className="relative" ref={profileMenuRef}>
                <button 
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors" 
                    aria-label="My Profile"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                    <UserCircle />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 z-50">
                      <div className="px-4 py-2 text-sm text-slate-700 border-b">
                          <p className="font-semibold">{currentUser.name}</p>
                          <p className="text-xs text-slate-500">Viewing as {currentUser.mode}</p>
                      </div>
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                          <UserCircle /> My Profile
                      </button>
                      <button 
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                          <LogOut /> Log Out
                      </button>
                  </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;