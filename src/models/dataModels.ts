// src/models/dataModels.ts

/**
 * Improved data models for StudyQuest application with enhanced Firebase integration
 * These models are designed to improve data consistency between local state and Firebase
 * with proper versioning and synchronization support
 */

import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

/**
 * Common fields that all entities will share
 */
export interface BaseEntity {
  id: string;
  version: number;
  createdAt: Date | FirebaseTimestamp;
  updatedAt: Date | FirebaseTimestamp;
}

/**
 * Sync status for tracking items in the synchronization queue
 */
export type SyncStatus = 'synced' | 'pending' | 'conflict';

/**
 * Enhanced user profile model
 */
export interface User extends BaseEntity {
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
  points: number;
  lastSyncedAt: Date | FirebaseTimestamp;
  streakData: StreakData;
  preferences?: UserPreferences;
}

/**
 * User customizable preferences
 */
export interface UserPreferences {
  theme: string;
  notifications: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

/**
 * Streak data for gamification
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | FirebaseTimestamp | null;
}

/**
 * Study subject model
 */
export interface Subject extends BaseEntity {
  userId: string;
  name: string;
  color: string;
  targetHours: number;
  archived: boolean;
  syncStatus?: SyncStatus;
  stats?: SubjectStats;
}

/**
 * Computed statistics for subjects
 */
export interface SubjectStats {
  totalHours: number;
  lastStudied: Date | FirebaseTimestamp | null;
  sessionCount: number;
}

/**
 * Task model
 */
export interface Task extends BaseEntity {
  userId: string;
  subjectId: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | FirebaseTimestamp;
  completedAt?: Date | FirebaseTimestamp;
  syncStatus?: SyncStatus;
  tags?: string[];
}

/**
 * Study session log model
 */
export interface LoggedSession extends BaseEntity {
  userId: string;
  subjectId: string;
  taskId?: string;
  startTime: Date | FirebaseTimestamp;
  endTime: Date | FirebaseTimestamp;
  durationMinutes: number;
  notes?: string;
  syncStatus?: SyncStatus;
  focusScore?: number;
  distractionsLogged?: number;
  tasksCompleted?: string[];
  materials?: string[];
  tags?: string[];
}

/**
 * Queue item for tracking pending sync operations
 */
export type Operation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string;
  operation: Operation;
  collectionPath: string;
  entityId: string;
  data?: any;
  timestamp: number;
  attempts: number;
  lastAttempt?: number;
}

/**
 * Queue item for tracking failed operations for retry
 */
export interface RetryQueueItem {
  id: string;
  attempts: number;
  nextRetry: number;
  lastError?: any;
  operation: () => Promise<any>;
  errorMessage: string;
  error: any;
  timestamp: number;
}

/**
 * App sync status for UI display
 */
export interface AppSyncStatus {
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncState: 'idle' | 'syncing' | 'error' | 'offline';
  errors: SyncError[];
}

/**
 * Sync error description
 */
export interface SyncError {
  id: string;
  message: string;
  timestamp: Date;
  entityType: string;
  entityId: string;
  retryable?: boolean;
}
