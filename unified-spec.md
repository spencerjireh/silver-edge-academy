# Silver Edge Academy - Unified LMS Specification

> **Implementation Status:** Frontend mockups (Admin Portal, Student Portal) and shared packages are implemented with MSW mocking. Backend integration is pending.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [User Roles & Authentication](#3-user-roles--authentication)
4. [Data Model](#4-data-model)
5. [Student Portal](#5-student-portal)
6. [Admin Portal](#6-admin-portal)
7. [Code Execution System](#7-code-execution-system)
8. [Visual Coding (Blockly)](#8-visual-coding-blockly)
9. [Notifications System](#9-notifications-system)
10. [File Storage](#10-file-storage)
11. [API Design](#11-api-design)
12. [Database Schema](#12-database-schema)
13. [Security Considerations](#13-security-considerations)
14. [Deployment](#14-deployment)
15. [Performance Considerations](#15-performance-considerations)
16. [Future Considerations](#16-future-considerations)
17. [Glossary](#17-glossary)
18. [Revision History](#18-revision-history)

---

## 1. Overview

### 1.1 Purpose

Silver Edge Academy is a Learning Management System (LMS) designed to teach children coding through an engaging, gamified experience. The platform supports multiple age cohorts with a unified interface, featuring teacher-authored content, browser-based code execution, and a comprehensive rewards system.

### 1.2 Target Platforms

**Student Portal:**
- **Primary**: Desktop computers (classroom and home use)
- **Secondary**: Tablets (768px+)
- **Supported**: Large phones (limited, portrait orientation)

**Admin Portal:**
- **Desktop only** - No mobile or tablet optimization required
- **Minimum viewport**: 1280px width

**Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

### 1.3 Target Age Range

**8-18 years** - Universal design that is:
- Simple enough for younger children to navigate
- Professional enough that teenagers don't feel it's "childish"
- Focused on learning with engaging gamification moments

### 1.4 Development Approach

> **Frontend-first development** with MSW mocking. All API calls are mocked using Mock Service Worker in development mode. Backend integration will be implemented separately.

**Implementation Status:**

| Component | Status |
|-----------|--------|
| Student Portal Frontend | Implemented (MSW mocking) |
| Admin Portal Frontend | Implemented (MSW mocking) |
| Shared Packages | Implemented |
| Backend API | Pending |
| Database | Pending |
| File Storage | Pending |

**Mock Credentials for Testing:**

| Role | Identifier | Password | Notes |
|------|------------|----------|-------|
| Admin | admin@silveredge.com | password123 | Full access |
| Teacher | teacher1@silveredge.com | password123 | Restricted admin |
| Student | alex_coder | student123 | Level 5, mid-progress |
| Student | maya_dev | student123 | Level 12, advanced |
| Student | newbie | student123 | Level 1, onboarding |

---

## 2. Technology Stack

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
| Monorepo | Turborepo |
| Package Manager | Bun |

### 2.1 Project Structure

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

---

## 3. User Roles & Authentication

### 3.1 Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access: user management, configuration, analytics, shop management, badge creation |
| **Teacher** | Restricted admin access: course creation, student management, progress tracking, attendance |
| **Parent** | Linked to student account for administrative purposes (no portal access - deferred to post-MVP) |
| **Student** | Learning, exercises, projects, gamification participation |

### 3.2 Role Constraints

- **One role per account**: Each email/username corresponds to exactly one role. A parent who is also a teacher needs two separate accounts.
- **Required parent linkage**: Each student must have at least one parent account linked. Multiple parents are allowed.
- **Parent portal deferred**: Parent records exist for data linkage but parent-facing features are post-MVP.
- **Teachers use Admin Portal**: Teachers access the same Admin Portal as admins, with role-based feature visibility. Unauthorized navigation items are hidden (not grayed out).

### 3.3 Authentication

| User Type | Method |
|-----------|--------|
| Students | Username OR email + password |
| Teachers/Admins | Email + password (with email verification required before first login) |

**Student Login Options:**
- Students can register/login with either a username OR an email address
- Email is optional for students (supports younger children without email)
- If email is provided, it can be used for password recovery

**Student Username Rules** (if using username):
- Alphanumeric characters only (letters, numbers, underscores)
- No spaces or special characters
- Minimum 3 characters, maximum 20 characters

**Password Requirements:**
- All users: Minimum 8 characters with basic complexity requirements
- Secure hashing with bcrypt (cost factor 12+) or argon2

**Password Reset:**
- Students: Teacher or admin must reset (no self-service)
- Teachers/Admins: Self-service via email

No SSO integration for MVP.

---

## 4. Data Model

### 4.1 Core Entities

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

### 4.2 Key Relationships

- Each student belongs to exactly **one class** at a time
- Each student can have **one or more parents** linked
- Teachers can manage multiple classes
- Classes are assigned one or more courses
- Students accumulate global XP (no resets, no school year system)
- Lesson unlock status is per-class (teacher-controlled)
- Courses are visible to all teachers (organization library model)

---

## 5. Student Portal

### 5.1 Overview

The Student Portal provides a calm, focused learning environment for children learning to code. The interface prioritizes learning content while maintaining engagement through thoughtful gamification with celebration moments.

### 5.2 Design Philosophy

**Core Principles:**
1. **Learning First** - Content is the hero
2. **Crystal Clarity** - Clean, modern glass aesthetic with depth
3. **Focused Navigation** - Three clear paths: Learn, Code, Me
4. **Celebration Moments** - Meaningful gamification with animations
5. **Universal Appeal** - Works for ages 8-18 without feeling childish

### 5.3 Design System: Crystal Glass

The student portal uses a **Crystal Glass Design System** featuring:
- Frosted glass effects with backdrop blur
- 3D depth achieved through border-based shadows (not box-shadow)
- Faceted gem-like interactive elements
- Multi-layer gradient highlights for depth
- Shimmer animations for interactive feedback

#### 5.3.1 Typography

**Font Families** (Google Fonts)
- **Display/Headlines**: Bricolage Grotesque - Distinctive character without being childish
- **Body/UI**: DM Sans - Clean geometric, highly readable
- **Code**: JetBrains Mono - Clear monospace for code

**Weights**
- Display: 500 (medium), 600 (semibold), 700 (bold)
- Body: 400 (regular), 500 (medium), 600 (semibold)

**Base Size**: 16px

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page Title | Bricolage | 24px | Bold | slate-800 |
| Section Header | Bricolage | 18px | Semibold | slate-800 |
| Card Title | Bricolage | 16px | Semibold | slate-700 |
| Body Text | DM Sans | 16px | Regular | slate-600 |
| Lesson Content | DM Sans | 18px | Regular | slate-600 |
| Small/Caption | DM Sans | 14px | Regular | slate-500 |
| Button Text | DM Sans | 16px | Semibold | varies |
| Code | JetBrains Mono | 15px | Regular | varies |

#### 5.3.2 Color Palette

**Primary Colors (Violet - Calm)**
```css
--violet-50:   #F5F3FF;  /* Light backgrounds */
--violet-100:  #EDE9FE;  /* Hover states */
--violet-200:  #DDD6FE;  /* Borders */
--violet-300:  #C4B5FD;  /* Progress fills */
--violet-400:  #A78BFA;  /* Secondary elements */
--violet-500:  #8B5CF6;  /* Primary buttons */
--violet-600:  #7C3AED;  /* Button hover */
--violet-700:  #6D28D9;  /* Active states */
```

**Accent Color (Coral - Energy)**
```css
--coral-400:   #FB7185;  /* Hover states */
--coral-500:   #F43F5E;  /* Continue buttons, current indicators */
--coral-600:   #E11D48;  /* Active states */
```

**Gamification Colors**
```css
--xp-gold:     #F59E0B;  /* XP amber-500 */
--coins:       #EAB308;  /* Coins yellow-500 */
--badge-pink:  #EC4899;  /* Badge pink-500 */
--streak:      #F97316;  /* Streak orange-500 */
--level:       #8B5CF6;  /* Level violet-500 */
```

**Neutral Colors (Warm Stone)**
```css
--background:     #FAFAF9;  /* stone-50 */
--surface:        #FFFFFF;  /* Cards, modals */
--surface-alt:    #F5F5F4;  /* stone-100 */
--border:         #E7E5E4;  /* stone-200 */
--border-light:   #D6D3D1;  /* stone-300 */
--text-primary:   #1C1917;  /* stone-900 */
--text-secondary: #57534E;  /* stone-600 */
--text-muted:     #A8A29E;  /* stone-400 */
```

**Semantic Colors**
```css
--success: #22C55E;  /* green-500 */
--warning: #F59E0B;  /* amber-500 */
--error:   #EF4444;  /* red-500 */
--info:    #3B82F6;  /* blue-500 */
```

#### 5.3.3 Crystal Glass Effects

**Base Glass Effect**
```css
.crystal-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.crystal-glass-heavy {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
}
```

**Faceted Crystal Effect** (for navigation gems)
```css
.crystal-faceted {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );

  /* Top highlight */
  &::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 50%
    );
  }

  /* Side highlight */
  &::after {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 30%
    );
  }
}
```

#### 5.3.4 3D Depth System

**Important:** The crystal design uses **border-based depth** instead of box-shadow for the 3D effect.

```css
/* Depth levels using bottom borders */
.depth-sm {
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
}

.depth-md {
  border-bottom: 3px solid rgba(0, 0, 0, 0.1);
}

.depth-lg {
  border-bottom: 4px solid rgba(0, 0, 0, 0.12);
}

/* Colored depth for active states */
.depth-violet {
  border-bottom: 3px solid rgba(139, 92, 246, 0.3);
}

.depth-coral {
  border-bottom: 3px solid rgba(244, 63, 94, 0.3);
}
```

**Interactive Press Effect**
```css
.crystal-button:active {
  transform: translateY(2px);
  border-bottom-width: 1px;
}
```

#### 5.3.5 Spacing

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Icon gaps |
| md | 16px | Component padding |
| lg | 24px | Section gaps |
| xl | 32px | Page padding |
| 2xl | 48px | Major section spacing |

#### 5.3.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small elements |
| default | 12px | Inputs, small cards |
| md | 16px | Cards, buttons |
| lg | 20px | Large cards |
| xl | 24px | Nav pills, panels |
| full | 9999px | Avatars, badges |

#### 5.3.7 Animations

**Timing Functions**
```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
```

**Standard Durations**
- Micro interactions: 100-150ms
- Standard transitions: 200ms
- Emphasis animations: 300ms
- Page transitions: 400ms
- Celebration moments: 600-800ms

**Key Animations**
```css
/* Crystal shimmer sweep */
@keyframes crystal-shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}

/* XP gain float animation */
@keyframes xp-rise {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(1);
  }
}

/* Current lesson breathing */
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.15);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(244, 63, 94, 0.08);
  }
}

/* Badge unlock pop */
@keyframes badge-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

/* Confetti particle */
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

#### 5.3.8 Icons

- **Library**: Lucide React
- **Default Size**: 20px (w-5 h-5)
- **Nav Size**: 24px (w-6 h-6)
- **Large Size**: 32px (w-8 h-8)
- **Style**: Rounded/friendly variants

### 5.4 Navigation

#### 5.4.1 Floating Crystal Navigation

The primary navigation uses faceted crystal gem buttons fixed to the left side of the viewport.

**Navigation Items**

| Icon | Label | Route | Description |
|------|-------|-------|-------------|
| book-open | Learn | / | Home - course list |
| code | Code | /sandbox | Sandbox/playground |
| user | Me | /profile | Profile & settings |

**Desktop Layout**
```
+--------------------------------------------------+
|                                                  |
|  +--------+                                      |
|  |  [Gem] |  <- Crystal faceted button           |
|  | Learn  |                                      |
|  +--------+                                      |
|                                                  |
|  +--------+                                      |
|  |  [Gem] |                                      |
|  |  Code  |                                      |
|  +--------+                                      |
|                                                  |
|  +--------+                                      |
|  |  [Gem] |  <- notification dot when needed     |
|  |   Me   |                                      |
|  +--------+                                      |
|                                                  |
+--------------------------------------------------+
```

**Crystal Nav Gem Specifications**
```css
.nav-gem {
  width: 72px;
  padding: 12px 8px;
  border-radius: 16px;

  /* Crystal glass effect */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.8) 100%
  );
  backdrop-filter: blur(12px);

  /* 3D depth border */
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-bottom: 3px solid rgba(0, 0, 0, 0.08);

  /* Subtle outer glow */
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(139, 92, 246, 0.06);

  transition: all 200ms ease;
}

.nav-gem:hover {
  transform: translateY(-2px);
  border-bottom-width: 4px;
}

.nav-gem:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
}

.nav-gem.active {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.08) 50%,
    rgba(139, 92, 246, 0.12) 100%
  );
  border-color: rgba(139, 92, 246, 0.3);
  color: var(--violet-700);
}

/* Container positioning */
.nav-container {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 40;
}
```

#### 5.4.2 Mobile Navigation (< 768px)

On mobile, navigation moves to bottom as horizontal crystal pills:

```css
.nav-container.mobile {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
  gap: 8px;

  /* Glass container */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  padding: 8px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-bottom: 3px solid rgba(0, 0, 0, 0.08);
}
```

### 5.5 Header

**Structure**
```
+------------------------------------------------------------------+
|  [Logo] Silver Edge Academy              [Lv 5] [350] [Avatar]   |
+------------------------------------------------------------------+
```

**Components**
- **Logo**: Small icon (32px) + text "Silver Edge Academy" (desktop only), links to Learn page
- **Level Badge**: Crystal pill with violet tint, shows "Lv {number}"
- **Coin Display**: Yellow coin icon + amount, click navigates to shop
- **Avatar**: 36px circular avatar, links to Profile

**Header Styling**
```css
.header {
  position: sticky;
  top: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--stone-200);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 30;
}

/* Account for floating nav on desktop */
@media (min-width: 768px) {
  .header {
    padding-left: 120px;
  }
}
```

### 5.6 Dashboard

**Route**: `/dashboard`

The Dashboard provides an overview of student progress with gamification elements.

**Layout**
```
+------------------------------------------------------------------+
|  Header                                                          |
+------------------------------------------------------------------+
|                                                                  |
|  Welcome back, Alex!                                             |
|                                                                  |
|  +------------------+  +------------------+  +------------------+ |
|  | Level 5          |  | 350 Coins        |  | 5 Day Streak     | |
|  | 680/1000 XP      |  | [Coin Icon]      |  | [Fire Icon]      | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                  |
|  Statistics                                                      |
|  +------------------+  +------------------+  +------------------+ |
|  | 12 Lessons       |  | 45 Exercises     |  | 8 Quizzes        | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                  |
|  Recent Badges                                                   |
|  +--------+  +--------+  +--------+  +--------+                  |
|  | Badge  |  | Badge  |  | Badge  |  | Badge  |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                  |
|  Your Courses                                                    |
|  +------------------------+  +------------------------+          |
|  | Course Card            |  | Course Card            |          |
|  +------------------------+  +------------------------+          |
|                                                                  |
+------------------------------------------------------------------+
```

**Stats Cards**: Crystal glass cards showing Level with XP progress bar, Coin balance, Current streak with fire icon

**Statistics Grid**: Three stat cards showing Lessons completed, Exercises passed, Quizzes finished

### 5.7 Learn Page

**Route**: `/`

The Learn page is the student's home, focused on getting them back to learning.

**Layout**
```
+------------------------------------------------------------------+
|  Header                                                          |
+------------------------------------------------------------------+
|                                                                  |
|  Welcome back, Alex                                              |
|                                                                  |
|  +--------------------------------------------------------+     |
|  | Continue where you left off                             |     |
|  |                                                        |     |
|  | [JS Icon]  JavaScript Basics                           |     |
|  |            Section 3: Loops > Lesson 12                |     |
|  |                                                        |     |
|  | [===================-----------] 70%   [Continue ->]   |     |
|  +--------------------------------------------------------+     |
|                                                                  |
|  Your Courses                                                    |
|  +------------------------+  +------------------------+          |
|  | [JS]                   |  | [Py]                   |          |
|  | JavaScript Basics      |  | Python Adventures      |          |
|  | [============--] 70%   |  | [====----------] 20%   |          |
|  +------------------------+  +------------------------+          |
|                                                                  |
+------------------------------------------------------------------+
```

**Course Grid Layout**
- 1 column on mobile
- 2 columns on tablet (768px+)
- 3 columns on desktop (1200px+)

**Course Card Styling** (language-specific theming):
```css
/* JavaScript - Yellow/Amber */
.course-card.javascript {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border-color: rgba(251, 191, 36, 0.3);
}

/* Python - Blue */
.course-card.python {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-color: rgba(59, 130, 246, 0.3);
}
```

### 5.8 Course Navigation

**Route**: `/courses/:courseId`

#### 5.8.1 Course Map View

```
+------------------------------------------------------------------+
|  [< Back to Learn]   JavaScript Basics              [====] 70%   |
+------------------------------------------------------------------+
|                                                                  |
|  Section 1: Getting Started                            [Check]   |
|      [Winding path with lesson nodes]                            |
|                                                                  |
|  Section 2: Variables                                  [Check]   |
|      [Winding path with lesson nodes]                            |
|                                                                  |
|  Section 3: Loops                                   [In Progress]|
|      [Winding path with lesson nodes]                            |
|           ^current (coral, breathing)                            |
|                                                                  |
|  Section 4: Functions                                  [Locked]  |
|      [Locked nodes]                                              |
|                                                                  |
+------------------------------------------------------------------+
```

#### 5.8.2 Winding Path Layout

SVG-based path visualization that renders lessons in a gentle wave pattern:

```typescript
function generateWavePath(nodeCount: number) {
  const nodeSpacing = 80;
  const waveAmplitude = 30;
  const waveFrequency = 0.5;

  return nodes.map((_, index) => ({
    x: index * nodeSpacing,
    y: Math.sin(index * waveFrequency) * waveAmplitude
  }));
}
```

**Responsive Behavior**
- Desktop: Wave pattern with vertical movement
- Mobile: Horizontal straight line (simpler)

#### 5.8.3 Lesson Node States

| State | Visual |
|-------|--------|
| Completed | Violet fill, white checkmark |
| Current | Coral fill, breathing animation |
| Available | White fill, violet border, number |
| Locked | Gray fill, lock icon |

### 5.9 Lesson View

**Route**: `/courses/:courseId/lessons/:lessonId`

**Layout**
```
+------------------------------------------------------------------+
|  [< Back]     Section 3 > Lesson 12            [Step 3 of 5]     |
+------------------------------------------------------------------+
|                                                                  |
|     # Understanding Loops                                        |
|                                                                  |
|     [Lesson content - max-width: 680px, centered]                |
|                                                                  |
|     [Code blocks with syntax highlighting]                       |
|                                                                  |
+------------------------------------------------------------------+
|  [<- Previous]                              [Continue ->]        |
+------------------------------------------------------------------+
```

**Multi-Step Lessons**: Lessons can contain multiple steps including content steps (markdown/text), exercise steps (code challenges), and quiz steps (questions). Navigation shows step progress: "Step 3 of 5".

**Content Styling**
```css
.lesson-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 32px;
}

.lesson-content h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.lesson-content p {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--stone-600);
  margin-bottom: 1rem;
}

.lesson-content pre {
  background: var(--slate-900);
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;
  border-bottom: 3px solid rgba(0, 0, 0, 0.2);
}
```

### 5.10 Code Editor

Used in exercises, quizzes, and sandbox.

**Layout**
```
+----------------------------------------------------------+
| [Language: JavaScript v]              [Run] [Stop] [Reset]|
+----------------------------------------------------------+
|  1 | // Write your code here                             |
|  2 | function greet(name) {                              |
|  3 |   return "Hello, " + name;                          |
|  4 | }                                                   |
+----------------------------------------------------------+
| Output                                         [Success] |
+----------------------------------------------------------+
| > Hello, World!                                          |
| Execution time: 0.003s                                   |
+----------------------------------------------------------+
```

**Modes** (teacher-controlled per lesson):
- Visual (Blockly) - drag-and-drop blocks
- Text - traditional code editor
- Mixed - side-by-side blocks and generated code

**Features**:
- Syntax highlighting
- Theme selection (purchasable themes only - no free dark mode)
- Full undo/redo (Ctrl+Z/Y with history)
- Run code button
- Clear output button
- Reset to starter code
- Preferences synced across devices

**Complexity Levels** (teacher-controlled):
- Simplified: Large buttons, minimal UI, limited features
- Standard: Full editor with common features
- Advanced: All features including keyboard shortcuts

#### 5.10.1 Code Execution

**JavaScript Execution**
- Direct execution in browser using `Function` constructor
- Console output capture via proxy
- Timeout support for infinite loop protection

**Python Execution**
- Uses Pyodide (Python compiled to WebAssembly)
- Lazy-loaded via Web Worker for performance
- stdout/stderr capture
- Async execution support

```typescript
interface ExecutionResult {
  success: boolean;
  output: string[];
  error?: string;
  executionTime: number;
}

class CodeRunnerService {
  async execute(
    code: string,
    language: 'javascript' | 'python',
    onOutput?: (line: string) => void
  ): Promise<ExecutionResult>;

  stop(): void;
}
```

### 5.11 Exercises

**Route**: `/courses/:courseId/lessons/:lessonId/exercises/:exerciseId`

**Exercise View**
```
+----------------------------------------------------------+
| Exercise 1 of 3                              [+10 XP]     |
+----------------------------------------------------------+
| Print Your Name                                          |
|                                                          |
| Write a program that prints your name to the console.    |
|                                                          |
| Expected output:                                         |
| > Alex                                                   |
+----------------------------------------------------------+
| [Code Editor]                                            |
+----------------------------------------------------------+
| [Run Code]                              [Submit Answer]  |
+----------------------------------------------------------+
```

**Exercise Types**:
- Free-form coding (open sandbox)
- Guided challenges (with test cases)
- Project-based (multi-file, longer duration)

**Exercise Flow**:
1. Read instructions
2. Write code in editor (fully editable, including starter code)
3. Run code to see output
4. Submit for validation
5. See test count feedback ("Passed 3/5 tests")
6. On pass: XP awarded, lesson progress updated
7. On fail: Try again (unlimited attempts)

**Test Validation**:
- Count shown: Students see "Passed 3/5 tests" but not which ones failed
- All test cases must pass for completion

**Submission Storage**:
- Last 5 attempts stored regardless of pass/fail
- Teachers can review recent submission history
- Students cannot view their own submission history (only current code)

### 5.12 Quizzes

**Route**: `/courses/:courseId/lessons/:lessonId/quizzes/:quizId`

**Question Types**:
- Multiple choice (single answer)
- Multiple choice (multiple answers) - partial credit scoring
- True/False
- Code output ("What does this code print?")
- Fill-in-the-blank code - flexible whitespace matching (normalized)
- Parsons problems (drag-to-reorder code blocks) - unlabeled blocks (no line numbers)

**Settings**:
- Points per question
- Teacher-controlled retake limit (1, 3, unlimited, etc.)
- Randomize question order (optional) - per-attempt randomization
- Randomize answer order (optional) - per-attempt randomization

**Scoring**:
- Multiple-answer questions: Partial credit (correct selections minus incorrect, can't go negative)
- XP awarded on first attempt only (retakes don't award additional XP)

### 5.13 Code Page (Sandbox)

**Route**: `/sandbox`

**Features**:
- Language selector (JavaScript/Python)
- Auto-save project state
- Create new projects
- Delete projects
- Full-height editor for workspace feel
- Maximum 50 sandbox projects per student

**Sandbox List Layout**
```
+----------------------------------------------------------+
| My Projects                                   [+ New]    |
+----------------------------------------------------------+
| +------------------------+  +------------------------+   |
| | [JS] Calculator        |  | [Py] Number Game       |   |
| | Updated 2 days ago     |  | Updated 1 week ago     |   |
| +------------------------+  +------------------------+   |
|                                                          |
| +------------------------+  +------------------------+   |
| | [JS] Drawing App       |  | [+ New Project]        |   |
| | Updated 2 weeks ago    |  |                        |   |
| +------------------------+  +------------------------+   |
+----------------------------------------------------------+
```

### 5.14 Profile Page

**Route**: `/profile`

**Layout**
```
+------------------------------------------------------------------+
|                                                                  |
|     +------------------+                                         |
|     |                  |                                         |
|     |  [Large Avatar]  |   [Change Avatar]                       |
|     |                  |                                         |
|     +------------------+                                         |
|                                                                  |
|     Alex Coder                                                   |
|     @alex_coder                                                  |
|                                                                  |
|     Level 5                                                      |
|     [===================-----------] 680 / 1000 XP               |
|                                                                  |
+------------------------------------------------------------------+
|  [Progress]  [Badges]  [Shop]  [Settings]                        |
+------------------------------------------------------------------+
|                                                                  |
|     Tab Content                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

**Tabs**:
- **Progress**: Statistics grid (lessons, exercises, quizzes), current streak, XP breakdown
- **Badges**: Earned badges with dates, locked badges with "???" placeholder
- **Shop**: Quick access to shop
- **Settings**: User preferences

**Avatar System**:
- Preset avatar library
- System default avatar assigned to all new students
- Select from available (default + purchased)
- No custom image upload
- No leaderboards (completely individual progress)

**Profile Fields**:
- Display name (student-editable, can change anytime)
- Avatar
- Level and XP
- Badge showcase
- Stats (lessons completed, exercises passed, etc.)

### 5.15 Shop Page

**Route**: `/shop`

**Layout**
```
+------------------------------------------------------------------+
| Shop                                        Your Coins: 350      |
+------------------------------------------------------------------+
| [Avatars]  [UI Themes]  [Editor Themes]  [Rewards]               |
+------------------------------------------------------------------+
|                                                                  |
| +--------+  +--------+  +--------+  +--------+                   |
| | [Item] |  | [Item] |  | [Item] |  | [Item] |                   |
| | Robot  |  | Wizard |  | Dragon |  | Owned  |                   |
| | 50     |  | 75     |  | 100    |  | [Check]|                   |
| +--------+  +--------+  +--------+  +--------+                   |
|                                                                  |
+------------------------------------------------------------------+
```

**Categories**:
- **Avatars**: Profile pictures (category packs, not individual)
- **UI Themes**: App color themes (all themes purchasable, including dark mode - no free themes)
- **Editor Themes**: Code editor syntax highlighting color schemes
- **Rewards**: Teacher-defined redeemable items (per-class)

**Item Persistence** (configurable per item):
- Permanent: Owned forever after purchase
- Consumable: One-time use (e.g., homework pass)

**Purchasing**:
- Browse available items
- View price in currency ("Coins")
- Purchase (instant application for themes)
- View owned items

### 5.16 Help System

**Route**: `/help`

**Help Request Flow**:
- "Ask Teacher for Help" button from within exercises/lessons
- Context captured: Current code state, exercise info, and student message automatically included
- Single pending request: Student can only have one pending help request at a time
- Must wait for teacher response before submitting another request
- Notification when teacher responds
- No automatic timeout: Request stays pending until teacher responds

**Help Response Format**:
- Teachers respond with Markdown (including code blocks)
- No attachments or rich media in responses

### 5.17 Notifications

**Route**: `/notifications`

**Notification Types**:
- Badge earned (with animation)
- Help request response
- Level up
- Course completion
- New content unlocked

### 5.18 Gamification System

#### 5.18.1 Philosophy

Gamification provides meaningful celebration moments without constant distraction:
- **Visible when earned**: Animations on achievement
- **Accessible when sought**: Stats in Profile
- **Not constantly demanding attention**: Clean learning interface

#### 5.18.2 XP & Levels

- **Scope**: Global (across all courses)
- **No resets**: XP accumulates forever (no school year system)
- **Sources**: Lesson completion, exercise completion, quiz scores (first attempt only)
- **Values**: Admin-configurable per activity type
- **Level progression**: Exponential curve (each level requires more XP than previous)

#### 5.18.3 Login Streaks

- Tracked: Consecutive days with any activity
- Used for streak-based badge triggers (e.g., "7-day streak")

#### 5.18.4 Badges

- Admin-defined only: Teachers cannot create badges
- Simple triggers: One trigger per badge (no complex conditions)
- Examples:
  - "First Steps" - Complete first lesson
  - "Bug Squasher" - Pass 10 exercises
  - "Python Pioneer" - Complete first Python course
  - "Streak Master" - 7-day login streak
- Notification: Animation effect when badge earned
- Displayed on profile

#### 5.18.5 Currency ("Coins")

- Earned alongside XP
- Conversion rate: Admin-configurable
- Spent in shop
- Balance visible on dashboard
- No economic controls: Currency accumulates forever; admins manually adjust prices if needed

#### 5.18.6 Celebration Moments

| Event | Animation | Duration |
|-------|-----------|----------|
| Complete exercise | XP float | 800ms |
| Pass quiz | XP float | 800ms |
| Earn badge | Badge modal + confetti | 3s |
| Level up | Toast notification | 3s |
| Earn coins | Coin float | 800ms |

### 5.19 Student Portal State Management

#### 5.19.1 Context Providers

**AuthContext**
```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**GamificationContext**
```typescript
interface GamificationContextValue {
  eventQueue: GamificationEvent[];
  triggerEvent: (event: GamificationEvent) => void;
  clearEvent: () => void;
}

interface GamificationEvent {
  type: 'xp' | 'coin' | 'badge' | 'levelUp';
  data: {
    amount?: number;
    badge?: Badge;
    newLevel?: number;
    message?: string;
  };
}
```

**ToastContext**
```typescript
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

#### 5.19.2 React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 5.19.3 Local Storage

| Key | Content |
|-----|---------|
| `auth_token` | JWT access token |
| `refresh_token` | JWT refresh token |
| `sandbox_draft` | Current code |

### 5.20 Student Portal Directory Structure

```
apps/student/src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Tabs.tsx
│   │   ├── CoinDisplay.tsx
│   │   ├── XpDisplay.tsx
│   │   ├── LevelBadge.tsx
│   │   └── EmptyState.tsx
│   ├── layout/                # Layout components
│   │   ├── StudentLayout.tsx
│   │   ├── Header.tsx
│   │   ├── FloatingNav.tsx
│   │   └── BottomNav.tsx
│   ├── gamification/          # Gamification animations
│   │   ├── GamificationAnimations.tsx
│   │   ├── XpGainAnimation.tsx
│   │   ├── CoinEarnAnimation.tsx
│   │   ├── BadgeUnlockModal.tsx
│   │   ├── BadgeUnlockToast.tsx
│   │   ├── LevelUpModal.tsx
│   │   ├── LevelUpToast.tsx
│   │   ├── StreakDisplay.tsx
│   │   └── ConfettiEffect.tsx
│   ├── course/                # Course components
│   │   ├── WindingPath.tsx
│   │   └── LessonNode.tsx
│   ├── editor/                # Code editor components
│   │   ├── CodeEditor.tsx
│   │   ├── EditorToolbar.tsx
│   │   └── OutputPanel.tsx
│   └── auth/                  # Auth components
│       └── ProtectedRoute.tsx
├── pages/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Dashboard/
│   │   └── Dashboard.tsx
│   ├── Learn/
│   │   └── LearnPage.tsx
│   ├── Courses/
│   │   ├── CourseList.tsx
│   │   └── CourseMap.tsx
│   ├── Lessons/
│   │   └── LessonView.tsx
│   ├── Exercises/
│   │   └── ExerciseView.tsx
│   ├── Quizzes/
│   │   └── QuizView.tsx
│   ├── Sandbox/
│   │   ├── SandboxList.tsx
│   │   └── SandboxEditor.tsx
│   ├── Shop/
│   │   └── ShopPage.tsx
│   ├── Profile/
│   │   ├── ProfilePage.tsx
│   │   └── AvatarSelection.tsx
│   ├── Help/
│   │   └── HelpRequestsPage.tsx
│   └── Notifications/
│       └── NotificationsPage.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── GamificationContext.tsx
│   └── ToastContext.tsx
├── hooks/
│   ├── queries/               # React Query hooks
│   └── useCodeRunner.ts
├── services/
│   ├── api/                   # API client functions
│   └── codeRunner/            # Code execution
│       ├── CodeRunnerService.ts
│       ├── JavaScriptExecutor.ts
│       └── PythonExecutor.ts
├── workers/
│   └── pythonWorker.ts        # Pyodide web worker
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── mocks/
│   ├── handlers.ts            # MSW handlers
│   └── data/                  # Mock data
├── routes/
│   └── index.tsx
├── App.tsx
├── main.tsx
└── index.css                  # Global styles & design tokens
```

### 5.21 Student Portal Route Inventory

| Page | Route | Description |
|------|-------|-------------|
| Login | /login | Authentication |
| Learn (Home) | / | Welcome + courses |
| Dashboard | /dashboard | Stats overview |
| Course List | /courses | All courses |
| Course Map | /courses/:id | Section/lesson nav |
| Lesson | /courses/:id/lessons/:lessonId | Learning content |
| Exercise | /courses/:id/lessons/:lessonId/exercises/:exerciseId | Code exercise |
| Quiz | /courses/:id/lessons/:lessonId/quizzes/:quizId | Quiz questions |
| Sandbox List | /sandbox | Code projects |
| Sandbox Editor | /sandbox/:projectId | Project editor |
| Shop | /shop | Item shop |
| Profile | /profile | User profile |
| Avatar Selection | /profile/avatar | Avatar picker |
| Help | /help | Help requests |
| Notifications | /notifications | Notification center |

---

## 6. Admin Portal

### 6.1 Overview

The Admin Portal provides full administrative control over the Silver Edge Academy LMS. Administrators have unrestricted access to all system features, while Teachers function as restricted administrators with limited scope.

### 6.2 Access Control

| Role | Access Level |
|------|--------------|
| Admin | Full access to all features |
| Teacher | Restricted admin - limited to assigned classes |

### 6.3 Teacher Role in Admin Portal

Teachers use the same Admin Portal with role-based feature visibility. Unauthorized navigation items are **hidden** (not grayed out).

**Teachers CAN access:**
- Dashboard (their own stats only)
- Classes (only their assigned classes)
- Courses (view all, create, edit, clone)
- Students (only in their classes)
- Help Requests (from their students)
- Pending Rewards (teacher-defined rewards they created)

**Teachers CANNOT access:**
- User Management (Teachers, Parents, Students list pages)
- Badges management
- Shop management (global items)
- Gamification Settings
- Feature Toggles
- System Settings

**Sidebar for Teachers:**
```
+------------------------+
| Dashboard              |
+------------------------+
| ACADEMIC               |
| - My Classes           |
| - Courses              |
+------------------------+
| TEACHING               |
| - Help Requests        |
| - Pending Rewards      |
+------------------------+
| User Profile + Logout  |
+------------------------+
```

### 6.4 Design System: Professional Minimal

The Admin Portal uses a professional minimal design system with indigo accent and Nunito font.

#### 6.4.1 Typography

- **Font Family**: Nunito (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 18px | Bold | slate-800 |
| Section Header | 14px | Semibold | slate-800 |
| Body Text | 14px | Regular | slate-600 |
| Small/Caption | 12px | Regular | slate-400 |
| Table Header | 12px | Semibold | slate-500 |
| Table Cell | 14px | Regular | slate-700 |

#### 6.4.2 Color Palette

**Accent Colors (Indigo)**
```css
accent-50:  #eef2ff
accent-100: #e0e7ff
accent-200: #c7d2fe
accent-300: #a5b4fc
accent-400: #818cf8
accent-500: #6366f1
accent-600: #4f46e5
accent-700: #4338ca
accent-800: #3730a3
accent-900: #312e81
```

**Neutral Colors (Slate)**
```css
slate-50:  #f8fafc
slate-100: #f1f5f9
slate-200: #e2e8f0
slate-300: #cbd5e1
slate-400: #94a3b8
slate-500: #64748b
slate-600: #475569
slate-700: #334155
slate-800: #1e293b
slate-900: #0f172a
```

**Semantic Colors**
```css
Success: emerald-500 (#10b981)
Warning: amber-500 (#f59e0b)
Error:   red-500 (#ef4444)
Info:    sky-500 (#0ea5e9)
```

#### 6.4.3 Spacing

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Component padding |
| md | 12px | Default gaps |
| lg | 16px | Section padding |
| xl | 24px | Page padding |
| 2xl | 32px | Large section spacing |

#### 6.4.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Small elements |
| default | 6px | Inputs, buttons |
| md | 8px | Cards |
| lg | 12px | Panels, modals |
| xl | 16px | Large containers |
| full | 9999px | Pills, avatars |

#### 6.4.5 Shadows

```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow:    0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

#### 6.4.6 Icons

- **Library**: Lucide Icons
- **Default Size**: 20px (w-5 h-5)
- **Small Size**: 16px (w-4 h-4)
- **Large Size**: 24px (w-6 h-6)

### 6.5 Layout & Navigation

#### 6.5.1 Page Structure

```
+------------------+----------------------------------------+
|                  |  Header (sticky)                       |
|    Sidebar       +----------------------------------------+
|    (fixed)       |                                        |
|                  |  Content Area                          |
|                  |  (scrollable)                          |
|                  |                                        |
+------------------+----------------------------------------+
```

#### 6.5.2 Sidebar

**Dimensions**
- Expanded width: 256px (w-64)
- Collapsed width: 72px
- Transition: 200ms ease-in-out

**Structure (Admin)**
```
+------------------------+
| Logo + Brand Name      |
+------------------------+
| Dashboard              |
+------------------------+
| USERS                  |
| - Teachers             |
| - Parents              |
| - Students             |
+------------------------+
| ACADEMIC               |
| - Classes              |
| - Courses              |
+------------------------+
| REWARDS                |
| - Badges               |
| - Shop                 |
+------------------------+
| SETTINGS               |
| - Gamification         |
| - Features             |
| - System               |
+------------------------+
| User Profile + Logout  |
+------------------------+
```

**Behavior**
- Toggle button in header collapses/expands
- Collapsed state shows icons only with centered alignment
- Group headings hidden when collapsed
- Selected state persists in collapsed view (accent background)
- Collapse state persisted in localStorage

**Navigation Items**

| Item | Icon | Route |
|------|------|-------|
| Dashboard | layout-dashboard | /admin |
| Teachers | graduation-cap | /admin/teachers |
| Parents | users | /admin/parents |
| Students | user | /admin/students |
| Classes | school | /admin/classes |
| Courses | book-open | /admin/courses |
| Badges | award | /admin/badges |
| Shop | shopping-bag | /admin/shop |
| Gamification | trophy | /admin/gamification |
| Features | toggle-right | /admin/features |
| System | settings | /admin/system |

#### 6.5.3 Header

**Structure**
```
+----------------------------------------------------------+
| [Toggle] [Back] Breadcrumb / Page Title     [Bell] [?]   |
+----------------------------------------------------------+
```

**Components**
- **Sidebar Toggle**: Menu icon, toggles sidebar collapse
- **Back Button**: Arrow-left icon, shown on detail/form pages
- **Breadcrumb**: Dashboard > Section > Page (clickable)
- **Page Title**: Bold, below breadcrumb
- **Notifications**: Bell icon with badge for unread count (system alerts only)
- **Help**: Question mark icon (future feature)

**Styling**
- Background: white/80 with backdrop-blur
- Border: slate-200 bottom
- Sticky positioning
- z-index: 10

#### 6.5.4 Content Area

- Padding: 24px (p-6)
- Background: slate-50
- Fade-in animation on page load (400ms)

### 6.6 Dashboard

**Route**: `/admin`

#### 6.6.1 Statistics Cards

Row of 4 cards displaying key metrics with week-over-week trends:

| Card | Icon | Color | Metric |
|------|------|-------|--------|
| Total Users | users | accent | Count of all active users |
| Active Classes | school | emerald | Classes in current term |
| Courses | book-open | amber | Published courses |
| XP Earned | zap | violet | Total XP earned this week |

**Card Structure**
```
+----------------------------------+
| [Icon]              [Trend %]   |
| Metric Value                     |
| Label                            |
+----------------------------------+
```

- Trend shows week-over-week change (green up, red down)
- Values formatted with locale separators (1,234)
- Charts hide when no data for that language

#### 6.6.2 Charts Section

**Left: User Activity (Line Chart)**
- Title: "User Activity"
- Subtitle: "Daily active users over the past 30 days"

**Right: Course Progress (Bar Chart)**
- Title: "Course Progress"
- Subtitle: "Average completion by course"
- Color-coded by language (amber=JS, sky=Python)

#### 6.6.3 Recently Viewed

Stored in database per admin user. Shows maximum 5 items with relative time.

**Tracked Items**: Users, Classes, Courses

### 6.7 User Management

User management is split into three separate pages for Teachers, Parents, and Students.

#### 6.7.1 Teachers

**Routes:**
- List: `/admin/teachers`
- Create: `/admin/teachers/create`
- Edit: `/admin/teachers/:id/edit`
- Detail: `/admin/teachers/:id`

**Table Columns**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Name | auto | Yes | Full name with avatar |
| Email | 200px | Yes | Email address |
| Classes | 100px | Yes | Count of assigned classes |
| Students | 100px | Yes | Total students across classes |
| Status | 100px | Yes | Active/Inactive badge |
| Joined | 120px | Yes | Registration date |
| Actions | 80px | No | Dropdown menu |

**Row Actions**: View Profile, Edit, Deactivate

**Deactivation Rule**: Teachers with assigned classes cannot be deactivated. The action is disabled with tooltip: "Remove teacher from all classes first"

**Create Form Sections:**
1. Basic Information (First Name, Last Name, Email, Password, Confirm Password)
2. Teacher-Specific Fields (Assign to Classes - multi-select, optional)
3. Status (Active/Inactive radio)

**Detail Page Tabs:**
- Overview: Quick stats cards, recent activity timeline
- Classes: Assigned classes with student counts, progress summaries
- Activity: Full activity log, login history

#### 6.7.2 Parents

**Routes:**
- List: `/admin/parents`
- Create: `/admin/parents/create`
- Edit: `/admin/parents/:id/edit`
- Detail: `/admin/parents/:id`

**Table Columns**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Name | auto | Yes | Full name with avatar |
| Email | 200px | Yes | Email address |
| Children | 150px | Yes | Linked student names |
| Status | 100px | Yes | Active/Inactive badge |
| Joined | 120px | Yes | Registration date |
| Actions | 80px | No | Dropdown menu |

**Create Form Sections:**
1. Basic Information (First Name, Last Name, Email, Password, Confirm Password)
2. Parent-Specific Fields (Link Children - student search/select, optional)
3. Status (Active/Inactive radio)

**Detail Page Tabs:**
- Overview: Account information, quick links to children
- Children: Cards for linked children with avatar, name, class, level, XP
- Activity: Login history, account changes

#### 6.7.3 Students

**Routes:**
- List: `/admin/students`
- Create: `/admin/students/create`
- Edit: `/admin/students/:id/edit`
- Detail: `/admin/students/:id`

**Table Columns**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Name | auto | Yes | Full name with avatar |
| Username | 150px | Yes | Student username |
| Class | 150px | Yes | Assigned class name |
| Level | 80px | Yes | Current level number |
| XP | 100px | Yes | Total XP earned |
| Status | 100px | Yes | Active/Inactive badge |
| Joined | 120px | Yes | Registration date |
| Actions | 80px | No | Dropdown menu |

**Create Form Sections:**
1. Basic Information (First Name, Last Name, Username required, Email optional, Password, Confirm Password)
2. Student-Specific Fields (Assign to Class - single select, Link Parent - optional)
3. Status (Active/Inactive radio)

*Note: Students can login with either username or email (if provided)*

**Detail Page Tabs:**
- Overview: Quick stats cards (level, XP, badges, courses), recent activity, current course progress
- Courses: Enrolled courses with progress, lesson completion breakdown, quiz scores
- Achievements: Badges earned, XP history chart, level progression
- Activity: Full activity log, login history, lesson completions

### 6.8 Classes

**Routes:**
- List: `/admin/classes`
- Create: `/admin/classes/create`
- Edit: `/admin/classes/:id/edit`
- Detail: `/admin/classes/:id`

**Table Columns**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Class Name | auto | Yes | Name with color indicator |
| Teacher | 180px | Yes | Assigned teacher name |
| Students | 100px | Yes | Enrolled count |
| Courses | 100px | Yes | Assigned course count |
| Status | 100px | Yes | Active/Archived badge |
| Actions | 80px | No | Dropdown menu |

**Create Form Sections:**
1. Class Details (Name, Description, Color picker)
2. Assignment (Assign Teacher, Assign Courses)
3. Students (Add Students multi-select)
4. Status (Active/Draft radio)

**Detail Page Tabs:**
- Roster: Student list with quick stats, add/remove students
- Progress: Course completion overview, per-student progress bars
- Attendance: Calendar view, attendance records per session
- Courses: Assigned courses with status, add/remove courses

**Student Transfer**: When a student transfers to a new class, all course progress is reset (clean slate). XP, badges, and currency are preserved.

### 6.9 Courses

**Routes:**
- List: `/admin/courses`
- Create: `/admin/courses/create`
- Edit: `/admin/courses/:id/edit`
- Detail: `/admin/courses/:id`
- Lesson Editor: `/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId`

#### 6.9.1 Course List

**Grid View (Default)**
- Cards in 3-column grid showing: title, language badge (JS=amber, Python=sky), status badge, section/lesson counts, assigned class count, last updated

**Table View**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Course | auto | Yes | Title with language badge |
| Sections | 80px | Yes | Section count |
| Lessons | 80px | Yes | Lesson count |
| Classes | 100px | Yes | Assigned class count |
| Status | 100px | Yes | Draft/Published |
| Updated | 120px | Yes | Last modified date |
| Actions | 80px | No | Dropdown |

**Course Deletion**: Blocked if assigned to any class. Error message: "This course is assigned to X classes. Remove all assignments before deleting."

#### 6.9.2 Course Create/Edit Form

**Create Form Sections:**
1. Course Details (Title, Description)
2. Programming Language (JavaScript or Python - radio cards with icons)
3. Publication Status (Draft/Published)

**Edit Form**: Same as create, but language is read-only after creation. Warning shown if unpublishing course with active students.

#### 6.9.3 Course Detail Page

**Stats Row**: Sections, Lessons, Students, Avg Progress

**Tabs:**
- Content: Section and lesson management
- Classes: Classes using this course, per-class progress
- Statistics: Completion rates, quiz scores, time analytics

#### 6.9.4 Content Tab - Section Management

```
+----------------------------------------------------------+
| [::] Section 1: Introduction               [Edit] [Delete]|
+----------------------------------------------------------+
| | [::] Lesson 1.1: Getting Started         [Edit] [...]  ||
| | [::] Lesson 1.2: Basic Syntax            [Edit] [...]  ||
| +--------------------------------------------------------+|
| | [+ Add Lesson]                                         ||
+----------------------------------------------------------+
| [+ Add Section]                                           |
+----------------------------------------------------------+
```

**Add Section**: Clicking expands inline form (title required, description optional)

**Edit Section**: Clicking transforms header into editable form inline

**Delete Section**: Blocked if has lessons (tooltip: "Remove all lessons from this section first"). Shows confirmation dialog if empty.

**Reorder Sections**: Drag handle on left, visual feedback, optimistic update. API: `PATCH /api/courses/:id/sections/reorder`

#### 6.9.5 Content Tab - Lesson Management

**Add Lesson**: Inline form within section (title only initially). After creation, click Edit for full Lesson Editor.

**Lesson Actions Menu:**
- Duplicate: Creates copy with title "Copy of [Original Title]"
- Delete: Confirmation dialog

**Reorder Lessons**: Drag within same section only. API: `PATCH /api/courses/:courseId/sections/:sectionId/lessons/reorder`

#### 6.9.6 Lesson Editor

**Route**: `/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId`

**Page Structure**
```
+----------------------------------------------------------+
| [Back to Course]                     [Preview] [Save]     |
+----------------------------------------------------------+
| +------------------------------------------------------+ |
| | [Content] [Exercises] [Quiz] [Settings]              | |
| +------------------------------------------------------+ |
| | Tab Content Area                                     | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Sidebar: Lesson Info, Statistics, Metadata               |
+----------------------------------------------------------+
```

**Content Tab**: Rich text editor with Markdown support, toolbar (Bold, Italic, Underline, H1, H2, UL, OL, Code, Img, Link), auto-save every 30 seconds

**Exercises Tab**: Accordion list of exercises with fields: Title, Instructions (rich text), Starter Code, Solution, Test Cases

**Quiz Tab**: Question list with types: Multiple Choice, True/False, Code Output. Fields: Question, Type, Options, Correct Answer, Code Snippet (for code-output), Explanation

**Settings Tab**: Lesson Title, Duration, XP Reward, Editor Mode (Visual/Text/Mixed), Status (Draft/Published), Prerequisites

**Sidebar**: Lesson Info (course, section, order), Statistics (completions, pass rate), Metadata (created/updated dates)

### 6.10 Badges

**Routes:**
- List: `/admin/badges`
- Create: `/admin/badges/create`
- Edit: `/admin/badges/:id/edit`

**Grid Layout**: 4-column grid. Each card shows icon with gradient, name, trigger type, earned count, status.

**Create/Edit Form Sections:**
1. Badge Appearance (Icon picker from Lucide, gradient colors, live preview)
2. Badge Details (Name, Description)
3. Trigger Configuration (Type: First Login, Complete First Lesson, Complete First Course, Reach Level X, Earn X XP, Complete X Lessons, Perfect Quiz Score, X Day Streak)
4. Status (Active/Inactive)

### 6.11 Shop

**Routes:**
- List: `/admin/shop`
- Create: `/admin/shop/create`
- Edit: `/admin/shop/:id/edit`

**Tabs by Category**: Avatars, UI Themes, Editor Themes

**Item Grid**: 4-column grid showing preview, name, price in coins, purchase count, status

**Create/Edit Form Sections:**
1. Item Details (Name, Description, Category)
2. Appearance (Preview Image upload, or Icon + colors for themes)
3. Pricing (Price in Coins, Limited Quantity optional)
4. Availability (Available/Coming Soon/Sold Out, Featured checkbox)

**Shop Management Notes:**
- Category packs for avatars (not individual selection)
- Predefined UI themes only (no custom creation)
- Predefined editor themes only
- Live preview when creating/editing
- Full admin override of teacher-created rewards
- Currency name: "Coins"
- Grandfathered + remove policy for price changes/deletions

### 6.12 Gamification Settings

**Route**: `/admin/gamification`

**Page Structure**
```
+----------------------------------------------------------+
| Gamification Settings                          [Save]     |
+----------------------------------------------------------+
| XP Values                                                 |
+----------------------------------------------------------+
| Level Formula                                             |
+----------------------------------------------------------+
| Individual Overrides                                      |
+----------------------------------------------------------+
```

**XP Values Section**: Table of XP rewards for actions (Complete Lesson, Complete Exercise, Perfect Quiz, Daily Login, First of Day). Reset to Default button per row. Immediate apply on save.

**Level Formula Section**:
```
Level XP = Base XP * (Multiplier ^ Level)
```
- Base XP: Number input (default: 100)
- Multiplier: Decimal input (default: 1.5)
- Preview table showing XP for levels 1-10
- No max level config, 100+ levels supported
- Individual level overrides supported

### 6.13 Feature Toggles

**Route**: `/admin/features`

**Available Toggles**

| Feature | Description |
|---------|-------------|
| Shop | Enable/disable coin shop |
| Badges | Enable/disable badge system |
| Daily Rewards | Enable daily login XP |
| Streaks | Enable streak tracking |
| Code Execution | Allow running code (safety) |
| Avatar Upload | Allow custom avatar uploads |

All toggles require clicking Save to apply. Confirmation dialog shown when disabling a feature.

### 6.14 System Settings

**Route**: `/admin/system`

**Code Execution Section**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Execution Timeout | Number | 10s | Max code run time |
| Memory Limit | Number | 128MB | Max memory per execution |
| Output Limit | Number | 10KB | Max stdout size |
| Network Access | Toggle | Off | Allow network in code |
| File System Access | Toggle | Off | Allow FS in code |

**File Upload Section**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Max File Size | Number | 5MB | Per-file limit |
| Allowed Types | Multi | Images | File type whitelist |
| Storage per User | Number | 50MB | Total storage quota |

**Sessions Section**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Session Duration | Number | 24h | Login session length |
| Remember Me Duration | Number | 30d | Extended session |
| Max Sessions | Number | 5 | Concurrent logins |

**Storage Section**: Read-only display of usage breakdown with "Clear Old Exports" button.

### 6.15 Admin Portal Common Patterns

#### 6.15.1 Tables

- Hover state: slate-50 background
- Sortable columns: Click header to sort, icon indicates direction
- Full-width layout
- Horizontal scroll on overflow
- Comfortable row density
- All columns sortable
- Always-visible row actions

#### 6.15.2 Pagination

```
Showing 1-10 of 156 results    [<] [1] [2] [3] ... [16] [>]
```

Numbered pagination with first, last, and 2 pages around current.

#### 6.15.3 Search & Filters

- Debounced search (300ms)
- Tab-scoped search (not global)
- Filter persistence with clear button
- Multiple filters combine with AND

#### 6.15.4 Modals

- Backdrop click closes (unless destructive)
- Escape key closes
- Focus trap within modal
- Button-only confirmations (no type-to-confirm)

#### 6.15.5 Toast Notifications

- Position: Bottom-right
- Toast + inline combo for error display
- Toast only for success feedback
- Auto-dismiss after 5s
- Types: Success (green), Error (red), Warning (amber), Info (blue)

#### 6.15.6 Empty States

Simple illustrations with call-to-action buttons.

#### 6.15.7 Loading States

- Skeleton loading for cards, tables, charts
- Inline spinner for buttons

#### 6.15.8 Form Patterns

- Full page forms for user creation/editing
- On-submit validation (not real-time)
- Unsaved changes warning (visual indicator + browser warning)
- Absolute short date format (e.g., "Jan 10, 2026")

### 6.16 Admin Portal State Management

#### 6.16.1 URL State

Persist in URL query parameters: current tab, search query, active filters, sort column/direction, current page.

Example: `/admin/users?tab=teachers&search=john&sort=name&order=asc&page=2`

#### 6.16.2 Local Storage

- Sidebar collapsed state
- Table view preferences (grid/table)
- Items per page preference

#### 6.16.3 Database Persistence

- Recently viewed items (per admin user)
- Last visited section (per admin user)

#### 6.16.4 Session Handling

Session timeout: Redirect to login (no modal)

#### 6.16.5 Concurrent Editing

Pessimistic locking for course/lesson editing. Lock indicator shows who is editing.

### 6.17 Admin Portal Route Inventory

**User Management**

| Page | Route | Status |
|------|-------|--------|
| Teacher List | /admin/teachers | Mocked |
| Teacher Create | /admin/teachers/create | Mocked |
| Teacher Edit | /admin/teachers/:id/edit | Mocked |
| Teacher Detail | /admin/teachers/:id | Mocked |
| Parent List | /admin/parents | Mocked |
| Parent Create | /admin/parents/create | Mocked |
| Parent Edit | /admin/parents/:id/edit | Mocked |
| Parent Detail | /admin/parents/:id | Mocked |
| Student List | /admin/students | Mocked |
| Student Create | /admin/students/create | Mocked |
| Student Edit | /admin/students/:id/edit | Mocked |
| Student Detail | /admin/students/:id | Mocked |

**Classes & Courses**

| Page | Route | Status |
|------|-------|--------|
| Class List | /admin/classes | Mocked |
| Class Create | /admin/classes/create | Mocked |
| Class Edit | /admin/classes/:id/edit | Mocked |
| Class Detail | /admin/classes/:id | Mocked |
| Course List | /admin/courses | Mocked |
| Course Create | /admin/courses/create | Mocked |
| Course Edit | /admin/courses/:id/edit | Mocked |
| Course Detail | /admin/courses/:id | Mocked |
| Lesson Editor | /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId | Mocked |

**Rewards & Settings**

| Page | Route | Status |
|------|-------|--------|
| Badge List | /admin/badges | Mocked |
| Badge Create | /admin/badges/create | Mocked |
| Badge Edit | /admin/badges/:id/edit | Mocked |
| Shop List | /admin/shop | Mocked |
| Shop Item Create | /admin/shop/create | Mocked |
| Shop Item Edit | /admin/shop/:id/edit | Mocked |
| Dashboard | /admin | Mocked |
| Gamification Settings | /admin/gamification | Mocked |
| Feature Toggles | /admin/features | Mocked |
| System Settings | /admin/system | Mocked |

**Teacher-Specific**

| Page | Route | Status |
|------|-------|--------|
| Help Requests | /admin/help-requests | Planned |
| Pending Rewards | /admin/pending-rewards | Planned |

---

## 7. Code Execution System

### 7.1 Architecture

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

### 7.2 JavaScript Execution

- Direct `eval()` in sandboxed iframe
- Console output captured
- Timeout via `setTimeout` wrapper
- Canvas API available for graphical output
- Dialogs allowed: alert/prompt/confirm work

### 7.3 Python Execution (Pyodide)

- Blocking load on first Python lesson (show loading indicator)
- Cache in browser for session
- Standard library available
- Minimal blocking: Only block os, sys, subprocess, socket
- Common packages: numpy (if size permits)
- Output via stdout capture
- Simple drawing library wrapper for canvas-like graphics

### 7.4 Safety Measures

| Measure | Value |
|---------|-------|
| Execution timeout | 7 seconds |
| Memory limit | Browser-enforced sandbox |
| Network access | Blocked |
| File system access | Virtual only |
| Infinite loop protection | Timeout kills execution |
| Rate limiting | None |

### 7.5 Error Handling

- Syntax errors: Show raw error with line number
- Runtime errors: Show stack trace
- Timeout: "Execution timed out. Check for infinite loops."
- Memory: "Memory limit exceeded."
- Pyodide load failure: "Python environment failed to load. Please refresh or try a different browser."

---

## 8. Visual Coding (Blockly)

### 8.1 Integration

- Blockly workspace for visual programming
- Teacher enables per-lesson
- Language-specific code generation: Generates JavaScript OR Python depending on course language
- Option to show generated code alongside blocks

### 8.2 Block Categories

- Logic (if/else, comparisons)
- Loops (for, while, repeat)
- Math (arithmetic, random)
- Text (strings, concatenation)
- Variables
- Functions
- Lists
- Custom blocks (teacher-defined, future enhancement)

### 8.3 Transition to Text

- Mixed mode shows blocks + generated code
- Students see correlation
- Gradual shift to text-only lessons

---

## 9. Notifications System

### 9.1 In-App Notifications

**All Users:**
- Account-related alerts

**Students:**
- Help request responses
- Badge unlocks (with animation)
- Level ups
- New content unlocked

**Teachers:**
- Student help requests
- Pending reward purchase queue

**Admins:**
- System alerts only (dropdown panel)
- No sidebar badges for pending counts

**No Announcements Feature**: All broadcast communication handled outside system.

### 9.2 Email Notifications

**Teachers Only** (for MVP):
- Student help request alerts
- Weekly progress summary (optional)
- Attendance alerts

**Configuration:**
- Teachers can configure email preferences
- Admins can set default notification settings

---

## 10. File Storage

### 10.1 S3-Compatible Storage (MinIO)

**Stored Items:**
- Lesson media (images, videos, audio, PDFs)
- Avatar images (preset library)
- Theme assets
- Sandbox project snapshots

**Organization:**
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

**Limits:**
- Max file size: 50MB (configurable)
- Allowed types: images (jpg, png, gif), video (mp4, webm), audio (mp3, wav), documents (pdf)

---

## 11. API Design

### 11.1 Architecture Style

RESTful API with Express

### 11.2 Authentication

- JWT tokens
- Access token (short-lived, 15 min)
- Refresh token (long-lived, 7 days)
- Role-based access control (RBAC)
- Email verification required for teachers/admins before first login

### 11.3 Request Patterns

**List Endpoints**
```
GET /api/admin/users?type=teacher&page=1&limit=10&sort=name&order=asc
```

Response:
```json
{
  "data": [...],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 10,
    "totalPages": 16
  }
}
```

**Error Response**
```json
{
  "error": {
    "code": "TEACHER_HAS_CLASSES",
    "message": "Cannot deactivate teacher with assigned classes",
    "details": {
      "classCount": 3
    }
  }
}
```

### 11.4 Core Endpoints

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

### 11.5 File Uploads

```
POST /api/admin/upload
Content-Type: multipart/form-data

Response:
{
  "url": "https://storage.example.com/...",
  "filename": "image.png",
  "size": 102400
}
```

---

## 12. Database Schema

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

## 13. Security Considerations

### 13.1 Authentication Security

- Passwords: bcrypt with cost factor 12+
- JWT signed with RS256
- Refresh token rotation
- Session invalidation on password change
- Email verification required for teachers/admins

### 13.2 Authorization

- Role-based access control (RBAC)
- Resource-level permissions (teachers only access their classes)
- Parent-child relationship verification (at least one parent required)

### 13.3 Data Protection

- HTTPS enforced
- Database encryption at rest
- Sensitive fields encrypted (PII)
- No plain-text password storage

### 13.4 Code Execution Safety

- Sandboxed iframe for JS
- Pyodide runs in web worker
- No network access from execution context
- Resource limits enforced
- Dialogs allowed but contained in sandbox

### 13.5 Input Validation

- Server-side validation for all inputs
- Sanitize user-generated content
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- Flexible whitespace in quiz validation (normalized matching)

---

## 14. Deployment

### 14.1 Docker Compose Setup

Multi-file configuration:
- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development with hot reload
- `docker-compose.test.yml` - Testing environment
- `docker-compose.prod.yml` - Production deployment

### 14.2 Base Configuration

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

### 14.3 Development URLs

| Service | URL |
|---------|-----|
| Student Portal | http://localhost:8080 |
| Admin Portal | http://localhost:8080/admin |
| API | http://localhost:8080/api |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

### 14.4 Quick Start Commands

```bash
make dev          # Start development environment
make test         # Run tests
make prod         # Start production environment
make logs         # View all logs
make clean        # Remove containers/volumes
```

### 14.5 Environment Variables

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

## 15. Performance Considerations

### 15.1 Frontend

- Code splitting per route
- Lazy load heavy components (code editor, Blockly)
- Blocking Pyodide load (no pre-warm, just show loading indicator)
- Image optimization (WebP, responsive sizes)
- Service worker for asset caching

### 15.2 Backend

- Database connection pooling
- Query optimization (indexes on foreign keys, common filters)
- Pagination for list endpoints
- Caching layer for static content (lessons)

### 15.3 Code Execution

- Web workers for non-blocking execution
- Pyodide cached in IndexedDB after first load
- Timeout enforcement client-side
- No rate limiting

---

## 16. Future Considerations (Post-MVP)

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
17. **Parent portal** (deferred)

---

## 17. Glossary

| Term | Definition |
|------|------------|
| Course | A collection of sections containing lessons, language-specific |
| Section | A grouping of related lessons within a course |
| Lesson | A single learning unit with content, exercises, or quizzes in any order |
| Exercise | A coding challenge with test case validation |
| Quiz | A set of questions assessing understanding |
| Parsons Problem | A quiz type where students reorder shuffled code blocks (unlabeled) |
| XP | Experience points earned through activities (first attempt only for quizzes) |
| Currency (Coins) | Virtual money earned alongside XP, spent in shop |
| Sandbox | Free-form coding environment for student experimentation |
| Blockly | Google's visual programming library using drag-drop blocks |
| Pyodide | Python interpreter compiled to WebAssembly |
| Pessimistic Locking | Editing lock that prevents concurrent edits |
| Crystal Glass | Student portal design system with frosted glass effects and 3D depth |
| MSW | Mock Service Worker - used for frontend API mocking in development |

---

## 18. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2026-01-17 | Unified specification combining spec.md, student-spec-v2.md, and admin-spec.md. Teacher Portal merged into Admin Portal section. Clarified implementation status. |
| 2.2.0 (student) | 2026-01-17 | Crystal glass design system, gamification animations, code execution system |
| 1.5 (spec) | 2026-01-16 | Portfolio feature to post-MVP, parent requirement updates |
| 1.3.0 (admin) | 2026-01-16 | Teacher role details, nested API routes, removed term system |

---

*This document is the single source of truth for Silver Edge Academy LMS development.*
