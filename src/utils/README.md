# Utils Directory

## Purpose
Contains pure utility functions that are reusable across the application.

## Contents
- `dateUtils.ts` - Date formatting and manipulation using date-fns
- `idUtils.ts` - Unique ID generation
- `validationUtils.ts` - Form and data validation helpers
- `storageUtils.ts` - Low-level localStorage helpers

## Usage
```typescript
import { formatDate, generateId, validateTask } from '@/utils';
```

## Guidelines
- All functions must be pure (no side effects)
- All functions must have JSDoc documentation
- Include unit-testable logic only
- No React imports allowed in this directory
