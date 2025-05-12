// src/store/appStore.ts
import { create } from 'zustand';
import type { Subject, Task, LoggedSession } from '../types';

interface AppState {
  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
  points: number;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (taskId: string) => void;
  logSession: (session: Omit<LoggedSession, 'id'>) => void;
  // Add other actions: deleteSubject, deleteTask, etc.
}

let subjectIdCounter = 2; // Start from 2 because we have initial data
let taskIdCounter = 3; // Start from 3 because we have initial data
let sessionIdCounter = 1;

// Initial demo data
const initialSubjects: Subject[] = [
  { id: 'subj-0', name: 'Mathematics', color: '#FF5252', targetHours: 10 },
  { id: 'subj-1', name: 'Programming', color: '#42A5F5', targetHours: 15 },
];

const initialTasks: Task[] = [
  { 
    id: 'task-0', 
    subjectId: 'subj-0', 
    description: 'Practice calculus problems', 
    completed: false, 
    createdAt: new Date(),
    priority: 'high' 
  },
  { 
    id: 'task-1', 
    subjectId: 'subj-1', 
    description: 'Learn React hooks', 
    completed: false, 
    createdAt: new Date(),
    priority: 'medium' 
  },
  { 
    id: 'task-2', 
    subjectId: 'subj-1', 
    description: 'Build a small project', 
    completed: false, 
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3) // 3 days from now
  },
];

export const useAppStore = create<AppState>((set) => ({
  subjects: initialSubjects,
  tasks: initialTasks,
  loggedSessions: [],
  points: 0,

  addSubject: (subjectData) =>
    set((state) => ({
      subjects: [...state.subjects, { ...subjectData, id: `subj-${subjectIdCounter++}` }],
    })),

  addTask: (taskData) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { ...taskData, id: `task-${taskIdCounter++}`, completed: false, createdAt: new Date() },
      ],
    })),

  toggleTask: (taskId) =>
    set((state) => {
      let pointsEarned = 0;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          if (!task.completed) pointsEarned = 10; // Award 10 points for completion
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return { tasks: updatedTasks, points: state.points + pointsEarned };
    }),

  logSession: (sessionData) =>
    set((state) => ({
      loggedSessions: [...state.loggedSessions, { ...sessionData, id: `sess-${sessionIdCounter++}` }],
      points: state.points + Math.floor(sessionData.durationMinutes / 10) // 1 point per 10 mins
    })),
}));