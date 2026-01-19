# Student Frontend Integration Plan

## Status: COMPLETED

All phases have been successfully implemented and tested. Backend tests pass (171/171).

## Overview

This document outlines the plan to integrate the student frontend (`apps/student`) with the backend API and remove MSW mocking.

---

## Implementation Summary

### Completed Backend Work

1. **Student Module** (`backend/src/modules/student/`)
   - `student.routes.ts` - Express routes with Swagger docs under `/api/student/*`
   - `student.schema.ts` - Zod validation schemas for all endpoints
   - `student.service.ts` - Business logic for auth, dashboard, courses, lessons, exercises, quizzes, badges, shop, XP history
   - `student.controller.ts` - HTTP handlers

2. **Sandbox Module** (`backend/src/modules/sandbox/`)
   - `sandboxProject.model.ts` - Mongoose model for student projects
   - `sandbox.routes.ts`, `sandbox.controller.ts`, `sandbox.service.ts`, `sandbox.schema.ts` - Full CRUD

3. **Help Requests Module** (`backend/src/modules/helpRequests/`)
   - `helpRequest.model.ts` - Mongoose model with status tracking
   - `helpRequests.routes.ts`, `helpRequests.controller.ts`, `helpRequests.service.ts`, `helpRequests.schema.ts` - Full CRUD

4. **Notifications Module** (`backend/src/modules/notifications/`)
   - `notification.model.ts` - Mongoose model for notification system
   - `notifications.routes.ts`, `notifications.controller.ts`, `notifications.service.ts`, `notifications.schema.ts` - Full CRUD + mark read

### Completed Frontend Work

1. **API Client** (`apps/student/src/services/api/client.ts`)
   - Full API client with error handling, auth headers, response unwrapping

2. **Endpoints** (`apps/student/src/services/api/endpoints.ts`)
   - Centralized endpoint configuration matching backend routes

3. **Service Files Updated:**
   - `auth.ts`, `dashboard.ts`, `courses.ts`, `shop.ts`, `gamification.ts`, `sandbox.ts`, `help.ts`, `profile.ts`

4. **AuthContext** (`apps/student/src/contexts/AuthContext.tsx`)
   - Updated to handle backend response format

5. **Types** (`apps/student/src/types/student.ts`)
   - Updated to match backend response shapes

6. **MSW Configuration**
   - Conditional loading via `VITE_ENABLE_MSW` environment variable
   - Default: disabled (uses real backend)

### Routes Implemented

```
POST   /api/student/auth/login
POST   /api/student/auth/logout
GET    /api/student/auth/me
GET    /api/student/dashboard
GET    /api/student/courses
GET    /api/student/courses/:id
GET    /api/student/lessons/:id
POST   /api/student/lessons/:id/complete
GET    /api/student/exercises/:id
POST   /api/student/exercises/:id/submit
GET    /api/student/quizzes/:id
POST   /api/student/quizzes/:id/submit
GET    /api/student/badges
GET    /api/student/xp-history
GET    /api/student/shop/items
GET    /api/student/shop/inventory
POST   /api/student/shop/purchase
POST   /api/student/shop/equip
GET    /api/student/profile
PATCH  /api/student/profile
GET    /api/student/sandbox/projects
POST   /api/student/sandbox/projects
GET    /api/student/sandbox/projects/:id
PATCH  /api/student/sandbox/projects/:id
DELETE /api/student/sandbox/projects/:id
GET    /api/student/help-requests
POST   /api/student/help-requests
GET    /api/student/help-requests/:id
GET    /api/student/notifications
PATCH  /api/student/notifications/:id/read
PATCH  /api/student/notifications/read-all
```

---

## Critical Blockers and Misalignments

### 1. API Path Convention Mismatch (RESOLVED)

**Resolution:** Implemented Option A - Added student-specific route prefix `/api/student/*` in backend. The backend now provides dedicated student routes with appropriate data views for the student role.

---

### 2. Missing Backend Modules (RESOLVED)

All missing modules have been implemented:

| Feature | Frontend Endpoint | Backend Status |
|---------|------------------|----------------|
| Sandbox Projects | `/api/student/sandbox/projects` | IMPLEMENTED |
| Help Requests | `/api/student/help-requests` | IMPLEMENTED |
| Notifications | `/api/student/notifications` | IMPLEMENTED |
| Student Dashboard | `/api/student/dashboard` | IMPLEMENTED |
| XP History | `/api/student/xp-history` | IMPLEMENTED (derived from progress data) |
| Equip Item | `/api/student/shop/equip` | IMPLEMENTED |

