# Silver Edge Academy - LMS Specification

## Overview

Silver Edge Academy is a Learning Management System (LMS) designed to teach children coding through an engaging, gamified experience. The platform supports multiple age cohorts with a unified interface, featuring teacher-authored content, browser-based code execution, and a comprehensive rewards system.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Admin Frontend | React, Vite, TypeScript |
| Student Frontend | React, Vite, TypeScript |
| Backend | Express, TypeScript, Bun runtime |
| Database | PostgreSQL |
| File Storage | S3-compatible (MinIO) |
| Reverse Proxy | Nginx |
| Code Execution | Browser-based (Pyodide for Python, native JavaScript) |
| Deployment | Docker Compose (self-hosted MVP) |

---

## User Roles & Authentication

### Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access: user management, configuration, analytics, shop management, badge creation |
| **Teacher** | Course creation, student management, progress tracking, attendance |
| **Parent** | Linked to student account for administrative purposes (no portal access) |
| **Student** | Learning, exercises, projects, gamification participation |

### Role Constraints

- **One role per account**: Each email/student number corresponds to exactly one role. A parent who is also a teacher needs two separate accounts.
- **Required parent linkage**: Each student must have at least one parent account linked. Multiple parents are allowed (e.g., both parents can have accounts).
- **Parent portal deferred**: Parent records exist for data linkage but parent-facing features are post-MVP.

### Authentication

| User Type | Method |
|-----------|--------|
| Students | Username OR email + password |
| Teachers/Admins | Email + password (with email verification required before first login) |

**Student Login Options**:
- Students can register/login with either a username OR an email address
- Email is optional for students (supports younger children without email)
- If email is provided, it can be used for password recovery

**Student Username Rules** (if using username):
- Alphanumeric characters only (letters, numbers, underscores)
- No spaces or special characters
- Minimum 3 characters, maximum 20 characters

**Password Requirements**:
- All users: Minimum 8 characters with basic complexity requirements
- Secure hashing with bcrypt (cost factor 12+) or argon2

**Password Reset**:
- Students: Teacher or admin must reset (no self-service)
- Teachers/Admins: Self-service via email

No SSO integration for MVP.

---

## Data Model Overview

### Core Entities

```
Organization (single tenant - no multi-tenancy)
├── Users
│   ├── Admins
│   ├── Teachers
│   ├── Parents
│   │   └── Child (Student) - at least one parent required, multiple allowed
│   └── Students
├── Courses (language-specific: Python OR JavaScript)
│   └── Sections
│       └── Lessons
│           ├── Content Blocks (multimedia)
│           ├── Exercises (code challenges)
│           └── Quizzes
├── Classes
│   ├── Teacher (assigned)
│   ├── Students (enrolled) - one class per student
│   └── Course Assignments
├── Gamification
│   ├── XP/Levels (global per student, exponential curve)
│   ├── Badges (admin-defined, simple triggers)
│   ├── Currency (no controls, accumulates forever)
│   └── Shop Items (configurable persistence)
└── Attendance Records (Present/Absent/Late)
```

### Key Relationships

- Each student belongs to exactly **one class** at a time
- Each student can have at most **one parent** linked
- Teachers can manage multiple classes
- Classes are assigned one or more courses
- Students accumulate global XP (no resets, no school year system)
- Lesson unlock status is per-class (teacher-controlled)
- Courses are visible to all teachers (organization library model)

---

## Admin Portal

### User Management

- **Teachers**: Create, edit, deactivate, reset passwords
- **Parents**: Create, edit, manage linked child
- **Students**: Create, edit, transfer between classes (with restrictions), archive
- Password reset functionality for all user types
- No bulk import (manual entry only for MVP)

### System Configuration

- Gamification settings (XP values per activity type)
- XP level thresholds (exponential curve - each level requires more than previous)
- Feature toggles
- Default editor settings
- Resource limits for code execution

### Badge Management

- Admin creates badges with custom criteria
- **Simple trigger system**: One trigger per badge (e.g., "complete 10 exercises")
- No complex AND/OR logic
- Teachers cannot create badges

### Shop Management

- Create/edit/delete shop items
- Set prices (virtual currency)
- **Item persistence**: Configurable per item (permanent or consumable)
- Categories: avatar presets, UI themes, editor themes
- **Dark mode is purchasable**: No free light/dark toggle; all themes are shop items
- Teacher-defined custom rewards (created per-class)
- All items equal availability (no rarity tiers, no rotating stock)

### Analytics Dashboard

- School-wide aggregate metrics only
- Active users over time
- Course completion rates
- System usage statistics
- **Teacher metrics**: Teachers see their own stats; admins see aggregates only (no individual teacher performance visible to admins)

---

## Teacher Portal

### Course Management

#### Organization Library Model
- All courses visible to all teachers in the organization
- Any teacher can clone and modify their own copy
- Course-level language setting (entire course is Python OR JavaScript, not mixed)

