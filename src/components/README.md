# Components Directory

## Purpose
Contains reusable, presentational React components. Components in this directory should be pure UI with minimal logic.

## Contents
- `common/` - Shared UI components (Button, Modal, Input, etc.)
- `calendar/` - Calendar-related components
- `tasks/` - Task list and task item components
- `timer/` - Pomodoro timer display components
- `charts/` - Progress chart components
- `layout/` - Layout components (Header, Sidebar, etc.)

## Usage
```typescript
import { Button, Modal, TaskItem } from '@/components';
```

## Guidelines
- Components should be presentational only
- Logic should come from hooks passed as props
- All components must have JSDoc documentation
- Use CSS Modules for styling
- Keep components small and focused