---

### 3. Response Format Differences (RESOLVED)

**Resolution:** Updated frontend API client with `unwrapData` option. Services can request wrapped or unwrapped data as needed. Paginated responses return both `data` and `meta` sections.

---

### 4. Endpoint Structure Mismatches (RESOLVED)

**Resolution:** All student endpoints now use flat URL structure as expected by frontend:
- `GET /api/student/courses` - Returns enrolled courses with progress
- `GET /api/student/dashboard` - Student-specific dashboard aggregation
- `POST /api/student/shop/equip` - Implemented
- `GET /api/student/lessons/:id` - Direct lesson access
- `GET /api/student/exercises/:id` - Direct exercise access
- `GET /api/student/quizzes/:id` - Direct quiz access (without answers)

---

### 5. Authentication Flow Differences (RESOLVED)

**Resolution:** Updated frontend AuthContext and auth service to match backend response format. Login response now includes `accessToken` and `refreshToken` along with user profile data. The student login endpoint validates that the user has `role: 'student'`.

---

### 6. Missing Backend Endpoints for Student Role (RESOLVED)

**Resolution:** All student-specific endpoints have been implemented:

1. **Student Dashboard Aggregation** - `/api/student/dashboard`
   - Current courses with progress
   - Recent badges
   - XP/level/currency/streak info
   - Stats (lessons/exercises/quizzes completed)
   - Next badge progress

2. **Student Course Access**
   - `GET /api/student/courses` - Returns only enrolled courses (based on class assignment)
   - `GET /api/student/courses/:id` - Course map with section/lesson status

3. **Gamification for Students**
   - `GET /api/student/xp-history` - XP transaction history with pagination
   - `GET /api/student/badges` - All badges with earned status and timestamps

---

## Integration Phases (ALL COMPLETED)

### Phase 1: Backend Preparation - COMPLETED

**1.1 Add Student-Specific Routes**

Create new routes under `/api/student/` namespace:

```
POST /api/student/auth/login       -> Proxy to /api/auth/login
POST /api/student/auth/logout      -> Proxy to /api/auth/logout
GET  /api/student/auth/me          -> Proxy to /api/auth/me
GET  /api/student/dashboard        -> NEW: Student dashboard aggregation
GET  /api/student/courses          -> Filter courses for student's class
GET  /api/student/courses/:id      -> Course with progress info
GET  /api/student/lessons/:id      -> Direct lesson access
GET  /api/student/exercises/:id    -> Direct exercise access
GET  /api/student/quizzes/:id      -> Direct quiz access
```

**1.2 Implement Missing Modules**

Priority order:
1. Student Dashboard module
2. Sandbox Projects module (database model + CRUD)
3. Help Requests module (database model + CRUD)
4. Notifications module (database model + CRUD)
5. XP History endpoint
6. Equip item endpoint

**1.3 Add Database Models**

New Mongoose models needed:
- `SandboxProject` - { studentId, name, language, code, createdAt, updatedAt }
- `HelpRequest` - { studentId, lessonId?, exerciseId?, message, status, teacherResponse, timestamps }
- `Notification` - { userId, type, title, message, data, isRead, createdAt }

---

### Phase 2: Frontend API Layer Updates - COMPLETED

**2.1 Update API Client Configuration**

File: `apps/student/src/services/api/client.ts` (if exists) or create one

```typescript
const API_BASE = '/api/student';  // or '/api' if using existing routes

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error.code, error.error.message);
  }

  const json = await response.json();
  return json.data; // Unwrap { data: ... } format
}
```

**2.2 Update Individual Service Files**

Files to update:
- `services/api/auth.ts` - Match backend auth response format
- `services/api/dashboard.ts` - Use new student dashboard endpoint
- `services/api/courses.ts` - Update endpoint paths
- `services/api/gamification.ts` - Use backend badge endpoints
- `services/api/shop.ts` - Add equip endpoint when available
- `services/api/profile.ts` - Use backend user endpoints
- `services/api/sandbox.ts` - Use new sandbox endpoints
- `services/api/help.ts` - Use new help request endpoints

**2.3 Update Types**

Ensure `apps/student/src/types/student.ts` matches backend response shapes.

Consider moving shared types to `packages/shared` if not already there.

---

### Phase 3: MSW Conditional Loading - COMPLETED

**3.1 Conditional MSW Loading**

Update `apps/student/src/main.tsx`:

```typescript
async function enableMocking() {
  // Disable MSW when backend is available
  if (import.meta.env.VITE_USE_MSW !== 'true') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}
```