#### Structure
```
Course (single language: Python or JavaScript)
├── Section 1
│   ├── Lesson 1.1
│   ├── Lesson 1.2
│   └── Lesson 1.3
├── Section 2
│   └── ...
└── Section N
```

#### Course Deletion
- **Blocked if assigned**: Cannot delete courses assigned to any class
- Must unassign from all classes before deletion

#### Lesson Authoring

**Editor Type**: Markdown with predefined embed types (no raw HTML)

**Supported Content Types**:
- Rich text via Markdown (headings, lists, formatting)
- Images (upload or URL)
- Videos (YouTube/Vimeo embeds, direct upload) - **view started tracking enabled**
- Audio files
- GIFs
- PDFs
- File attachments
- Code blocks (syntax highlighted)
- Interactive code exercises
- Quizzes

**Lesson Structure**:
- Lessons can contain content, exercises, AND quizzes in any order
- Teacher defines sequential order of all elements
- No fixed pattern enforced

**Lesson Cloning**:
- Full cloning supported: Any lesson can be cloned to any course
- Enables efficient reuse of similar content

**Workflow**:
1. Create/edit lesson in draft mode
2. Preview changes
3. Publish to make available
4. Unpublish to hide/revise

**Per-Lesson Settings**:
- Code mode: Visual (Blockly), Text, or Mixed
- Editor complexity level (controls visible features)
- Optional starter code template (fully editable by students)
- Lock/unlock status (per-class)

**Concurrent Editing**:
- **Pessimistic locking**: When a teacher is editing, others see "locked by X"
- Must wait for lock release or request unlock

### Exercise Builder

**Exercise Types**:
- Free-form coding (open sandbox)
- Guided challenges (with test cases)
- Project-based (multi-file, longer duration)

**Configuration**:
- Language inherited from course (JavaScript or Python)
- Visual/text mode toggle
- Starter code (optional, fully editable by students)
- Test cases (hidden from students)
- Expected output validation
- Instructions/prompt

**Test Validation**:
- **Count shown**: Students see "Passed 3/5 tests" but not which ones failed
- All test cases must pass for completion

**Teacher Test View**:
- **Dual view available**: Teachers can toggle between "student view" and "debug view"
- Debug view shows detailed error info

### Quiz Builder

**Question Types**:
- Multiple choice (single answer)
- Multiple choice (multiple answers) - **partial credit scoring**
- True/False
- Code output ("What does this code print?")
- Fill-in-the-blank code - **flexible whitespace matching** (normalized)
- Parsons problems (drag-to-reorder code blocks) - **unlabeled blocks** (no line numbers)

**Settings**:
- Points per question
- **Teacher-controlled retake limit** (1, 3, unlimited, etc.)
- Randomize question order (optional) - **per-attempt randomization**
- Randomize answer order (optional) - **per-attempt randomization**

