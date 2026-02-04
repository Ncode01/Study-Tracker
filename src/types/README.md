# Types Directory

## Purpose
Contains all TypeScript interfaces and type definitions used throughout the application.

## Contents
- `index.ts` - All shared type definitions including:
  - Subject types
  - Task interfaces
  - Study session interfaces
  - Mark/score interfaces
  - Pomodoro timer types
  - Notification types

## Usage
Import types from this directory when defining props, state, or function parameters:
```typescript
import { Task, StudySession, Subject } from '@/types';
```

## Guidelines
- All interfaces should be documented with JSDoc comments
- Use strict typing (avoid `any`)
- Export all types from the index file