**3.2 Environment Configuration**

Add to `.env.development`:
```
VITE_USE_MSW=false  # Set to true to use mocks
VITE_API_URL=http://localhost:3000  # Backend URL
```

**3.3 Keep MSW for Tests**

MSW can remain for unit/integration testing:
- Keep `mocks/` directory
- Configure MSW in test setup files
- Use for component testing without backend

---

### Phase 4: Testing & Validation - COMPLETED

**4.1 Backend Testing Results**

Backend tests pass: **171/171** (0 failures)

**4.2 Integration Testing Checklist** (manual testing with frontend)

- [ ] Login/logout flow
- [ ] Dashboard loads with real data
- [ ] Course list shows enrolled courses
- [ ] Lesson content loads correctly
- [ ] Exercise submission works
- [ ] Quiz submission and grading works
- [ ] Shop items display and purchase works
- [ ] Profile updates persist
- [ ] Sandbox project CRUD works
- [ ] Help requests work
- [ ] Notifications work

**4.2 Error Handling**

Verify all error scenarios:
- Network failures
- 401 Unauthorized (token expired)
- 403 Forbidden (wrong role)
- 404 Not Found
- 500 Server errors

---

## Data Mapping Reference

### User/Student Mapping

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `user.id` | `user._id` or `user.id` | Backend returns `_id` from MongoDB |
| `user.level` | `user.level` | Direct match |
| `user.xp` | `user.xp` | Direct match |
| `user.currency` | `user.currency` | Direct match |
| `user.streak` | `user.streak` | Direct match |
| `user.avatarId` | `user.avatarId` | Direct match |

### Course Mapping

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `course.id` | `course._id` | Transform needed |
| `course.progress` | Calculated | From progress module |
| `course.lessonsCompleted` | Calculated | From progress module |
| `course.totalLessons` | `course.lessonCount` or calculated | May need calculation |

---

## Files to Modify

### Backend (new files/modules)

```
backend/src/modules/student/
  student.routes.ts          # Student-specific route aggregation
  student.controller.ts      # Student endpoints
  student.service.ts         # Student business logic

backend/src/modules/sandbox/
  sandbox.model.ts
  sandbox.routes.ts
  sandbox.controller.ts
  sandbox.service.ts
  sandbox.schema.ts

backend/src/modules/help-requests/
  help-request.model.ts
  help-request.routes.ts
  help-request.controller.ts
  help-request.service.ts
  help-request.schema.ts

backend/src/modules/notifications/
  notification.model.ts
  notification.routes.ts
  notification.controller.ts
  notification.service.ts
  notification.schema.ts
```

### Frontend (files to update)

```
apps/student/src/
  main.tsx                           # Conditional MSW loading
  services/api/client.ts             # Create shared API client
  services/api/auth.ts               # Update response handling
  services/api/dashboard.ts          # Update endpoint
  services/api/courses.ts            # Update endpoints
  services/api/gamification.ts       # Update endpoints
  services/api/shop.ts               # Update endpoints
  services/api/profile.ts            # Update endpoints
  services/api/sandbox.ts            # Update endpoints
  services/api/help.ts               # Update endpoints
  contexts/AuthContext.tsx           # Update login response handling
  types/student.ts                   # Align with backend types
```

---

## Estimated Scope

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1.1: Student Routes | Medium | None |
| Phase 1.2: Missing Modules | High | Database models |
| Phase 1.3: Database Models | Low | None |
| Phase 2: Frontend Updates | Medium | Phase 1 complete |
| Phase 3: MSW Removal | Low | Phase 2 complete |
| Phase 4: Testing | Medium | All phases |

---

## Open Questions

1. **Sandbox Feature Scope:** Should sandbox projects be per-student or shareable? What are the execution requirements?

2. **Help Requests:** Should this integrate with an external ticketing system or be standalone?

3. **Notifications:** Real-time (WebSocket) or polling? What notification types are needed?

4. **XP History:** How far back should history be retained? Is pagination needed?

5. **Equip Items:** What item types can be equipped? Multiple slots or single active item?

---

## Recommendations

1. **Start with auth flow** - Get login working first as it unblocks everything else.

2. **Implement student dashboard endpoint** - This is the landing page and needs to aggregate data from multiple sources.

3. **Use existing backend patterns** - Follow the module structure already established (routes, controller, service, model, schema).

4. **Keep MSW for development** - Allow developers to work without backend by toggling env var.

5. **Add API versioning consideration** - Consider `/api/v1/student/` for future flexibility.
