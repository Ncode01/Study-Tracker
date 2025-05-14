// src/firebase/auth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';
import type { User } from '../types';

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName: string) => {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    throw new Error('Firebase authentication is not available');
  }

  try {
    // First create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Then update the profile with display name
    try {
      await updateProfile(user, {
        displayName
      });
    } catch (profileError) {
      console.error('Error updating profile:', profileError);
      // Continue even if profile update fails
    }
    
    // Create user profile in Firestore
    try {
      await createUserProfile(user.uid, {
        email,
        displayName,
        username: email.split('@')[0], // Simple username from email
        points: 0,
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null
        }
      });
    } catch (profileError) {
      console.error('Error creating Firestore profile:', profileError);
      // We'll continue even if profile creation fails
      // The user can still log in, and we can create the profile later
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

// Sign out
export const logOut = async () => {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    return false;
  }

  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Convert Firebase user to app User type
export const mapFirebaseUser = (firebaseUser: FirebaseUser): Partial<User> => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || undefined,
    displayName: firebaseUser.displayName || 'User',
    username: firebaseUser.email ? firebaseUser.email.split('@')[0] : 'user'
  };
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    setTimeout(() => callback(null), 0); // Call with null immediately
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};