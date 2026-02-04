# Pages Directory

## Purpose
Contains page-level components that compose multiple components and hooks to create full views.

## Contents
- `Dashboard.tsx` - Main dashboard with overview
- `CalendarPage.tsx` - Full calendar view for scheduling
- `TasksPage.tsx` - Task management by subject
- `ProgressPage.tsx` - Marks and progress tracking
- `TimerPage.tsx` - Pomodoro timer page

## Usage
Pages are used by the router and compose the full application views.

## Guidelines
- Pages orchestrate hooks and components
- Pages handle page-level state
- Pages should not contain complex business logic
- All pages must have JSDoc documentation
