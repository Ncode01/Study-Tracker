# ByteLearn Study Tracker - Project Architecture

This document outlines the high-level architecture, data models, and component structure for the ByteLearn Study Tracker application.

## System Architecture

The ByteLearn Study Tracker follows a modern web application architecture with a clear separation of concerns:

```
┌─────────────┐       ┌─────────────┐      ┌─────────────┐
│             │       │             │      │             │
│   Client    │ ◄───► │   Server    │ ◄──► │  Database   │
│  (React)    │       │  (Node.js)  │      │ (MongoDB)   │
│             │       │             │      │             │
└─────────────┘       └─────────────┘      └─────────────┘
```

### Client Architecture

The frontend follows a component-based architecture using React with TypeScript. Redux is used for state management, with a structure organized by feature:

```
client/
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── components/
│   │   ├── common/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── subjects/
│   │   ├── timer/
│   │   ├── analytics/
│   │   ├── gamification/
│   │   └── social/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   └── storage/
│   ├── store/
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── slices/
│   │   └── store.ts
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

### Server Architecture

The backend follows a layered architecture using Node.js with Express:

```
server/
├── config/
├── controllers/
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

## Data Models

### User Model

```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // Hashed
  name: string;
  profilePicture?: string;
  school?: string;
  grade?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: NotificationPreferences;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  goalReminders: boolean;
  streakAlerts: boolean;
  socialActivity: boolean;
}
```

### Subject Model

```typescript
interface Subject {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  colorCode: string;
  isCustom: boolean; // true for user-created, false for system defaults
  goals: {
    weekly: number; // in minutes
    monthly: number; // in minutes
  };
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### StudySession Model

```typescript
interface StudySession {
  _id: ObjectId;
  userId: ObjectId;
  subjectId: ObjectId;
  topicName?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  notes?: string;
  productivityRating?: number; // 1-5 scale
  isManualEntry: boolean; // true if added after the fact
  createdAt: Date;
  updatedAt: Date;
}
```

### Achievement Model

```typescript
interface Achievement {
  _id: ObjectId;
  userId: ObjectId;
  type: string; // e.g., "streak", "milestone", "subject-mastery"
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
  metadata: Record<string, any>; // Additional achievement-specific data
}
```

### Streak Model

```typescript
interface Streak {
  _id: ObjectId;
  userId: ObjectId;
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastStudyDate: Date;
  history: {
    date: Date;
    minutesStudied: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Social Connection Model

```typescript
interface Connection {
  _id: ObjectId;
  requesterId: ObjectId;
  recipientId: ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### Dashboard Layout Model

```typescript
interface DashboardLayout {
  _id: ObjectId;
  userId: ObjectId;
  widgets: {
    id: string;
    type: string; // e.g., "progress", "timer", "streak"
    position: {
      x: number;
      y: number;
      w: number; // width
      h: number; // height
    };
    settings: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Component Structure

### Core Components

#### Authentication Components
- `SignupForm`: Handles user registration
- `LoginForm`: Handles user login
- `PasswordReset`: Manages password recovery
- `AuthGuard`: Higher-order component for protected routes

#### Dashboard Components
- `DashboardLayout`: Container for widget arrangement
- `WidgetGrid`: Implements drag-and-drop functionality
- `Widget`: Base component for all dashboard widgets
  - `ProgressWidget`: Shows study progress
  - `TimerWidget`: Quick access study timer
  - `StreakWidget`: Displays current streak
  - `GoalsWidget`: Shows upcoming goals
  - `RecentActivityWidget`: Lists recent study sessions

#### Subject Management Components
- `SubjectList`: Displays all subjects
- `SubjectCard`: Individual subject display
- `SubjectForm`: Create/edit subject
- `SubjectGoalSetting`: Manages goals for subjects

#### Study Timer Components
- `StudyTimer`: Main timer functionality
- `TimerControls`: Play, pause, reset buttons
- `SessionForm`: Form for session details
- `PomodoroSettings`: Configure pomodoro timings

#### Analytics Components
- `AnalyticsDashboard`: Overview of all analytics
- `StudyCalendar`: Calendar heatmap of study sessions
- `SubjectDistribution`: Chart of time spent by subject
- `TrendAnalysis`: Line charts of study patterns
- `ProductivityInsights`: Analysis of optimal study times

#### Gamification Components
- `StreakTracker`: Visual representation of streaks
- `AchievementGallery`: Display of earned badges
- `CreditScore`: Shows and explains credit rating
- `MilestoneProgress`: Progress toward next milestone

#### Social Components
- `FriendList`: Display of connections
- `FriendRequests`: Manage pending connections
- `Leaderboard`: Rankings based on study metrics
- `PrivacySettings`: Manage sharing preferences

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register`: Create new user
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/reset-password`: Request password reset
- `PUT /api/auth/reset-password/:token`: Set new password
- `GET /api/auth/me`: Get current user

### Subject Endpoints
- `GET /api/subjects`: Get all subjects for user
- `POST /api/subjects`: Create new subject
- `GET /api/subjects/:id`: Get specific subject
- `PUT /api/subjects/:id`: Update subject
- `DELETE /api/subjects/:id`: Archive/delete subject

### Study Session Endpoints
- `GET /api/sessions`: Get all study sessions
- `POST /api/sessions`: Create new session
- `GET /api/sessions/:id`: Get specific session
- `PUT /api/sessions/:id`: Update session
- `DELETE /api/sessions/:id`: Delete session
- `GET /api/sessions/stats`: Get aggregated statistics

### Streak & Achievement Endpoints
- `GET /api/streaks`: Get user streak data
- `GET /api/achievements`: Get user achievements
- `GET /api/credit-score`: Get user credit rating

### Social Endpoints
- `GET /api/connections`: Get user's connections
- `POST /api/connections`: Send connection request
- `PUT /api/connections/:id`: Update connection status
- `DELETE /api/connections/:id`: Remove connection
- `GET /api/leaderboard`: Get leaderboard data

### Dashboard Endpoints
- `GET /api/dashboard/layout`: Get user's dashboard layout
- `PUT /api/dashboard/layout`: Update dashboard layout

## Security Considerations

1. **Authentication**:
   - JWT tokens for stateless authentication
   - Refresh token rotation
   - HTTPS for all communications

2. **Data Protection**:
   - Password hashing with bcrypt
   - Input validation on all endpoints
   - Rate limiting for sensitive operations

3. **Authorization**:
   - Role-based access control
   - Route protection middleware
   - Data ownership validation

## Offline Support Strategy

1. **Service Worker**: 
   - Caching static assets
   - Managing offline access to app shell

2. **IndexedDB**:
   - Storing study sessions locally when offline
   - Syncing with server when connection is restored

3. **State Management**:
   - Optimistic UI updates
   - Conflict resolution for data synced after offline period

## Deployment Architecture

```
                              ┌─────────────┐
                              │             │
                              │    CDN      │
                              │             │
                              └─────▲───────┘
                                    │
┌─────────────┐                ┌────┴────────┐
│             │                │             │
│   Client    │◄───────────────┤   Static    │
│  (Browser)  │                │   Hosting   │
│             │                │             │
└─────▲───────┘                └─────────────┘
      │
      │                        ┌─────────────┐
      │                        │             │
      └────────────────────────►   API       │
                               │   Server    │
                               │             │
                               └─────▲───────┘
                                     │
                               ┌─────┴───────┐
                               │             │
                               │  Database   │
                               │             │
                               └─────────────┘
```

This architecture provides a scalable foundation that can be extended as the application grows, while maintaining clear separation of concerns and following best practices for modern web development.