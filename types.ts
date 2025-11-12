export enum Mode {
  Social = 'Social',
  Professional = 'Professional',
  Both = 'Both',
}

export type UserRole = 'Mentor' | 'Mentee' | 'Peer';

export interface UserProfile {
  uid: string; // Firebase Auth User ID
  id?: number; // Optional: for mock data compatibility
  name: string;
  intro: string;
  tags: string[];
  availability: string;
  location: string;
  vibePhotoUrl: string;
  presenceUpdate?: string;
  goals: string[];
  mode: Mode.Social | Mode.Professional; // The user's primary mode setting
  role: UserRole;
  kudos: number;
}

export interface AISuggestion {
  uid: string; // Changed from id: number to uid: string
  name: string;
  reason: string;
}

export enum InviteStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Declined = 'Declined',
}

export interface Invite {
    id: number;
    fromUser: UserProfile;
    toUser: UserProfile;
    status: InviteStatus;
    message?: string;
    suggestedTime?: string;
}

export interface ChatMessage {
  id: number;
  senderId: string | 'assistant' | 'interactive-assistant'; // Changed from number to string for uid
  text: string;
  timestamp: string;
}

export interface Connection {
  id: number; // Could be the original invite ID
  participant1: UserProfile;
  participant2: UserProfile;
  chatHistory: ChatMessage[];
}

export interface SchedulingSuggestion {
  connectionId: number;
  participantName: string;
  reason: string;
}