**Scoring**:
- Multiple-answer questions: **Partial credit** (correct selections minus incorrect, can't go negative)
- **XP awarded on first attempt only** (retakes don't award additional XP)

### Class Management

- Create classes (no size limit)
- Assign courses to classes
- Enroll/remove students
- View class roster

**Student Transfer**:
- **Progress reset on transfer**: When a student transfers to a new class, all course progress is reset
- Student starts fresh in the new class

### Content Unlocking

- **Granularity**: Lesson-level
- **Method**: Manual unlock by teacher (no due dates)
- Teachers unlock content when class is ready
- **Student visibility**: All sections/lessons visible with lock icons (shows full course scope)
- No automatic unlocking or prerequisite chains

### Student Progress Tracking

**Basic Progress**:
- Lesson completion status with **completion date**
- Quiz scores
- Exercise completion
- Overall course progress percentage - **weighted calculation** (partial lesson progress reflected)

**Progress Calculation**:
- If lesson has 4 exercises and 2 done, lesson counts as 50% complete
- Overall progress reflects partial completion

**Note**: No time tracking (removed from MVP)

### Attendance Management

- **Type**: In-person check-in (manual)
- **Three statuses**: Present, Absent, Late
- Record absence reasons (for absences only)
- View attendance history
- Attendance reports

### Student Impersonation

- View platform exactly as specific student sees it
- Test exercises/quizzes (results not saved)
- Debug student-reported issues
- Verify content unlock status
- **No logging**: Impersonation sessions are not tracked/auditable

### Teacher-Defined Rewards

- Create custom shop items for their classes
- Examples: homework pass, extra credit, special privileges
- Set currency cost
- Mark as permanent or consumable (one-time use)

**Fulfillment Workflow**:
- Purchase creates pending request in teacher's queue
- Teacher sees queue of pending reward purchases
- Teacher marks as "fulfilled" when physically delivered
- **Orphan handling**: If teacher leaves, pending rewards stay pending for new teacher/admin to handle

### Notifications

- Email notifications for:
  - Student help requests (flags)
  - Weekly progress summary (optional)
  - Attendance alerts
- In-app notification center
- **No announcements/broadcast feature**: Communication happens outside system

---

## Student Portal

### Dashboard

**Primary Focus**: Progress overview

**Components**:
- Current level and XP progress bar
- Currency balance
- Recent badges earned (with **animation effect** on new badges)
- Active courses with progress indicators
- Continue where left off (most recent lesson)
- Pending help requests status

### Learning Experience

#### Course Navigation
- Visual course map showing **all sections and lessons** (including locked)
- Lock icons for unavailable content
- Completion checkmarks
- Current position indicator

#### Lesson View
- Multimedia content rendering
- Embedded exercises
- Clear progression through content
- **Auto-complete**: Lesson marked complete automatically when all required elements done

#### Code Editor

**Modes** (teacher-controlled per lesson):
- Visual (Blockly) - drag-and-drop blocks
- Text - traditional code editor
- Mixed - side-by-side blocks and generated code

**Features**:
- Syntax highlighting
- **Theme selection**: Purchasable themes only (no free dark mode)
- **Full undo/redo** (Ctrl+Z/Y with history)
- Run code button
- Clear output button
- Reset to starter code
- **Preferences synced**: Theme and settings stored in database, same across devices

**Complexity Levels** (teacher-controlled):
- Simplified: Large buttons, minimal UI, limited features
- Standard: Full editor with common features
- Advanced: All features including keyboard shortcuts

#### Code Execution

**Environment**:
- JavaScript: Native browser execution
- Python: Pyodide (WebAssembly)

**Graphical Output**:
- **Canvas support**: HTML5 canvas API available for JavaScript
- Python: Simple drawing library wrapper provided
- Enables visual/graphical programming projects

**Browser Dialogs**:
- **Allowed**: alert(), prompt(), confirm() work in sandbox
- Students can experiment with user interaction

**Python Module Restrictions**:
- **Minimal blocking**: Only block obvious security risks (os, sys, subprocess, socket)
- Most standard library modules available

**Limits**:
- Execution timeout: 7 seconds
- Memory quota: Enforced via browser limits
- **No rate limiting**: Students can run code as often as they want
- Clear error messaging on timeout/memory exceeded

**Pyodide Loading**:
- **Blocking load**: Show loading indicator, student waits until ready
- ~10MB initial load

**Error Handling**:
- Raw compiler/interpreter output displayed
- Error location highlighted in editor (where possible)
- If Pyodide fails to load: error message with retry suggestion

**Offline Handling**:
- **No offline indicator**: If submit fails, show error; student figures out it's network

#### Exercise Flow
1. Read instructions
2. Write code in editor (fully editable, including starter code)
3. Run code to see output
4. Submit for validation
5. See test count feedback ("Passed 3/5 tests")
6. On pass: XP awarded, lesson progress updated
7. On fail: Try again (unlimited attempts)

**Submission Storage**:
- **Last 5 attempts stored** regardless of pass/fail
- Teachers can review recent submission history
- Students **cannot view their own submission history** (only current code)

#### When Stuck
- "Ask Teacher for Help" button
- **Context captured**: Current code state, exercise info, and student message automatically included
- **Single pending request**: Student can only have one pending help request at a time
- Must wait for teacher response before submitting another request
- Student continues other work while waiting
- Notification when teacher responds
- **No automatic timeout**: Request stays pending until teacher responds

**Help Response Format**:
- Teachers respond with **Markdown** (including code blocks)
- No attachments or rich media in responses

### Quizzes

- Question-by-question or all-at-once (quiz setting)
- **Randomization per attempt**: Different order each time quiz is taken
- Submit for grading
- Immediate score feedback
- **XP on first attempt only**: Retakes don't award additional XP
- **Teacher-controlled retake limit**

### Sandbox Mode

- Free-form coding environment
- No validation or requirements
- Save work for later (maximum 50 sandbox projects)
- Experiment and build projects

### Gamification

#### XP & Levels

- **Scope**: Global (across all courses)
- **No resets**: XP accumulates forever (no school year system)
- **Sources**: Lesson completion, exercise completion, quiz scores (first attempt only)
- **Values**: Admin-configurable per activity type
- **Level progression**: **Exponential curve** (each level requires more XP than previous)

#### Login Streaks

- **Tracked**: Consecutive days with any activity
- Used for streak-based badge triggers (e.g., "7-day streak")

#### Badges

- **Admin-defined only**: Teachers cannot create badges
- **Simple triggers**: One trigger per badge (no complex conditions)
- Achievement-based unlocks
- Examples:
  - "First Steps" - Complete first lesson
  - "Bug Squasher" - Pass 10 exercises
  - "Python Pioneer" - Complete first Python course
  - "Streak Master" - 7-day login streak
- **Notification**: Animation effect when badge earned
- Displayed on profile

#### Currency

- Earned alongside XP
- Conversion rate: Admin-configurable
- Spent in shop
- Balance visible on dashboard
- **No economic controls**: Currency accumulates forever; admins manually adjust prices if needed

#### Shop

**Categories**:
- Avatar presets (characters to represent student)
- UI themes (all themes purchasable, including dark mode)
- Editor themes (syntax highlighting color schemes)
- Teacher-defined rewards (per-class)

**Item Persistence**:
- **Configurable per item**: Admin/teacher marks item as permanent or consumable
- Permanent: Owned forever after purchase
- Consumable: One-time use (e.g., homework pass)

**Purchasing**:
- Browse available items
- View price in currency
- Purchase (instant application for themes)
- View owned items

### Avatar System

- Preset avatar library
- **System default avatar** assigned to all new students
- Select from available (default + purchased)
- Displayed on profile
- **No leaderboards**: Completely individual progress; students only see their own stats
- No custom image upload

### Profile

- **Display name**: Student-editable (can change anytime)
- Avatar
- Level and XP
- Badge showcase
- Stats (lessons completed, exercises passed, etc.)

---

## Code Execution System

### Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
├─────────────────────────────────────────────┤
│  JavaScript        │  Python (Pyodide)      │
│  Native execution  │  WebAssembly runtime   │
│  + Canvas API      │  ~10MB initial load    │
├─────────────────────────────────────────────┤
│  Shared: Output capture, timeout enforcement │
│  Canvas support for graphical output         │
└─────────────────────────────────────────────┘
```

### JavaScript Execution

- Direct `eval()` in sandboxed iframe
- Console output captured
- Timeout via `setTimeout` wrapper
- **Canvas API available** for graphical output
- **Dialogs allowed**: alert/prompt/confirm work

### Python Execution (Pyodide)

- **Blocking load** on first Python lesson (show loading indicator)
- Cache in browser for session
- Standard library available
- **Minimal blocking**: Only block os, sys, subprocess, socket
- Common packages: numpy (if size permits)
- Output via stdout capture
- Simple drawing library wrapper for canvas-like graphics

### Safety Measures

| Measure | Value |
|---------|-------|
| Execution timeout | 7 seconds |
| Memory limit | Browser-enforced sandbox |
| Network access | Blocked |
| File system access | Virtual only |
| Infinite loop protection | Timeout kills execution |
| Rate limiting | None |

### Error Handling

- Syntax errors: Show raw error with line number
- Runtime errors: Show stack trace
- Timeout: "Execution timed out. Check for infinite loops."
- Memory: "Memory limit exceeded."
- Pyodide load failure: "Python environment failed to load. Please refresh or try a different browser."

---

## Visual Coding (Blockly)

### Integration

- Blockly workspace for visual programming
- Teacher enables per-lesson
- **Language-specific code generation**: Generates JavaScript OR Python depending on course language
- Option to show generated code alongside blocks

### Block Categories

- Logic (if/else, comparisons)
- Loops (for, while, repeat)
- Math (arithmetic, random)
- Text (strings, concatenation)
- Variables
- Functions
- Lists
- Custom blocks (teacher-defined, future enhancement)

### Transition to Text

- Mixed mode shows blocks + generated code
- Students see correlation
- Gradual shift to text-only lessons

---

## Notifications System

### In-App Notifications

**All Users**:
- Account-related alerts

**Students**:
- Help request responses
- Badge unlocks (with animation)
- Level ups
- New content unlocked

**Teachers**:
- Student help requests
- Pending reward purchase queue

**No Announcements Feature**: All broadcast communication handled outside system.

### Email Notifications

**Teachers Only** (for MVP):
- Student help request alerts
- Weekly progress summary (optional)
- Attendance alerts

**Configuration**:
- Teachers can configure email preferences
- Admins can set default notification settings

---

## File Storage

### S3-Compatible Storage (MinIO)

**Stored Items**:
- Lesson media (images, videos, audio, PDFs)
- Avatar images (preset library)
- Theme assets
- Sandbox project snapshots

**Organization**:
```
bucket/
├── lessons/
│   └── {lesson_id}/
│       └── {filename}
├── sandbox/
│   └── {student_id}/
│       └── {project_id}/
├── avatars/
│   └── presets/
└── themes/
```

**Limits**:
- Max file size: 50MB (configurable)
- Allowed types: images (jpg, png, gif), video (mp4, webm), audio (mp3, wav), documents (pdf)

---

## API Design

### Architecture Style

RESTful API with Express

### Authentication

- JWT tokens
- Access token (short-lived, 15 min)
- Refresh token (long-lived, 7 days)
- Role-based access control (RBAC)
- **Email verification required** for teachers/admins before first login

### Key Endpoints

```
Auth
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/verify-email

Users
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id

Courses
GET    /courses
POST   /courses
GET    /courses/:courseId
PUT    /courses/:courseId
DELETE /courses/:courseId (blocked if assigned to classes)
POST   /courses/:courseId/clone

Sections (nested under courses)
GET    /courses/:courseId/sections
POST   /courses/:courseId/sections
GET    /courses/:courseId/sections/:sectionId
PATCH  /courses/:courseId/sections/:sectionId
DELETE /courses/:courseId/sections/:sectionId (blocked if has lessons)
PATCH  /courses/:courseId/sections/reorder

Lessons (nested under sections)
GET    /courses/:courseId/sections/:sectionId/lessons
POST   /courses/:courseId/sections/:sectionId/lessons
GET    /courses/:courseId/sections/:sectionId/lessons/:lessonId
PATCH  /courses/:courseId/sections/:sectionId/lessons/:lessonId
DELETE /courses/:courseId/sections/:sectionId/lessons/:lessonId
POST   /courses/:courseId/sections/:sectionId/lessons/:lessonId/publish
POST   /courses/:courseId/sections/:sectionId/lessons/:lessonId/unpublish
POST   /courses/:courseId/sections/:sectionId/lessons/:lessonId/clone
POST   /courses/:courseId/sections/:sectionId/lessons/:lessonId/duplicate
PATCH  /courses/:courseId/sections/:sectionId/lessons/reorder
POST   /courses/:courseId/sections/:sectionId/lessons/:lessonId/lock
DELETE /courses/:courseId/sections/:sectionId/lessons/:lessonId/lock

Exercises
GET    /exercises/:id
POST   /exercises/:id/submit
GET    /exercises/:id/submissions (last 5, teacher only)

Quizzes
GET    /quizzes/:id
POST   /quizzes/:id/submit
GET    /quizzes/:id/results

Classes
GET    /classes
POST   /classes
GET    /classes/:id
PUT    /classes/:id
GET    /classes/:id/students
POST   /classes/:id/students
DELETE /classes/:id/students/:studentId
POST   /classes/:id/unlock-lesson/:lessonId
POST   /classes/:id/transfer-student (resets all progress)

Progress
GET    /students/:id/progress
GET    /students/:id/progress/course/:courseId

Attendance
GET    /classes/:id/attendance
POST   /classes/:id/attendance
PUT    /attendance/:id

Gamification
GET    /students/:id/xp
GET    /students/:id/badges
GET    /students/:id/currency
GET    /students/:id/streaks
GET    /shop/items
POST   /shop/purchase
GET    /teachers/:id/pending-rewards
PUT    /rewards/:id/fulfill

Help Requests
POST   /help-requests (with code snapshot)
GET    /teachers/:id/help-requests
PUT    /help-requests/:id/respond (Markdown)

Analytics
GET    /analytics/school (aggregates only)
GET    /analytics/teacher/me (self-view)
GET    /analytics/class/:id
GET    /analytics/student/:id

Badges (Admin)
GET    /badges
POST   /badges
PUT    /badges/:id
DELETE /badges/:id
```

---

## Database Schema (Core Tables)

```sql
-- Users and Auth
users (
  id, email, password_hash, role, display_name,
  avatar_id, email_verified, created_at, updated_at
)

students (
  id, user_id, student_number, parent_id,
  current_level, total_xp, currency_balance,
  current_streak_days, last_activity_date,
  preferences_json -- synced theme/editor settings
)

parents (
  id, user_id
)

teachers (
  id, user_id
)

-- Organization
classes (
  id, name, teacher_id, created_at
)

class_students (
  class_id, student_id, enrolled_at
  -- constraint: student can only be in one class
)

class_courses (
  class_id, course_id, assigned_at
)

-- Curriculum
courses (
  id, title, description, language, -- 'javascript' or 'python'
  created_by, status, created_at, updated_at
)

sections (
  id, course_id, title, order_index
)

lessons (
  id, section_id, title, content_json,
  code_mode, editor_complexity, starter_code,
  status, order_index, locked_by, locked_at,
  created_at, updated_at
)

lesson_unlocks (
  id, lesson_id, class_id, unlocked_at, unlocked_by
)

exercises (
  id, lesson_id, instructions, order_index,
  starter_code, test_cases_json, xp_value
)

quizzes (
  id, lesson_id, questions_json, xp_value,
  max_attempts, order_index
)

-- Progress
lesson_progress (
  id, student_id, lesson_id, status,
  completion_percentage, -- for weighted calculation
  started_at, completed_at
)

exercise_submissions (
  id, student_id, exercise_id, code,
  tests_passed, tests_total, passed, submitted_at
  -- keep last 5 per student per exercise
)

quiz_submissions (
  id, student_id, quiz_id, answers_json,
  score, attempt_number, is_first_attempt,
  submitted_at
)

video_views (
  id, student_id, lesson_id, video_id,
  view_started_at
)

-- Attendance
attendance_records (
  id, class_id, student_id, date,
  status, -- 'present', 'absent', 'late'
  absence_reason, marked_by
)

-- Gamification
badges (
  id, name, description, icon_url,
  trigger_type, trigger_value, -- simple trigger system
  created_by, created_at
)

student_badges (
  student_id, badge_id, earned_at
)

xp_transactions (
  id, student_id, amount, source_type,
  source_id, is_first_attempt, created_at
)

shop_items (
  id, name, description, category, price,
  asset_url, is_permanent, -- true = permanent, false = consumable
  created_by, is_teacher_reward, class_id
)

purchases (
  id, student_id, item_id, purchased_at,
  fulfilled_at, fulfilled_by -- for teacher rewards
)

-- Sandbox Projects
sandbox_projects (
  id, student_id, title, description,
  code, output_snapshot, language, created_at, updated_at
)

-- Help
help_requests (
  id, student_id, exercise_id, message,
  code_snapshot, -- captured automatically
  status, created_at, responded_at, response_markdown
)
```

---

## UI/UX Guidelines

### Design Principles

1. **Single UI for all ages**: Design for the youngest users, remains usable for older
2. **Large touch targets**: Minimum 44px for interactive elements
3. **Clear visual hierarchy**: Obvious primary actions
4. **Consistent navigation**: Same patterns across all sections
5. **Minimal cognitive load**: One primary task per screen
6. **LTR only**: Design for left-to-right languages only (no RTL support)

### Visual Style

- Clean, modern aesthetic
- Bright but not overwhelming colors
- Clear typography (readable at various sizes)
- Iconography with labels (not icons alone)
- Progress visualization (bars, percentages, visual indicators)
- **Badge animation effects** when earned

### Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| < 768px | Mobile phones |
| 768px - 1024px | Tablets (primary classroom device) |
| > 1024px | Desktop/laptop |

### Key Screens

**Student**:
- Dashboard (progress-focused, badge animations)
- Course view (all lessons visible, locked items shown)
- Lesson view (content + exercises, auto-complete)
- Code editor (full-screen capable, undo/redo)
- Sandbox (free coding environment)
- Shop (all themes purchasable)
- Profile (editable display name)

**Teacher**:
- Dashboard (class overview)
- Class management
- Lesson editor (Markdown + embeds, pessimistic locking)
- Student progress detail (completion dates, weighted progress)
- Attendance marking (Present/Absent/Late)
- Help request queue (Markdown responses)
- Pending rewards queue

**Admin**:
- Dashboard (school aggregate metrics)
- User management (tabbed: Teachers, Students)
- System configuration
- Shop management
- Badge management (simple triggers)

---

## Security Considerations

### Authentication Security

- Passwords: bcrypt with cost factor 12+
- JWT signed with RS256
- Refresh token rotation
- Session invalidation on password change
- **Email verification required** for teachers/admins

### Authorization

- Role-based access control (RBAC)
- Resource-level permissions (teachers only access their classes)
- Parent-child relationship verification (at least one parent required)

### Data Protection

- HTTPS enforced
- Database encryption at rest
- Sensitive fields encrypted (PII)
- No plain-text password storage

### Code Execution Safety

- Sandboxed iframe for JS
- Pyodide runs in web worker
- No network access from execution context
- Resource limits enforced
- Dialogs allowed but contained in sandbox

### Input Validation

- Server-side validation for all inputs
- Sanitize user-generated content
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- **Flexible whitespace** in quiz validation (normalized matching)

---

## Deployment

### Docker Compose Setup

The application uses a multi-file Docker Compose configuration:

- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development with hot reload
- `docker-compose.test.yml` - Testing environment
- `docker-compose.prod.yml` - Production deployment

**Project Structure (Turborepo Monorepo)**
```
silveredgeacademy/
├── apps/
│   ├── admin/           # React + Vite (Admin Portal)
│   └── student/         # React + Vite (Student Portal)
├── packages/
│   └── shared/          # Shared types, API client, constants
├── backend/             # Express + Bun
├── nginx/               # Reverse proxy configs
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.test.yml
├── docker-compose.prod.yml
├── turbo.json           # Turborepo configuration
├── package.json         # Root workspace configuration
└── Makefile
```

**Base Configuration (docker-compose.yml)**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  minio:
    image: minio/minio
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}

  backend:
    build: ./backend
    depends_on:
      - postgres
      - minio
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      S3_ENDPOINT: http://minio:9000
      PORT: 3000

  admin-frontend:
    build: ./admin-frontend
    depends_on:
      - backend

  student-frontend:
    build: ./student-frontend
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    depends_on:
      - backend
      - admin-frontend
      - student-frontend

volumes:
  postgres_data:
  minio_data:
```

**Development URLs**
| Service | URL |
|---------|-----|
| Student Portal | http://localhost:8080 |
| Admin Portal | http://localhost:8080/admin |
| API | http://localhost:8080/api |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

**Quick Start Commands**
```bash
make dev          # Start development environment
make test         # Run tests
make prod         # Start production environment
make logs         # View all logs
make clean        # Remove containers/volumes
```

### Environment Variables

```
# Database
POSTGRES_USER=silveredge
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=silveredge_db
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

# JWT
JWT_SECRET=<secure-random-string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Storage (MinIO)
MINIO_ROOT_USER=<minio-access-key>
MINIO_ROOT_PASSWORD=<minio-secret-key>
S3_ENDPOINT=http://minio:9000
S3_BUCKET=silveredge

# App URLs
VITE_API_URL=http://localhost:8080/api

# Email (for teacher notifications)
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
EMAIL_FROM=noreply@silveredgeacademy.com
```

---

## Data Management

### Student Transfer

When a student transfers to a new class:
1. Student record remains intact
2. Class enrollment updated
3. **All course progress is reset** (clean slate in new class)
4. XP, badges, and currency are preserved (global, not class-specific)
5. Lesson unlock status follows new class settings

### Student Archival

When a student leaves:
1. Account deactivated (soft delete)
2. All data preserved but hidden
3. Can be restored if student returns
4. Progress and sandbox projects maintained

### No School Year System

- Data accumulates indefinitely
- No automatic resets
- XP, badges, currency persist forever
- Manual archival only

### Backup Strategy (Recommended)

- Daily PostgreSQL dumps
- S3/MinIO replication
- Retain 30 days of backups
- Test restoration quarterly

---

## Performance Considerations

### Frontend

- Code splitting per route
- Lazy load heavy components (code editor, Blockly)
- **Blocking Pyodide load** (no pre-warm, just show loading indicator)
- Image optimization (WebP, responsive sizes)
- Service worker for asset caching

### Backend

- Database connection pooling
- Query optimization (indexes on foreign keys, common filters)
- Pagination for list endpoints
- Caching layer for static content (lessons)

### Code Execution

- Web workers for non-blocking execution
- Pyodide cached in IndexedDB after first load
- Timeout enforcement client-side
- No rate limiting

---

## Future Considerations (Post-MVP)

Items explicitly out of scope for MVP but worth considering:

1. **Bulk student import** (CSV upload)
2. **SSO integration** (Google Classroom, Clever)
3. **Multi-language support** (i18n) - currently LTR only
4. **COPPA/GDPR compliance** (parental consent flows)
5. **Offline support** (PWA capabilities)
6. **AI tutor integration** (hint system)
7. **Real-time collaboration**
8. **Native mobile apps**
9. **Advanced accessibility** (WCAG AA compliance)
10. **Multi-tenancy** (SaaS model) - currently single tenant forever
11. **Audit logging** - currently no impersonation logging
12. **API documentation** (public API)
13. **Portfolio feature** (public shareable projects with username-based URLs)
14. **Complex badge criteria** (AND/OR logic)
15. **Time tracking** (removed from MVP)
16. **Student submission history view**

---

## Design Decisions Summary

This section consolidates key design decisions made during specification review:

### Enrollment & Classes
- One class per student (no multi-class enrollment)
- Transfer resets all course progress (clean slate)
- No class size limits
- No term/academic year system

### Content & Courses
- Organization library model (all courses visible to all teachers)
- Course-level language setting (not per-lesson)
- Full lesson cloning across courses (deep copy)
- Pessimistic locking for concurrent edits
- Nested API routes (/courses/:id/sections/:id/lessons/:id)

### Exercises & Quizzes
- Test count shown but not which tests failed
- Teacher-controlled retake limits (null/0 = unlimited)
- XP on first attempt only
- Partial credit for multiple-answer questions
- Flexible whitespace matching
- Unlabeled Parsons problem blocks

### Code Execution
- Canvas support for graphical output
- Minimal Python module blocking
- Browser dialogs allowed
- Blocking Pyodide load
- No rate limiting

### Gamification
- No leaderboards
- Admin-defined badges only with simple triggers
- Exponential XP curve
- Login streak tracking
- No economic controls
- Dark mode purchasable (no free themes)

### Data & Privacy
- No school year system (data never resets)
- No time tracking
- Students can't view submission history
- No impersonation logging

### Communication
- No announcements/broadcast feature
- Single pending help request per student (must wait for response)
- Code snapshot automatically captured with help request
- Markdown responses from teachers
- Requests stay pending until teacher responds

### Exercise Validation
- Client-side test execution (browser)
- Server records pass/fail results only
- No server-side code execution for MVP

### Project Limits
- Sandbox: Maximum 50 projects

### Parent Portal
- Parent records exist for data linkage
- Parent-facing features deferred to post-MVP

### Admin Portal UI/UX (Interview Decisions)

**Navigation & Structure:**
- Full routing (separate pages for each section)
- Collapsible sidebar with grouped headings
- Sidebar structure: Dashboard > User Management > Academic (Classes, Courses) > Rewards (Badges, Shop) > Settings (Gamification, Features, System)
- Breadcrumbs + back button for navigation
- Desktop-only (no tablet/mobile optimization)
- Light theme only (no dark mode for admin)

**User Management:**
- Teacher deactivation: Blocked if teacher has assigned classes (must remove from all classes first)
- Student detail: Full profile page with gamification stats (Level, XP, Coins)
- Bulk actions supported (checkbox selection)
- Tab-scoped search (not global)
- All table columns sortable
- Always-visible row actions
- Numbered pagination
- Email verification: Admin can override for immediate access
- Password reset: Email reset link (admin sets temp password when overriding)

**Dashboard:**
- Balanced approach (tasks + metrics)
- 4 stat cards with week-over-week trends (green up, red down indicators)
- Expandable inline panels for drill-down (status breakdown)
- Recently viewed section (in dashboard, not header)
- Removed: Top Performing Classes, Export Report button
- Charts hide when no data for that language

**Badge Management:**
- Icon picker (Lucide icons) + gradient color picker
- Friendly dropdown triggers (4 types: completion counts, streak milestones, XP/level thresholds, first-time events)
- No drill-down on earned count (aggregate principle)

**Shop Management:**
- Category packs for avatars (not individual selection)
- Predefined UI themes only (no custom creation)
- Predefined editor themes only
- Live preview when creating/editing items
- Full admin override of teacher-created rewards
- Currency name: "Coins"
- Grandfathered + remove policy for price changes/deletions

**Gamification Settings:**
- XP values: Immediate apply on save
- Level formula: Base + multiplier only (no max level config)
- Individual level overrides supported
- 100+ levels supported

**Configuration:**
- Tabs for settings organization (not cards)
- Feature toggles: Confirm destructive only (when disabling)
- Unsaved changes warning (visual indicator + browser warning)

**General UX Patterns:**
- Full page forms for user creation/editing
- Full page for student profile views
- Toast + inline combo for error display
- Toast only for success feedback
- On-submit validation (not real-time)
- Button-only confirmations (no type-to-confirm)
- Comfortable row density
- Empty states with simple illustrations and call-to-action buttons
- Absolute short date format (e.g., "Jan 10, 2026")
- Filter persistence with clear button
- Session: Remember last section + recent items
- Session timeout: Redirect to login (no modal)

**Visual Design:**
- Professional minimal aesthetic
- Monochrome + indigo accent
- Nunito font (humanist sans)
- Full-width tables

**Multi-Admin & Teacher Sharing:**
- Multiple independent admins (no visibility into each other)
- Teachers see completely hidden restricted items (not grayed out)
- Admin can assign courses to classes
- Admin has full course section (view, create, edit, delete)
- Admin has full class management
- No teacher impersonation from admin
- Notification bell: System alerts only (dropdown panel)
- No sidebar badges for pending counts

---

## Glossary

| Term | Definition |
|------|------------|
| Course | A collection of sections containing lessons, language-specific |
| Section | A grouping of related lessons within a course |
| Lesson | A single learning unit with content, exercises, or quizzes in any order |
| Exercise | A coding challenge with test case validation |
| Quiz | A set of questions assessing understanding |
| Parsons Problem | A quiz type where students reorder shuffled code blocks (unlabeled) |
| XP | Experience points earned through activities (first attempt only for quizzes) |
| Currency | Virtual money earned alongside XP, spent in shop |
| Sandbox | Free-form coding environment for student experimentation |
| Blockly | Google's visual programming library using drag-drop blocks |
| Pyodide | Python interpreter compiled to WebAssembly |
| Pessimistic Locking | Editing lock that prevents concurrent edits |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 | - | Initial specification |
| 1.1 | 2026-01-09 | - | Added detailed design decisions from specification review |
| 1.2 | 2026-01-16 | - | Aligned with admin-spec.md: student auth (email OR username), dashboard trends, empty states with illustrations, teacher deactivation blocking, added section/lesson reorder and duplicate endpoints |
| 1.3 | 2026-01-16 | - | Spec alignment: removed major edit feature, removed term/academic year, changed to nested API routes, single pending help request, class transfer resets progress, updated sandbox project limit (50), parent portal deferred, client-side test validation only |
| 1.4 | 2026-01-16 | - | Changed parent-student relationship: students must have at least one parent (required), multiple parents allowed |
| 1.5 | 2026-01-16 | - | Moved portfolio feature to post-MVP, removed portfolio from core entities, endpoints, and database schema |
