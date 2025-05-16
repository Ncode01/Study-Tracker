// src/utils/migrationUtils.ts

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  doc,
  serverTimestamp,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Helper function to safely get error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error) || 'Unknown error';
}

/**
 * Migrate data from old flat collections to the new subcollection structure
 * 
 * @param userId User ID to migrate
 * @returns Result of the migration
 */
export async function migrateUserData(userId: string): Promise<{
  success: boolean;
  subjectsMigrated: number;
  tasksMigrated: number;
  sessionsMigrated: number;
  errors: any[];
}> {
  const result = {
    success: true,
    subjectsMigrated: 0,
    tasksMigrated: 0,
    sessionsMigrated: 0,
    errors: [] as any[]
  };
  
  try {
    // Get user document to make sure it exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }
    
    // 1. Migrate subjects
    try {
      await migrateSubjects(userId, result);
    } catch (error) {
      console.error('Error migrating subjects:', error);
      result.errors.push({
        type: 'subjects',
        error: getErrorMessage(error)
      });
      result.success = false;
    }
    
    // 2. Migrate tasks
    try {
      await migrateTasks(userId, result);
    } catch (error) {
      console.error('Error migrating tasks:', error);
      result.errors.push({
        type: 'tasks',
        error: getErrorMessage(error)
      });
      result.success = false;
    }
    
    // 3. Migrate logged sessions
    try {
      await migrateSessions(userId, result);
    } catch (error) {
      console.error('Error migrating sessions:', error);
      result.errors.push({
        type: 'sessions',
        error: getErrorMessage(error)
      });
      result.success = false;
    }
    
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    result.success = false;
    result.errors.push({
      type: 'general',
      error: getErrorMessage(error)
    });
    
    return result;
  }
}

/**
 * Migrate subjects from old flat collection to subcollection
 */
async function migrateSubjects(userId: string, result: any): Promise<void> {
  // Define batch for atomic operations
  const batch = writeBatch(db);
  
  // Query all subjects for this user from the old collection
  const subjectsQuery = query(
    collection(db, 'subjects'),
    where('userId', '==', userId),
    limit(500) // Limit to ensure we don't exceed batch size
  );
  
  const subjectsSnapshot = await getDocs(subjectsQuery);
  
  if (subjectsSnapshot.empty) {
    console.log('No subjects to migrate');
    return;
  }
  
  // Process each subject
  subjectsSnapshot.forEach(subjectDoc => {
    const subjectData = subjectDoc.data();
    const subjectId = subjectDoc.id;
    
    // Create new document in subcollection
    const newSubjectRef = doc(collection(db, `users/${userId}/subjects`), subjectId);
    
    // Add to batch with additional fields
    batch.set(newSubjectRef, {
      ...subjectData,
      id: subjectId,
      version: 1,
      archived: false,
      syncStatus: 'synced',
      updatedAt: subjectData.updatedAt || serverTimestamp(),
      createdAt: subjectData.createdAt || serverTimestamp()
    });
    
    result.subjectsMigrated++;
  });
  
  // Commit the batch
  await batch.commit();
}

/**
 * Migrate tasks from old flat collection to subcollection
 */
async function migrateTasks(userId: string, result: any): Promise<void> {
  // Define batch for atomic operations
  const batch = writeBatch(db);
  
  // Query all tasks for this user from the old collection
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    limit(500) // Limit to ensure we don't exceed batch size
  );
  
  const tasksSnapshot = await getDocs(tasksQuery);
  
  if (tasksSnapshot.empty) {
    console.log('No tasks to migrate');
    return;
  }
  
  // Process each task
  tasksSnapshot.forEach(taskDoc => {
    const taskData = taskDoc.data();
    const taskId = taskDoc.id;
    
    // Create new document in subcollection
    const newTaskRef = doc(collection(db, `users/${userId}/tasks`), taskId);
    
    // Add to batch with additional fields
    batch.set(newTaskRef, {
      ...taskData,
      id: taskId,
      version: 1,
      syncStatus: 'synced',
      updatedAt: taskData.updatedAt || serverTimestamp(),
      createdAt: taskData.createdAt || serverTimestamp(),
      completedAt: taskData.completed ? (taskData.completedAt || serverTimestamp()) : null
    });
    
    result.tasksMigrated++;
  });
  
  // Commit the batch
  await batch.commit();
}

/**
 * Migrate logged sessions from old flat collection to subcollection
 */
async function migrateSessions(userId: string, result: any): Promise<void> {
  // Define batch for atomic operations
  const batch = writeBatch(db);
  
  // Query all sessions for this user from the old collection
  const sessionsQuery = query(
    collection(db, 'loggedSessions'),
    where('userId', '==', userId),
    limit(500) // Limit to ensure we don't exceed batch size
  );
  
  const sessionsSnapshot = await getDocs(sessionsQuery);
  
  if (sessionsSnapshot.empty) {
    console.log('No sessions to migrate');
    return;
  }
  
  // Process each session
  sessionsSnapshot.forEach(sessionDoc => {
    const sessionData = sessionDoc.data();
    const sessionId = sessionDoc.id;
    
    // Create new document in subcollection
    const newSessionRef = doc(collection(db, `users/${userId}/loggedSessions`), sessionId);
    
    // Add to batch with additional fields
    batch.set(newSessionRef, {
      ...sessionData,
      id: sessionId,
      version: 1,
      syncStatus: 'synced',
      updatedAt: sessionData.updatedAt || serverTimestamp(),
      createdAt: sessionData.createdAt || serverTimestamp()
    });
    
    result.sessionsMigrated++;
  });
  
  // Commit the batch
  await batch.commit();
}

/**
 * Add version fields to all existing documents
 * 
 * @param userId User ID to update
 * @returns Result of the update
 */
export async function addVersionFields(userId: string): Promise<{
  success: boolean;
  docsUpdated: number;
  errors: any[];
}> {
  const result = {
    success: true,
    docsUpdated: 0,
    errors: [] as any[]
  };
  
  try {
    // Define batch for atomic operations
    const batch = writeBatch(db);
    
    // Update subjects
    const subjectsQuery = query(
      collection(db, `users/${userId}/subjects`),
      limit(500)
    );
    
    const subjectsSnapshot = await getDocs(subjectsQuery);
    subjectsSnapshot.forEach(doc => {
      if (!doc.data().version) {
        batch.update(doc.ref, {
          version: 1,
          updatedAt: doc.data().updatedAt || serverTimestamp()
        });
        result.docsUpdated++;
      }
    });
    
    // Update tasks
    const tasksQuery = query(
      collection(db, `users/${userId}/tasks`),
      limit(500)
    );
    
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach(doc => {
      if (!doc.data().version) {
        batch.update(doc.ref, {
          version: 1,
          updatedAt: doc.data().updatedAt || serverTimestamp()
        });
        result.docsUpdated++;
      }
    });
    
    // Update sessions
    const sessionsQuery = query(
      collection(db, `users/${userId}/loggedSessions`),
      limit(500)
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    sessionsSnapshot.forEach(doc => {
      if (!doc.data().version) {
        batch.update(doc.ref, {
          version: 1,
          updatedAt: doc.data().updatedAt || serverTimestamp()
        });
        result.docsUpdated++;
      }
    });
    
    // Commit the batch
    await batch.commit();
    
    return result;
  } catch (error) {
    console.error('Error adding version fields:', error);
    result.success = false;
    result.errors.push({
      type: 'general',
      error: getErrorMessage(error)
    });
    
    return result;
  }
}
