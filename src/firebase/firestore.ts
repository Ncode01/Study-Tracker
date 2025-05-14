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
import type { 
  Subject, 
  Task, 
  LoggedSession, 
  StreakData, 
  CalendarEvent,
  CalendarClass,
  CalendarReminder 
} from '../types';

// User data
export const getUserData = async (userId: string) => {
  if (!userId) {
    console.error('getUserData called with empty userId');
    return null;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Convert any Firestore timestamps to JS Date objects
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        streakData: data.streakData ? {
          ...data.streakData,
          lastActiveDate: data.streakData.lastActiveDate?.toDate?.() || null
        } : null
      };
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

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
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
    // First, update user profile with points and streak data
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      points: userData.points,
      streakData: userData.streakData,
      updatedAt: serverTimestamp()
    });
    
    // For a more comprehensive sync:
    // 1. Process local subjects that need to be added to Firebase
    for (const subject of userData.subjects) {
      if (subject.id.startsWith('subj-')) {
        // This is a locally created subject, add it to Firebase
        const subjectData = {
          name: subject.name,
          color: subject.color,
          targetHours: subject.targetHours
        };
        await addSubject(userId, subjectData);
      }
    }
    
    // 2. Process local tasks that need to be added to Firebase
    for (const task of userData.tasks) {
      if (task.id.startsWith('task-')) {
        // This is a locally created task, add it to Firebase
        const taskData = {
          subjectId: task.subjectId,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate
        };
        await addTask(userId, taskData);
      } else {
        // This is an existing task, update it
        await updateTask(task.id, {
          completed: task.completed
        });
      }
    }
    
    // 3. Process local sessions that need to be added to Firebase
    for (const session of userData.loggedSessions) {
      if (session.id.startsWith('sess-')) {
        // This is a locally created session, add it to Firebase
        const sessionData = {
          subjectId: session.subjectId,
          taskId: session.taskId,
          startTime: session.startTime,
          endTime: session.endTime,
          durationMinutes: session.durationMinutes,
          notes: session.notes,
          focusScore: session.focusScore,
          distractionsLogged: session.distractionsLogged,
          tasksCompleted: session.tasksCompleted,
          materials: session.materials,
          tags: session.tags
        };
        await addLoggedSession(userId, sessionData);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing user data:', error);
    return false;
  }
};

