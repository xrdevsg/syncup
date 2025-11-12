import { Mode, UserProfile, Invite, InviteStatus, Connection } from './types';

export const GOAL_OPTIONS = [
    'Make friends in SG',
    'Get advice on switching careers',
    'Offer 1 hour of mentoring per week',
    'Find creative collaborators',
    'Practice a new language',
    'Find a workout buddy',
];

// NOTE: As we move to a real database, this mock data will be replaced.
// For now, we use it to populate the app with other users.
export const MOCK_USERS: UserProfile[] = [
  // {
  //   id: 1,
  //   uid: 'mock-uid-1',
  //   name: 'Alex Chen',
  //   intro: 'Software Engineer exploring the intersection of AI and music. Open to mentoring junior developers.',
  //   tags: ['Software Development', 'AI', 'Music Production', 'Mentorship', 'React'],
  //   availability: 'Evenings this week',
  //   location: 'Singapore',
  //   vibePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  //   presenceUpdate: 'Just finished a great book on system design!',
  //   goals: ['Offer 1 hour of mentoring per week', 'Get advice on switching careers'],
  //   mode: Mode.Professional,
  //   role: 'Mentor',
  //   kudos: 28,
  // },
  {
    id: 2,
    uid: 'mock-uid-2',
    name: 'Brenda Tan',
    intro: 'Product Manager in fintech. Always up for a coffee chat about building great products or exploring new hiking trails.',
    tags: ['Product Management', 'Fintech', 'Hiking', 'Coffee', 'User Experience'],
    availability: 'Weekends only',
    location: 'Singapore',
    vibePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    goals: ['Make friends in SG'],
    mode: Mode.Social,
    role: 'Peer',
    kudos: 12,
  },
  {
    id: 3,
    uid: 'mock-uid-3',
    name: 'Charlie Davis',
    intro: 'Freelance graphic designer and illustrator. Looking for creative collaborators and new friends to explore art galleries with.',
    tags: ['Graphic Design', 'Illustration', 'Art', 'Freelancing', 'Figma'],
    availability: 'Open this week',
    location: 'Kuala Lumpur, Malaysia',
    vibePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    presenceUpdate: 'Working on a new branding project for a local cafe.',
    goals: ['Make friends in SG', 'Find creative collaborators'],
    mode: Mode.Social,
    role: 'Peer',
    kudos: 5,
  },
  {
    id: 4,
    uid: 'mock-uid-4',
    name: 'Diana Ivanova',
    intro: 'Data Scientist with a passion for sustainable tech. I can help with career advice in the data space.',
    tags: ['Data Science', 'Python', 'Sustainability', 'Career Advice', 'Machine Learning'],
    availability: 'Not available',
    location: 'Singapore',
    vibePhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    goals: ['Offer 1 hour of mentoring per week'],
    mode: Mode.Professional,
    role: 'Mentor',
    kudos: 42,
  },
  {
    id: 5,
    uid: 'mock-uid-5',
    name: 'Ethan Kumar',
    intro: 'Founder of a small e-commerce startup. Juggling growth, marketing, and a love for street photography.',
    tags: ['Entrepreneurship', 'E-commerce', 'Marketing', 'Photography', 'Startups'],
    availability: 'Weekends only',
    location: 'Jakarta, Indonesia',
    vibePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    presenceUpdate: 'Testing out a new marketing campaign this week. Fingers crossed!',
    goals: ['Get advice on switching careers'],
    mode: Mode.Professional,
    role: 'Mentee',
    kudos: 8,
  },
  {
    id: 6,
    uid: 'mock-uid-6',
    name: 'Fiona Wallace',
    intro: 'UX Researcher who loves pottery and finding the best noodle spots in town. Let\'s connect over a shared meal or craft.',
    tags: ['UX Research', 'Pottery', 'Foodie', 'Crafts', 'User Interviews'],
    availability: 'Evenings this week',
    location: 'Singapore',
    vibePhotoUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    goals: ['Make friends in SG'],
    mode: Mode.Social,
    role: 'Peer',
    kudos: 15,
  },
];


export const MOCK_INVITES: Invite[] = [
    {
        id: 1,
        fromUser: MOCK_USERS[4], // Fiona Wallace
        toUser: MOCK_USERS[0], // Brenda Tan now
        status: InviteStatus.Pending,
        message: "Hey Brenda! I saw you're into hiking. I've been trying to find new trails and would love to hear about your experience.",
    },
    {
        id: 2,
        fromUser: MOCK_USERS[3], // Ethan Kumar
        toUser: MOCK_USERS[0], // Brenda Tan now
        status: InviteStatus.Pending,
        message: "Hi Brenda, saw that you're in Product Management. I'm thinking about a career switch into tech from e-commerce and could really use some advice. Would you be open to a quick chat?",
    },
    {
        id: 3,
        fromUser: MOCK_USERS[0], // Brenda Tan
        toUser: MOCK_USERS[1], // Charlie Davis
        status: InviteStatus.Pending,
        message: "Hey Charlie, love your design work! I'm a PM and always looking to connect with creative folks. Let's grab a coffee?",
    }
];

export const MOCK_CONNECTIONS: Connection[] = [
    {
        id: 101,
        participant1: MOCK_USERS[0], // Brenda
        participant2: MOCK_USERS[2], // Diana
        chatHistory: [
            { id: 1, senderId: MOCK_USERS[2].uid, text: "Hey Brenda, thanks for connecting! I'm really passionate about sustainable tech.", timestamp: "Yesterday" },
            { id: 2, senderId: MOCK_USERS[0].uid, text: "Hi Diana, likewise! It's a fascinating and important field. What got you into it?", timestamp: "Yesterday" },
            { id: 3, senderId: MOCK_USERS[2].uid, text: "I started during a university project and just got hooked. The potential for impact is huge.", timestamp: "Today" },
        ],
    },
];