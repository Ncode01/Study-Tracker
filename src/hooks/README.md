# Hooks Directory

## Purpose
Contains custom React hooks that encapsulate business logic and state management.

## Contents
- `useTasks.ts` - Task state management and operations
- `useSessions.ts` - Study session state management
- `useMarks.ts` - Marks/scores state management
- `usePomodoro.ts` - Pomodoro timer logic
- `useNotifications.ts` - Browser notification handling
- `useLocalStorage.ts` - Generic localStorage hook

## Usage
```typescript
import { useTasks } from '@/hooks/useTasks';

const { tasks, addTask, updateTask, deleteTask } = useTasks();
```

## Guidelines
- Hooks contain ALL business logic
- Hooks interact with services for persistence
- Components should only use hooks for data operations
- All hooks must have JSDoc documentation
