// src/firebase/firestore.ts
import { 
  doc, 
  collection,
  getDocs,
  getDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import type { Subject, Task, LoggedSession, StreakData } from '../types';

// User data
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserPoints = async (userId: string, points: number) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      points,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user points:', error);
    return false;
  }
};

export const updateUserStreak = async (userId: string, streakData: StreakData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      streakData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user streak:', error);
    return false;
  }
};

// Subjects
export const getSubjects = async (userId: string) => {
  try {
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(subjectsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  } catch (error) {
    console.error('Error getting subjects:', error);
    return [];
  }
};

export const addSubject = async (userId: string, subject: Omit<Subject, 'id'>) => {
  try {
    const subjectRef = doc(collection(db, 'subjects'));
    await setDoc(subjectRef, {
      ...subject,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: subjectRef.id, ...subject };
  } catch (error) {
    console.error('Error adding subject:', error);
    return null;
  }
};

// Tasks
export const getTasks = async (userId: string) => {
  try {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(tasksQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JS Date objects
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || undefined
      } as Task;
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const addTask = async (userId: string, task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
  try {
    const taskRef = doc(collection(db, 'tasks'));
    const newTask = {
      ...task,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(taskRef, newTask);
    return { 
      id: taskRef.id, 
      ...task, 
      completed: false, 
      createdAt: new Date() 
    };
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

// Study Sessions
export const getLoggedSessions = async (userId: string) => {
  try {
    const sessionsQuery = query(
      collection(db, 'loggedSessions'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JS Date objects
      return { 
        id: doc.id, 
        ...data,
        startTime: data.startTime?.toDate() || new Date(),
        endTime: data.endTime?.toDate() || new Date(),
      } as LoggedSession;
    });
  } catch (error) {
    console.error('Error getting logged sessions:', error);
    return [];
  }
};

export const addLoggedSession = async (userId: string, session: Omit<LoggedSession, 'id'>) => {
  try {
    const sessionRef = doc(collection(db, 'loggedSessions'));
    await setDoc(sessionRef, {
      ...session,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: sessionRef.id, ...session };
  } catch (error) {
    console.error('Error adding logged session:', error);
    return null;
  }
};

export const updateLoggedSession = async (sessionId: string, updates: Partial<LoggedSession>) => {
  try {
    await updateDoc(doc(db, 'loggedSessions', sessionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating logged session:', error);
    return false;
  }
};

export const deleteLoggedSession = async (sessionId: string) => {
  try {
    await deleteDoc(doc(db, 'loggedSessions', sessionId));
    return true;
  } catch (error) {
    console.error('Error deleting logged session:', error);
    return false;
  }
};

// Bulk operations
export const syncUserData = async (userId: string, userData: {
  subjects: Subject[],
  tasks: Task[],
  loggedSessions: LoggedSession[],
  points: number,
  streakData: StreakData
}) => {
  try {
    const batch = writeBatch(db);
    
    // Update user profile with points and streak data
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      points: userData.points,
      streakData: userData.streakData,
      updatedAt: serverTimestamp()
    });
    
    // For a more comprehensive sync, we would need to:
    // 1. Delete removed items
    // 2. Update existing items
    // 3. Add new items
    // However, for simplicity in this implementation, we'll just handle the basics
    
    return await batch.commit();
  } catch (error) {
    console.error('Error syncing user data:', error);
    return null;
  }
};

// Firebase Authentication helper to create/update user profile
export const createUserProfile = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};