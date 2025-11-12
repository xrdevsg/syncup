import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Mode, Invite, Connection, ChatMessage, InviteStatus } from './types';
import { MOCK_USERS, MOCK_INVITES, MOCK_CONNECTIONS, GOAL_OPTIONS } from './constants';
import Header from './components/Header';
import UserCard from './components/UserCard';
import Suggestions from './components/Suggestions';
import { ArrowLeft } from './components/Icons';
import ProfileView from './components/ProfileView';
import InviteModal from './components/InviteModal';
import InvitesView from './components/InvitesView';
import LoginScreen from './components/LoginScreen';
import OnboardingModal from './components/OnboardingModal';
import ChatView from './components/ChatView';
import AssistantView from './components/AssistantView';
import AssistantChatView from './components/AssistantChatView';
import ChatSidebar from './components/ChatSidebar';
import { getAssistantResponse, getInteractiveAssistantResponse } from './services/geminiService';
import { auth } from './services/firebase';
import { getUserProfile } from './services/firestoreService';

type View = 'list' | 'invites' | 'chat' | 'profile' | 'assistant' | 'assistantChat';
export type ConnectionStatus = 'none' | 'connected' | 'received' | 'sent';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [invites, setInvites] = useState<Invite[]>(MOCK_INVITES);
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);
  
  const [selectedMode, setSelectedMode] = useState<Mode>(Mode.Both);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [previousView, setPreviousView] = useState<View>('list');
  const [activeChatConnection, setActiveChatConnection] = useState<Connection | null>(null);

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitingUser, setInvitingUser] = useState<UserProfile | null>(null);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const [assistantChatHistory, setAssistantChatHistory] = useState<ChatMessage[]>([]);
  const [isInteractiveAssistantTyping, setIsInteractiveAssistantTyping] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      try {
        if (user) {
          console.log("User detected:", user.uid);
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            console.log("User profile found:", userProfile);
            setCurrentUser(userProfile);
            const hasOnboarded = localStorage.getItem(`onboarded_${user.uid}`);
            if (!hasOnboarded) {
                setShowOnboarding(true);
            }
          } else {
              console.log("No user profile found, treating as logged out");
              // This case might happen if profile creation fails after signup.
              // For now, we treat them as logged out.
              setCurrentUser(null);
          }
        } else {
          console.log("No user logged in");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const handleOnboardingComplete = (selectedGoals: string[]) => {
    if (!currentUser) return;
    // In a real app, we'd update this in Firestore.
    // For now, we just update the local state.
    const updatedUser = { ...currentUser, goals: selectedGoals };
    setCurrentUser(updatedUser);
    localStorage.setItem(`onboarded_${currentUser.uid}`, 'true');
    setShowOnboarding(false);
  };

  const userInvites = useMemo(() => {
    if (!currentUser) return [];
    return invites.filter(inv => inv.toUser.uid === currentUser.uid && inv.status === InviteStatus.Pending);
  }, [invites, currentUser]);

  const userConnections = useMemo(() => {
    if (!currentUser) return [];
    return connections.filter(c => c.participant1.uid === currentUser.uid || c.participant2.uid === currentUser.uid);
  }, [connections, currentUser]);

  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter(user => {
      if (user.uid === currentUser.uid) return false;
      if (selectedMode === Mode.Both) return true;
      return user.mode === selectedMode;
    });
  }, [users, selectedMode, currentUser]);

  const handleSelectUser = (user: UserProfile) => {
    setPreviousView(currentView === 'profile' ? 'list' : currentView);
    setSelectedUser(user);
    setCurrentView('profile');
    setActiveChatConnection(null);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setActiveChatConnection(null);
    if(currentView === 'assistantChat') {
        setCurrentView('assistant');
    } else {
        setCurrentView(previousView);
    }
  };

  const handleHomeClick = () => {
    setSelectedUser(null);
    setActiveChatConnection(null);
    setCurrentView('list');
  }

  const handleStartChat = (userToChat: UserProfile) => {
    const connection = userConnections.find(c => c.participant1.uid === userToChat.uid || c.participant2.uid === userToChat.uid);
    if (connection) {
        setActiveChatConnection(connection);
        setCurrentView('chat');
    }
  };

  const handleSelectConnection = (connection: Connection) => {
    setActiveChatConnection(connection);
    setCurrentView('chat');
  };

  const handleOpenInviteModal = (user: UserProfile) => {
    setInvitingUser(user);
    setInviteModalOpen(true);
  };

  const handleSendInvite = (message: string, suggestedTime?: string) => {
    if (!invitingUser || !currentUser) return;
    // This is where you would save the invite to Firestore.
    console.log("Sending invite from", currentUser.uid, "to", invitingUser.uid);
    setSentInvites(prev => new Set(prev).add(invitingUser.uid));
    setInviteModalOpen(false);
    setInvitingUser(null);
  };
  
  const handleInviteResponse = (inviteId: number, response: InviteStatus.Accepted | InviteStatus.Declined) => {
    const invite = invites.find(inv => inv.id === inviteId);
    if (!invite || !currentUser) return;

    setInvites(prev => prev.map(inv => inv.id === inviteId ? {...inv, status: response} : inv));

    if (response === InviteStatus.Accepted) {
        const chatHistory: ChatMessage[] = [];
        if (invite.message) {
            chatHistory.push({ id: Date.now(), senderId: invite.fromUser.uid, text: invite.message, timestamp: 'Just now' });
        }
        if (invite.suggestedTime) {
            chatHistory.push({ id: Date.now() + 1, senderId: invite.fromUser.uid, text: `By the way, I suggested a time: ${invite.suggestedTime}`, timestamp: 'Just now' });
        }
        
        const newConnection: Connection = {
            id: invite.id,
            participant1: invite.fromUser,
            participant2: invite.toUser,
            chatHistory,
        };
        setConnections(prev => [...prev, newConnection]);
        setActiveChatConnection(newConnection);
        setCurrentView('chat');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChatConnection || !currentUser) return;
    
    const newMessage: ChatMessage = {
        id: Date.now(),
        senderId: currentUser.uid,
        text,
        timestamp: 'Just now'
    };
    
    const updatedChatHistory = [...activeChatConnection.chatHistory, newMessage];
    const updatedConnection = { ...activeChatConnection, chatHistory: updatedChatHistory };
    setConnections(prev => prev.map(c => c.id === activeChatConnection.id ? updatedConnection : c));
    setActiveChatConnection(updatedConnection);

    const schedulingKeywords = ['meet', 'schedule', 'call', 'time', 'calendar', 'connect'];
    if (schedulingKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        setIsAssistantTyping(true);
        const otherUser = activeChatConnection.participant1.uid === currentUser.uid ? activeChatConnection.participant2 : activeChatConnection.participant1;
        const assistantResponseText = await getAssistantResponse(updatedChatHistory, currentUser, otherUser);

        const assistantMessage: ChatMessage = {
            id: Date.now() + 1,
            senderId: 'assistant',
            text: assistantResponseText,
            timestamp: 'Just now'
        };

        const finalChatHistory = [...updatedChatHistory, assistantMessage];
        const finalConnection = { ...updatedConnection, chatHistory: finalChatHistory };

        setConnections(prev => prev.map(c => c.id === activeChatConnection.id ? finalConnection : c));
        setActiveChatConnection(finalConnection);
        setIsAssistantTyping(false);
    }
  };
  
  const handleSendAssistantMessage = async (text: string) => {
    if(!currentUser) return;

    const newMessage: ChatMessage = {
        id: Date.now(),
        senderId: currentUser.uid,
        text,
        timestamp: 'Just now'
    };
    const updatedHistory = [...assistantChatHistory, newMessage];
    setAssistantChatHistory(updatedHistory);
    setIsInteractiveAssistantTyping(true);

    const responseText = await getInteractiveAssistantResponse(updatedHistory, currentUser);
    
    const responseMessage: ChatMessage = {
        id: Date.now() + 1,
        senderId: 'interactive-assistant',
        text: responseText,
        timestamp: 'Just now'
    };

    setAssistantChatHistory(prev => [...prev, responseMessage]);
    setIsInteractiveAssistantTyping(false);
  };

  const handleScheduleFromAssistant = (connectionId: number) => {
    const connection = userConnections.find(c => c.id === connectionId);
    if (connection) {
        setActiveChatConnection(connection);
        setCurrentView('chat');
        setTimeout(() => {
            handleSendMessage("Let's find a time to connect!");
        }, 100);
    }
  };

  const handleGiveKudos = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? {...u, kudos: u.kudos + 1} : u));
    if(selectedUser && selectedUser.uid === userId) {
      setSelectedUser(prev => prev ? {...prev, kudos: prev.kudos + 1} : null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }
  
  const renderViewContent = () => {
    switch (currentView) {
      case 'assistantChat':
        return <AssistantChatView
          messages={assistantChatHistory}
          onSendMessage={handleSendAssistantMessage}
          isTyping={isInteractiveAssistantTyping}
          onBack={handleBack}
        />
      case 'assistant':
        return <AssistantView 
          currentUser={currentUser} 
          connections={userConnections} 
          onSchedule={handleScheduleFromAssistant} 
          onStartChat={() => setCurrentView('assistantChat')}
        />
      case 'chat':
        return activeChatConnection ? <ChatView 
          connection={activeChatConnection} 
          currentUser={currentUser} 
          onBack={handleBack} 
          onSendMessage={handleSendMessage}
          isAssistantTyping={isAssistantTyping}
        /> : null;
      case 'invites':
        return <InvitesView 
          receivedInvites={userInvites}
          connections={userConnections}
          onInviteResponse={handleInviteResponse}
          onSelectConnection={handleSelectConnection}
          onViewProfile={handleSelectUser}
        />;
      case 'profile':
        if (selectedUser) {
          const isConnected = userConnections.some(c => c.participant1.uid === selectedUser.uid || c.participant2.uid === selectedUser.uid);
          const hasBeenInvited = userInvites.some(invite => invite.fromUser.uid === selectedUser.uid);
          return (
            <div>
              <button 
                onClick={handleBack} 
                className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
              >
                <ArrowLeft />
                Back to {previousView}
              </button>
              <ProfileView 
                user={selectedUser} 
                onInvite={handleOpenInviteModal}
                isInviteSent={sentInvites.has(selectedUser.uid)}
                isConnected={isConnected}
                onStartChat={handleStartChat}
                hasBeenInvited={hasBeenInvited}
                onGiveKudos={handleGiveKudos}
              />
            </div>
          );
        }
        return null;
      case 'list':
      default:
        return (
          <>
            <Suggestions currentUser={currentUser} allUsers={users} onSelectUser={handleSelectUser} />
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {selectedMode === Mode.Both ? 'Explore People' : `Explore ${selectedMode} Connections`}
                </h2>
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredUsers.map(user => {
                            let status: ConnectionStatus = 'none';
                            const isConnected = userConnections.some(c => c.participant1.uid === user.uid || c.participant2.uid === user.uid);
                            const hasBeenInvited = userInvites.some(invite => invite.fromUser.uid === user.uid);
                            const isInviteSent = sentInvites.has(user.uid);

                            if (isConnected) status = 'connected';
                            else if (hasBeenInvited) status = 'received';
                            else if (isInviteSent) status = 'sent';
                            
                            return (
                                <UserCard 
                                    key={user.uid} 
                                    user={user} 
                                    onSelectUser={handleSelectUser}
                                    status={status}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-slate-500">No users found for the selected mode.</p>
                    </div>
                )}
            </div>
          </>
        );
    }
  }
  
  const showSidebar = (currentView === 'list' || currentView === 'profile') && currentUser;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header 
        currentUser={currentUser}
        selectedMode={selectedMode} 
        setSelectedMode={setSelectedMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
        pendingInvitesCount={userInvites.length}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
      />
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className={showSidebar ? "lg:col-span-2" : "lg:col-span-3"}>
            {renderViewContent()}
          </div>
          {showSidebar && (
            <div className="hidden lg:block">
              <ChatSidebar
                receivedInvites={userInvites}
                connections={userConnections}
                currentUser={currentUser}
                onInviteResponse={handleInviteResponse}
                onSelectConnection={handleSelectConnection}
                onViewProfile={handleSelectUser}
              />
            </div>
          )}
        </div>
      </main>

      {isInviteModalOpen && invitingUser && (
        <InviteModal
          currentUser={currentUser}
          targetUser={invitingUser}
          onClose={() => setInviteModalOpen(false)}
          onSend={handleSendInvite}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
            userName={currentUser.name}
            onComplete={handleOnboardingComplete}
            goalOptions={GOAL_OPTIONS}
        />
      )}
    </div>
  );
};

export default App;