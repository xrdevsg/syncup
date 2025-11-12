import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AISuggestion, ChatMessage, Connection, SchedulingSuggestion } from '../types';

const getGemini = () => {
    // Safely check for process.env to avoid ReferenceError in browser environments.
    let apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

    if (!apiKey) {
        apiKey = sessionStorage.getItem("gemini_api_key");
        if (!apiKey) {
            apiKey = window.prompt("Please enter your Gemini API Key:");
            if (apiKey) {
                sessionStorage.setItem("gemini_api_key", apiKey);
            }
        }
    }
    
    if (!apiKey) {
        // If the user cancels the prompt or provides no key, we cannot proceed.
        alert("A Gemini API key is required to use the AI features of this application. Please reload the page and enter your key when prompted.");
        throw new Error("API_KEY is not available. Please provide a key to use the AI features.");
    }
    
    return new GoogleGenAI({ apiKey });
}

export const getAISuggestions = async (currentUser: UserProfile, otherUsers: UserProfile[]): Promise<AISuggestion[]> => {
    try {
        const ai = getGemini();

        const currentUserProfileString = `
            - ID: ${currentUser.uid}
            - Name: ${currentUser.name}
            - Intro: ${currentUser.intro}
            - Tags: ${currentUser.tags.join(', ')}
            - Goals: ${currentUser.goals.join(', ')}
            - Mode: ${currentUser.mode}
            - Role: ${currentUser.role}
        `;

        const otherUsersProfileString = otherUsers
            .map(user => `
                - ID: ${user.uid}
                - Name: ${user.name}
                - Intro: ${user.intro}
                - Tags: ${user.tags.join(', ')}
                - Goals: ${user.goals.join(', ')}
                - Mode: ${user.mode}
                - Role: ${user.role}
            `).join('\n');

        const prompt = `
            You are a smart matchmaking assistant for an app called "SyncUp".
            SyncUp is a platform for genuine, intention-based connections, both professional and social. It's not for dating.
            Your task is to suggest 2-3 meaningful connections for a user based on their profile and the profiles of others.

            Here is the current user's profile:
            ${currentUserProfileString}

            Here is a list of other users on the platform:
            ${otherUsersProfileString}

            Please suggest 2-3 people for the current user to connect with. For each suggestion, provide a concise, human-friendly reason for the match, highlighting shared interests, goals, or potential for a valuable conversation. The reason should feel personal and encouraging. Consider their roles (Mentor, Mentee, Peer) for better matches.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    uid: {
                                        type: Type.STRING,
                                        description: "The user ID (uid) of the suggested person.",
                                    },
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the suggested person.",
                                    },
                                    reason: {
                                        type: Type.STRING,
                                        description: "A short, friendly reason why they would be a good connection.",
                                    },
                                },
                                required: ["uid", "name", "reason"],
                            },
                        },
                    },
                    required: ["suggestions"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        return result.suggestions as AISuggestion[];
    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        alert("Could not fetch AI suggestions. Please ensure your API key is correct and try again.");
        return [];
    }
};

export const getInviteMessageSuggestion = async (currentUser: UserProfile, targetUser: UserProfile): Promise<string> => {
    try {
        const ai = getGemini();
        const prompt = `
            You are a helpful and friendly assistant for an app called "SyncUp".
            Your goal is to help a user write a warm, personal, and intention-based invitation to connect with someone else.

            The user, ${currentUser.name} (${currentUser.role}), wants to connect with ${targetUser.name} (${targetUser.role}).

            Here is ${currentUser.name}'s profile:
            - Intro: ${currentUser.intro}
            - Tags: ${currentUser.tags.join(', ')}
            - Goals: ${currentUser.goals.join(', ')}

            Here is ${targetUser.name}'s profile:
            - Intro: ${targetUser.intro}
            - Tags: ${targetUser.tags.join(', ')}
            - Goals: ${targetUser.goals.join(', ')}

            Based on their profiles, generate one friendly and concise (2-3 sentences) icebreaker message that ${currentUser.name} could send. The message should reference a shared interest, a potential for mentorship, or a common goal to make the connection feel genuine.
            
            Example: "Hey ${targetUser.name}! I saw on your profile that you're into [shared interest]. I've been wanting to explore that more and would love to hear about your experience."
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error getting invite message suggestion:", error);
        return "Hey! I came across your profile and thought it would be great to connect.";
    }
};


