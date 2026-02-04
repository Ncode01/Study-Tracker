# Services Directory

## Purpose
Contains all data persistence and external API logic. This is the single source of truth for localStorage operations.

## Contents
- `taskService.ts` - Task CRUD operations and recurring task management
- `sessionService.ts` - Study session CRUD operations
- `markService.ts` - Score/marks persistence
- `notificationService.ts` - Browser notification handling
- `storageService.ts` - Base localStorage service

## Usage
```typescript
import { taskService } from '@/services/taskService';

const tasks = taskService.getAll();
taskService.create(newTask);
```

## Guidelines
- All localStorage access MUST go through services
- Services should handle data validation
- Services should handle error states gracefully
- All methods must have JSDoc documentation