// Firebase Authentication helper to create/update user profile
export const createUserProfile = async (userId: string, data: any) => {
  if (!userId) {
    console.error('createUserProfile called with empty userId');
    return false;
  }
  
  try {
    // First check if the user profile already exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    // Prepare data with timestamps
    const userData = {
      ...data,
      createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Use merge: true to update existing fields without overwriting the entire document
    await setDoc(userRef, userData, { merge: true });
    
    // If this is a new user, create initial subjects and tasks
    if (!userDoc.exists()) {
      console.log('Creating initial data for new user:', userId);
      
      // Create initial subjects
      const initialSubjects = [
        { name: 'Mathematics', color: '#FF5252', targetHours: 10 },
        { name: 'Programming', color: '#42A5F5', targetHours: 15 }
      ];
      
      // Add each initial subject
      for (const subject of initialSubjects) {
        await addSubject(userId, subject);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

// Calendar Events
export const getCalendarEvents = async (userId: string) => {
  try {
    const eventsQuery = query(
      collection(db, 'calendarEvents'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JS Date objects and properly cast to CalendarEvent
      return { 
        id: doc.id, 
        ...data,
        start: data.start?.toDate() || new Date(),
        end: data.end?.toDate() || new Date(),
        lastSync: data.lastSync?.toDate() || undefined,
        // Required properties for CalendarEvent that might not be in Firestore
        title: data.title || 'Unnamed Event',
        allDay: data.allDay || false,
        source: data.source || 'local',
        editable: data.editable !== undefined ? data.editable : true
      } as CalendarEvent;
    });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return [];
  }
};

export const addCalendarEvent = async (userId: string, event: Omit<CalendarEvent, 'id'>) => {
  try {
    const eventRef = doc(collection(db, 'calendarEvents'));
    await setDoc(eventRef, {
      ...event,
      userId,
      start: event.start,
      end: event.end,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: eventRef.id, ...event };
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return null;
  }
};

export const updateCalendarEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
  try {
    await updateDoc(doc(db, 'calendarEvents', eventId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
};

export const deleteCalendarEvent = async (eventId: string) => {
  try {
    await deleteDoc(doc(db, 'calendarEvents', eventId));
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
};

// Calendar Classes (recurring schedule)
export const getCalendarClasses = async (userId: string) => {
  try {
    const classesQuery = query(
      collection(db, 'calendarClasses'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(classesQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JS Date objects
      return { 
        id: doc.id, 
        ...data,
        startRecur: data.startRecur?.toDate() || new Date(),
        endRecur: data.endRecur?.toDate() || undefined
      } as CalendarClass;
    });
  } catch (error) {
    console.error('Error getting calendar classes:', error);
    return [];
  }
};

export const addCalendarClass = async (userId: string, classObj: Omit<CalendarClass, 'id'>) => {
  try {
    const classRef = doc(collection(db, 'calendarClasses'));
    await setDoc(classRef, {
      ...classObj,
      userId,
      startRecur: classObj.startRecur,
      endRecur: classObj.endRecur,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: classRef.id, ...classObj };
  } catch (error) {
    console.error('Error adding calendar class:', error);
    return null;
  }
};

export const updateCalendarClass = async (classId: string, updates: Partial<CalendarClass>) => {
  try {
    await updateDoc(doc(db, 'calendarClasses', classId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating calendar class:', error);
    return false;
  }
};

export const deleteCalendarClass = async (classId: string) => {
  try {
    await deleteDoc(doc(db, 'calendarClasses', classId));
    return true;
  } catch (error) {
    console.error('Error deleting calendar class:', error);
    return false;
  }
};

// Calendar Reminders
export const getCalendarReminders = async (userId: string) => {
  try {
    const remindersQuery = query(
      collection(db, 'calendarReminders'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(remindersQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore timestamps to JS Date objects
      return { 
        id: doc.id, 
        ...data,
        date: data.date?.toDate() || new Date()
      } as CalendarReminder;
    });
  } catch (error) {
    console.error('Error getting calendar reminders:', error);
    return [];
  }
};

export const addCalendarReminder = async (userId: string, reminder: Omit<CalendarReminder, 'id'>) => {
  try {
    const reminderRef = doc(collection(db, 'calendarReminders'));
    await setDoc(reminderRef, {
      ...reminder,
      userId,
      date: reminder.date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: reminderRef.id, ...reminder };
  } catch (error) {
    console.error('Error adding calendar reminder:', error);
    return null;
  }
};

export const updateCalendarReminder = async (reminderId: string, updates: Partial<CalendarReminder>) => {
  try {
    await updateDoc(doc(db, 'calendarReminders', reminderId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating calendar reminder:', error);
    return false;
  }
};

export const deleteCalendarReminder = async (reminderId: string) => {
  try {
    await deleteDoc(doc(db, 'calendarReminders', reminderId));
    return true;
  } catch (error) {
    console.error('Error deleting calendar reminder:', error);
    return false;
  }
};

// Sync all calendar data
export const syncCalendarData = async (userId: string, calendarData: {
  events: CalendarEvent[],
  classes: CalendarClass[],
  reminders: CalendarReminder[]
}) => {
  try {
    const batch = writeBatch(db);
    
    // Process calendar events
    for (const event of calendarData.events) {
      if (event.id.startsWith('evt-') || event.id.startsWith('cal-')) {
        // This is a locally created event, add it to Firebase
        const eventRef = doc(collection(db, 'calendarEvents'));
        batch.set(eventRef, {
          ...event,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else if (!event.id.includes('google-')) {
        // This is an existing event (not from Google), update it
        const eventRef = doc(db, 'calendarEvents', event.id);
        batch.update(eventRef, {
          ...event,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Process calendar classes
    for (const classObj of calendarData.classes) {
      if (classObj.id.startsWith('cls-')) {
        // This is a locally created class, add it to Firebase
        const classRef = doc(collection(db, 'calendarClasses'));
        batch.set(classRef, {
          ...classObj,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // This is an existing class, update it
        const classRef = doc(db, 'calendarClasses', classObj.id);
        batch.update(classRef, {
          ...classObj,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Process calendar reminders
    for (const reminder of calendarData.reminders) {
      if (reminder.id.startsWith('rem-')) {
        // This is a locally created reminder, add it to Firebase
        const reminderRef = doc(collection(db, 'calendarReminders'));
        batch.set(reminderRef, {
          ...reminder,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // This is an existing reminder, update it
        const reminderRef = doc(db, 'calendarReminders', reminder.id);
        batch.update(reminderRef, {
          ...reminder,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Commit all changes as a batch
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error syncing calendar data:', error);
    return false;
  }
};