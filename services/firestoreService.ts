import { User } from 'firebase/auth';
import { db } from './firebase';
import { UserProfile, Mode } from '../types';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Creates a new user profile document in Firestore.
 * @param user The Firebase user object from Authentication.
 * @param name The user's full name.
 * @param mode The user's selected initial mode.
 */
export const createUserProfile = async (user: User, name: string, mode: Mode.Social | Mode.Professional): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  
  const newUserProfile: UserProfile = {
    uid: user.uid,
    name,
    mode,
    intro: 'New to SyncUp! Looking to connect with others.',
    tags: ['newbie'],
    availability: 'Not specified',
    location: 'Not specified',
    vibePhotoUrl: `https://api.dicebear.com/6.x/initials/svg?seed=${name.split(' ').join('')}`, // Generic avatar
    goals: [],
    role: 'Peer', // Default role
    kudos: 0,
  };

  try {
    console.log("Creating user profile for:", user.uid);
    await setDoc(userRef, newUserProfile);
    console.log("User profile created successfully");
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID.
 * @returns The user's profile object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  try {
    console.log("Fetching user profile for:", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log("User profile found");
      return docSnap.data() as UserProfile;
    } else {
      console.log("No user profile found");
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};