export const getConversationStarters = async (currentUser: UserProfile, otherUser: UserProfile): Promise<string[]> => {
    try {
        const ai = getGemini();
        const prompt = `
            You are a helpful and friendly assistant for an app called "SyncUp".
            Your goal is to help a user start a warm, personal, and intention-based conversation with a new connection.

            The user, ${currentUser.name}, just connected with ${otherUser.name}.

            Here is ${currentUser.name}'s profile:
            - Intro: ${currentUser.intro}
            - Tags: ${currentUser.tags.join(', ')}
            - Goals: ${currentUser.goals.join(', ')}

            Here is ${otherUser.name}'s profile:
            - Intro: ${otherUser.intro}
            - Tags: ${otherUser.tags.join(', ')}
            - Goals: ${otherUser.goals.join(', ')}

            Based on their profiles, generate 3 friendly and concise (1-2 sentences) icebreaker messages that ${currentUser.name} could send. The messages should reference a shared interest, a potential for mentorship, or a common goal. Do not include greetings like "Hey!" or "Hi!".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        starters: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single conversation starter suggestion.",
                            },
                        },
                    },
                    required: ["starters"],
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.starters as string[];

    } catch (error) {
        console.error("Error getting conversation starters:", error);
        return [];
    }
};

export const getAssistantResponse = async (chatHistory: ChatMessage[], currentUser: UserProfile, otherUser: UserProfile): Promise<string> => {
    try {
        const ai = getGemini();
        const historyString = chatHistory.slice(-5).map(msg => {
            const senderName = msg.senderId === 'assistant' ? 'SyncUp Assistant' : (msg.senderId === currentUser.uid ? currentUser.name : otherUser.name);
            return `${senderName}: ${msg.text}`;
        }).join('\n');

        const prompt = `
            You are "SyncUp Assistant", a helpful chatbot inside a messaging app.
            Your only job is to help two users, ${currentUser.name} and ${otherUser.name}, schedule a meeting.
            The last message sent indicates they want to schedule something.
            Current conversation:
            ${historyString}

            Analyze the conversation and suggest a clear, actionable next step for scheduling. Be friendly and slightly formal.
            Your response should be ONE sentence.
            Example: "Happy to help with that! What day and time works best for both of you for a quick chat?"
            Example: "I can help schedule this. Would a video call link or a calendar invite be more helpful?"
        `;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting assistant response:", error);
        return "I can help with that! What time works best for you?";
    }
};

export const getMeetingTimeSuggestion = async (user1: UserProfile, user2: UserProfile): Promise<string> => {
    try {
        const ai = getGemini();
        const prompt = `
            You are an assistant helping ${user1.name} schedule a meeting with ${user2.name}.
            User 1's availability: "${user1.availability}"
            User 2's availability: "${user2.availability}"
            Based on their stated availability, suggest a single, specific time slot for them to meet. Be creative if availabilities don't overlap perfectly.
            Output only the suggested time, e.g., "this Friday afternoon" or "next Tuesday at 3 PM".
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error suggesting meeting time:", error);
        return "How about sometime next week?";
    }
};

export const getSchedulingSuggestions = async (connections: Connection[], currentUser: UserProfile): Promise<SchedulingSuggestion[]> => {
    if (connections.length === 0) return [];
    try {
        const ai = getGemini();
        const connectionsString = connections.map(c => {
            const otherUser = c.participant1.uid === currentUser.uid ? c.participant2 : c.participant1;
            const lastMessage = c.chatHistory[c.chatHistory.length - 1];
            return `{
                "connectionId": ${c.id},
                "participantName": "${otherUser.name}",
                "lastMessage": "${lastMessage ? `${lastMessage.senderId === currentUser.uid ? 'You' : otherUser.name}: ${lastMessage.text}` : 'No messages yet.'}"
            }`;
        }).join(',\n');

        const prompt = `
            You are a proactive AI assistant for an app called SyncUp. Your job is to find conversations that have stalled and suggest a follow-up.
            Here are the current user's conversations:
            [${connectionsString}]

            Identify 1-2 conversations where scheduling a meeting was mentioned but no firm time was set, or where the conversation has been inactive for a while.
            For each one you identify, provide a brief, friendly reason for the follow-up.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    connectionId: { type: Type.INTEGER },
                                    participantName: { type: Type.STRING },
                                    reason: { type: Type.STRING, description: "A short reason for following up." }
                                },
                                required: ["connectionId", "participantName", "reason"]
                            }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        return result.suggestions as SchedulingSuggestion[];
    } catch (error) {
        console.error("Error getting scheduling suggestions:", error);
        return [];
    }
};

export const getInteractiveAssistantResponse = async (chatHistory: ChatMessage[], currentUser: UserProfile): Promise<string> => {
    try {
        const ai = getGemini();
        const historyString = chatHistory.slice(-5).map(msg => {
            const senderName = msg.senderId === 'interactive-assistant' ? 'SyncUp Assistant' : 'User';
            return `${senderName}: ${msg.text}`;
        }).join('\n');
        
        const prompt = `
            You are "SyncUp Assistant", a helpful AI inside a professional and social connection app.
            Your job is to help the user, ${currentUser.name}, achieve their goals on the platform.
            You can help them find people, draft messages, or come up with connection ideas.
            Be friendly, concise, and helpful.
            
            Current conversation with the user:
            ${historyString}

            Based on the last message from the user, provide a helpful response.
        `;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text.trim();

    } catch (error) {
        console.error("Error getting interactive assistant response:", error);
        return "I'm sorry, I'm having a little trouble right now. Could you ask me that again?";
    }
};