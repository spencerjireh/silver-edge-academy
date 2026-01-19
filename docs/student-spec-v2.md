# Silver Edge Academy - Student Portal Specification v2

> **Revision Note:** This document reflects the current implementation of the student portal, featuring a crystal glass design system with 3D depth effects, comprehensive gamification animations, and a full code execution system supporting JavaScript and Python.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Philosophy](#2-design-philosophy)
3. [Design System](#3-design-system)
   - 3.1 Typography
   - 3.2 Color Palette
   - 3.3 Crystal Glass Effects
   - 3.4 Spacing
   - 3.5 Border Radius
   - 3.6 3D Depth System
   - 3.7 Animations
   - 3.8 Icons
4. [Navigation](#4-navigation)
   - 4.1-4.4 Floating Crystal Nav, Mobile Nav
5. [Header](#5-header)
6. [Dashboard](#6-dashboard)
7. [Learn Page](#7-learn-page)
8. [Course Navigation](#8-course-navigation)
   - 8.2 Winding Path Layout
9. [Lesson View](#9-lesson-view)
10. [Code Editor](#10-code-editor)
    - 10.4 Code Execution System
11. [Exercises](#11-exercises)
12. [Quizzes](#12-quizzes)
13. [Code Page (Sandbox)](#13-code-page-sandbox)
14. [Profile Page](#14-profile-page)
15. [Shop Page](#15-shop-page)
16. [Notifications](#16-notifications)
17. [Help System](#17-help-system)
18. [Gamification System](#18-gamification-system)
19. [Common Patterns](#19-common-patterns)
20. [State Management](#20-state-management)
21. [API Integration](#21-api-integration)
22. [Directory Structure](#22-directory-structure)

---

## 1. Overview

### 1.1 Purpose

The Student Portal provides a calm, focused learning environment for children learning to code. The interface prioritizes learning content while maintaining engagement through thoughtful gamification with celebration moments.

### 1.2 Target Platform

- **Primary**: Desktop computers (classroom and home use)
- **Secondary**: Tablets (768px+)
- **Supported**: Large phones (limited, portrait orientation)
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

### 1.3 Target Age Range

**8-18 years** - Universal design that is:
- Simple enough for younger children to navigate
- Professional enough that teenagers don't feel it's "childish"
- Focused on learning with engaging gamification moments

### 1.4 Development Approach

> **Note:** Frontend-first development with MSW mocking. Backend integration pending.

> **Accessibility Note:** Full accessibility compliance (WCAG 2.1 AA) is planned for later stages of development.

**Mock Credentials:**

| Username    | Password    | Level | Description              |
| ----------- | ----------- | ----- | ------------------------ |
| alex_coder  | student123  | 5     | Mid-progress student     |
| maya_dev    | student123  | 12    | Advanced student         |
| newbie      | student123  | 1     | New student (onboarding) |

---

## 2. Design Philosophy

### 2.1 Core Principles

1. **Learning First** - Content is the hero
2. **Crystal Clarity** - Clean, modern glass aesthetic with depth
3. **Focused Navigation** - Three clear paths: Learn, Code, Me
4. **Celebration Moments** - Meaningful gamification with animations
5. **Universal Appeal** - Works for ages 8-18 without feeling childish

### 2.2 Design System: Crystal Glass

The student portal uses a **Crystal Glass Design System** featuring:
- Frosted glass effects with backdrop blur
- 3D depth achieved through border-based shadows (not box-shadow)
- Faceted gem-like interactive elements
- Multi-layer gradient highlights for depth
- Shimmer animations for interactive feedback

---

## 3. Design System

### 3.1 Typography

**Font Families** (Google Fonts)
- **Display/Headlines**: Bricolage Grotesque - Distinctive character without being childish
- **Body/UI**: DM Sans - Clean geometric, highly readable
- **Code**: JetBrains Mono - Clear monospace for code

**Weights**
- Display: 500 (medium), 600 (semibold), 700 (bold)
- Body: 400 (regular), 500 (medium), 600 (semibold)

**Base Size**: 16px

| Element         | Font           | Size   | Weight   | Color        |
| --------------- | -------------- | ------ | -------- | ------------ |
| Page Title      | Bricolage      | 24px   | Bold     | slate-800    |
| Section Header  | Bricolage      | 18px   | Semibold | slate-800    |
| Card Title      | Bricolage      | 16px   | Semibold | slate-700    |
| Body Text       | DM Sans        | 16px   | Regular  | slate-600    |
| Lesson Content  | DM Sans        | 18px   | Regular  | slate-600    |
| Small/Caption   | DM Sans        | 14px   | Regular  | slate-500    |
| Button Text     | DM Sans        | 16px   | Semibold | varies       |
| Code            | JetBrains Mono | 15px   | Regular  | varies       |

### 3.2 Color Palette

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
Used for CTAs, current indicators, and action buttons:
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

### 3.3 Crystal Glass Effects

The crystal glass aesthetic is achieved through layered effects:

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

**Active State with Color Tint**
```css
.crystal-active {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.08) 50%,
    rgba(139, 92, 246, 0.12) 100%
  );
  border-color: rgba(139, 92, 246, 0.3);
}
```

### 3.4 Spacing

Base unit: 4px

| Token | Value | Usage                    |
| ----- | ----- | ------------------------ |
| xs    | 4px   | Tight spacing            |
| sm    | 8px   | Icon gaps                |
| md    | 16px  | Component padding        |
| lg    | 24px  | Section gaps             |
| xl    | 32px  | Page padding             |
| 2xl   | 48px  | Major section spacing    |

### 3.5 Border Radius

| Token   | Value  | Usage                |
| ------- | ------ | -------------------- |
| sm      | 8px    | Small elements       |
| default | 12px   | Inputs, small cards  |
| md      | 16px   | Cards, buttons       |
| lg      | 20px   | Large cards          |
| xl      | 24px   | Nav pills, panels    |
| full    | 9999px | Avatars, badges      |

### 3.6 3D Depth System

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

### 3.7 Animations

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

/* Float up (generic) */
@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

/* Slide in from right */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Toast slide down */
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Coin spin */
@keyframes spin-coin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
```

### 3.8 Icons

- **Library**: Lucide React
- **Default Size**: 20px (w-5 h-5)
- **Nav Size**: 24px (w-6 h-6)
- **Large Size**: 32px (w-8 h-8)
- **Style**: Rounded/friendly variants

---

## 4. Navigation

### 4.1 Floating Crystal Navigation

The primary navigation uses faceted crystal gem buttons fixed to the left side of the viewport.

**Navigation Items**

| Icon      | Label | Route     | Description           |
| --------- | ----- | --------- | --------------------- |
| book-open | Learn | /         | Home - course list    |
| code      | Code  | /sandbox  | Sandbox/playground    |
| user      | Me    | /profile  | Profile & settings    |

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
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(139, 92, 246, 0.1);
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
  border-bottom-color: rgba(139, 92, 246, 0.3);
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

### 4.2 Mobile Navigation (< 768px)

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

.nav-gem.mobile {
  width: auto;
  padding: 10px 16px;
  flex-direction: row;
  gap: 6px;
}
```

### 4.3 Notification Badge

```css
.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--coral-500);
  border: 2px solid white;
}
```

---

## 5. Header

### 5.1 Structure

Minimal header with crystal glass styling.

**Desktop Layout**
```
+------------------------------------------------------------------+
|  [Logo] Silver Edge Academy              [Lv 5] [350] [Avatar]   |
+------------------------------------------------------------------+
```

### 5.2 Components

**Logo**
- Small icon (32px) + text "Silver Edge Academy" (desktop only)
- Links to Learn page

**Level Badge**
```jsx
<LevelBadge level={user.level} />
```
- Crystal pill with violet tint
- Shows "Lv {number}"

**Coin Display**
```jsx
<CoinDisplay amount={user.coins} />
```
- Yellow coin icon + amount
- Click navigates to shop

**Avatar**
- 36px circular avatar
- Links to Profile

### 5.3 Header Styling

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

---

## 6. Dashboard

**Route**: `/dashboard` (also accessible from Learn page)

The Dashboard provides an overview of student progress with gamification elements.

### 6.1 Layout

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

### 6.2 Stats Cards

Crystal glass cards showing:
- Level with XP progress bar
- Coin balance
- Current streak with fire icon

### 6.3 Statistics Grid

Three stat cards showing completion counts:
- Lessons completed
- Exercises passed
- Quizzes finished

---

## 7. Learn Page

**Route**: `/`

The Learn page is the student's home, focused on getting them back to learning.

### 7.1 Layout

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

### 7.2 Continue Card

Prominent crystal card showing where to resume learning.

```css
.continue-card {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08) 0%,
    rgba(139, 92, 246, 0.04) 100%
  );
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-bottom: 3px solid rgba(139, 92, 246, 0.15);
  border-radius: 20px;
  padding: 24px;
}
```

### 7.3 Course Grid

**Grid Layout**
- 1 column on mobile
- 2 columns on tablet (768px+)
- 3 columns on desktop (1200px+)

**Course Card Styling**

Each course has language-specific theming:

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

/* Scratch - Orange */
.course-card.scratch {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-color: rgba(249, 115, 22, 0.3);
}

/* Web - Green */
.course-card.web {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border-color: rgba(16, 185, 129, 0.3);
}
```

---

## 8. Course Navigation

### 8.1 Course Map View

**Route**: `/courses/:courseId`

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

### 8.2 Winding Path Layout

SVG-based path visualization that renders lessons in a gentle wave pattern:

```typescript
// Path generation creates quadratic bezier curves
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

**Path Specifications**
```css
.winding-path {
  stroke: var(--stone-300);
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
}

.winding-path.completed {
  stroke: var(--violet-400);
}
```

**Responsive Behavior**
- Desktop: Wave pattern with vertical movement
- Mobile: Horizontal straight line (simpler)

### 8.3 Lesson Node States

| State       | Visual                                    |
| ----------- | ----------------------------------------- |
| Completed   | Violet fill, white checkmark              |
| Current     | Coral fill, breathing animation           |
| Available   | White fill, violet border, number         |
| Locked      | Gray fill, lock icon                      |

**Node Styling**
```css
.lesson-node {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 200ms ease;
  border-bottom: 3px solid transparent;
}

.lesson-node.completed {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  border-bottom-color: rgba(109, 40, 217, 0.5);
}

.lesson-node.current {
  background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
  color: white;
  border-bottom-color: rgba(225, 29, 72, 0.5);
  animation: breathe 3s ease-in-out infinite;
}

.lesson-node.available {
  background: white;
  border: 2px solid var(--violet-400);
  color: var(--violet-600);
  border-bottom: 3px solid rgba(139, 92, 246, 0.2);
}

.lesson-node.available:hover {
  background: var(--violet-50);
  transform: scale(1.05);
}

.lesson-node.locked {
  background: var(--stone-200);
  color: var(--stone-400);
  border-bottom-color: rgba(0, 0, 0, 0.1);
}
```

---

## 9. Lesson View

**Route**: `/courses/:courseId/lessons/:lessonId`

### 9.1 Layout

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

### 9.2 Multi-Step Lessons

Lessons can contain multiple steps including:
- Content steps (markdown/text)
- Exercise steps (code challenges)
- Quiz steps (questions)

Navigation shows step progress: "Step 3 of 5"

### 9.3 Content Styling

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

.lesson-content code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}
```

---

## 10. Code Editor

### 10.1 Editor Component

Used in exercises, quizzes, and sandbox.

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

### 10.2 Editor Styling

```css
.code-editor {
  background: var(--slate-900);
  border-radius: 12px;
  overflow: hidden;
  border-bottom: 3px solid rgba(0, 0, 0, 0.3);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--slate-800);
  border-bottom: 1px solid var(--slate-700);
}

.editor-textarea {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--slate-100);
  background: transparent;
  resize: none;
}

.line-numbers {
  color: var(--slate-500);
  text-align: right;
  padding-right: 12px;
  border-right: 1px solid var(--slate-700);
  user-select: none;
}
```

### 10.3 Toolbar Buttons

```css
.run-button {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.run-button:hover {
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
}

.run-button:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
}

.stop-button {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
}

.reset-button {
  background: var(--slate-700);
  color: var(--slate-300);
}
```

### 10.4 Code Execution System

The portal supports executing JavaScript and Python code:

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
// Code Runner Service
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

### 10.5 Output Panel

```css
.output-panel {
  background: var(--slate-950);
  border-top: 2px solid var(--slate-700);
  padding: 16px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.output-line {
  color: var(--slate-300);
  margin-bottom: 4px;
}

.output-line::before {
  content: '>';
  color: var(--green-500);
  margin-right: 8px;
}

.output-error {
  color: var(--red-400);
}

.output-success {
  color: var(--green-400);
}
```

---

## 11. Exercises

### 11.1 Exercise View

**Route**: `/courses/:courseId/lessons/:lessonId/exercises/:exerciseId`

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

### 11.2 Test Results

After submission, show test results:

```
+----------------------------------------------------------+
| Test Results                                             |
+----------------------------------------------------------+
| [Check] Test 1: Output matches expected        Passed    |
| [Check] Test 2: No syntax errors              Passed    |
| [X]     Test 3: Uses console.log              Failed    |
+----------------------------------------------------------+
| 2/3 tests passed                                         |
+----------------------------------------------------------+
```

### 11.3 Success State

```
+----------------------------------------------------------+
|                                                          |
|           [Checkmark in Circle]                          |
|                                                          |
|           Great job!                                     |
|           You passed all 3 tests.                        |
|                                                          |
|           +10 XP  (animated float)                       |
|                                                          |
|  [Continue ->]                                           |
|                                                          |
+----------------------------------------------------------+
```

---

## 12. Quizzes

### 12.1 Quiz View

**Route**: `/courses/:courseId/lessons/:lessonId/quizzes/:quizId`

```
+----------------------------------------------------------+
| Question 2 of 5                                          |
+----------------------------------------------------------+
|                                                          |
| What keyword starts a for loop in JavaScript?            |
|                                                          |
| ( ) while                                                |
| (o) for                                                  |
| ( ) loop                                                 |
| ( ) repeat                                               |
|                                                          |
+----------------------------------------------------------+
| [<- Previous]                           [Next Question]  |
+----------------------------------------------------------+
```

### 12.2 Quiz Results

```
+----------------------------------------------------------+
|                                                          |
|  Quiz Complete!                                          |
|                                                          |
|  4/5 Correct (80%)                                       |
|                                                          |
|  +25 XP                                                  |
|                                                          |
|  [Review Answers]               [Continue ->]            |
|                                                          |
+----------------------------------------------------------+
```

---

## 13. Code Page (Sandbox)

### 13.1 Sandbox List

**Route**: `/sandbox`

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

### 13.2 Sandbox Editor

**Route**: `/sandbox/:projectId`

```
+----------------------------------------------------------+
| Project: Calculator                  [Save] [Delete]     |
+----------------------------------------------------------+
| [Full Code Editor with larger height]                    |
|                                                          |
|                                                          |
|                                                          |
+----------------------------------------------------------+
| [Output Panel]                                           |
+----------------------------------------------------------+
```

### 13.3 Features

- Language selector (JavaScript/Python)
- Auto-save project state
- Create new projects
- Delete projects
- Full-height editor for workspace feel

---

## 14. Profile Page

**Route**: `/profile`

### 14.1 Layout

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

### 14.2 Progress Tab

- Statistics grid (lessons, exercises, quizzes)
- Current streak display
- XP breakdown

### 14.3 Badges Tab

```
+------------------------------------------------------------------+
| Earned Badges (8)                                                |
+------------------------------------------------------------------+
| +--------+  +--------+  +--------+  +--------+                   |
| | [Icon] |  | [Icon] |  | [Icon] |  | [Icon] |                   |
| | First  |  | Bug    |  | Streak |  | Loop   |                   |
| | Steps  |  | Squash |  | Master |  | Hero   |                   |
| +--------+  +--------+  +--------+  +--------+                   |
+------------------------------------------------------------------+
| Locked Badges                                                    |
+------------------------------------------------------------------+
| +--------+  +--------+  +--------+  +--------+                   |
| | [Lock] |  | [Lock] |  | [Lock] |  | [Lock] |                   |
| |  ???   |  |  ???   |  |  ???   |  |  ???   |                   |
| +--------+  +--------+  +--------+  +--------+                   |
+------------------------------------------------------------------+
```

### 14.4 Avatar Selection

**Route**: `/profile/avatar`

Grid of available avatars with:
- Owned avatars (selectable)
- Locked avatars (show price)
- Current selection indicator

---

## 15. Shop Page

**Route**: `/shop`

### 15.1 Layout

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

### 15.2 Item Card

```css
.shop-item {
  background: white;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  border: 1px solid var(--stone-200);
  border-bottom: 3px solid rgba(0, 0, 0, 0.08);
  transition: all 200ms ease;
}

.shop-item:hover:not(.owned) {
  transform: translateY(-2px);
  border-color: var(--violet-200);
}

.shop-item.owned {
  background: var(--green-50);
  border-color: var(--green-200);
}

.shop-item .price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--amber-600);
  font-weight: 600;
}
```

### 15.3 Categories

- **Avatars**: Profile pictures
- **UI Themes**: App color themes (future)
- **Editor Themes**: Code editor themes (future)
- **Rewards**: Teacher-redeemable items

---

## 16. Notifications

**Route**: `/notifications`

### 16.1 Layout

```
+------------------------------------------------------------------+
| Notifications                              [Mark All Read]       |
+------------------------------------------------------------------+
|                                                                  |
| +------------------------------------------------------------+  |
| | [Badge Icon]  You earned the "Bug Squasher" badge!         |  |
| |               2 hours ago                           [Unread]|  |
| +------------------------------------------------------------+  |
|                                                                  |
| +------------------------------------------------------------+  |
| | [Help Icon]   Your teacher responded to your help request  |  |
| |               Yesterday                                    |  |
| +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

### 16.2 Notification Types

- Badge earned
- Help request response
- Level up
- Course completion
- System announcements

---

## 17. Help System

### 17.1 Help Request Flow

**Route**: `/help`

```
+------------------------------------------+
| My Help Requests                         |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| | Understanding Loops                  | |
| | Status: Waiting for response         | |
| | Submitted: 2 hours ago               | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | Variables Question                   | |
| | Status: Resolved                     | |
| | Response from: Ms. Smith             | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

### 17.2 Help Request Modal

From within exercises/lessons:

```
+------------------------------------------+
| Ask Your Teacher for Help                |
+------------------------------------------+
| Exercise: Understanding Loops            |
|                                          |
| Your code will be shared with your       |
| teacher to help them assist you.         |
|                                          |
| What do you need help with?              |
| [Text area for question]                 |
|                                          |
| [Cancel]                    [Send]       |
+------------------------------------------+
```

### 17.3 Constraints

- One pending request at a time
- Button disabled while pending
- Notification when teacher responds

---

## 18. Gamification System

### 18.1 Philosophy

Gamification provides meaningful celebration moments without constant distraction:
- **Visible when earned**: Animations on achievement
- **Accessible when sought**: Stats in Profile
- **Not constantly demanding attention**: Clean learning interface

### 18.2 Event System

The gamification system uses an event queue managed by `GamificationContext`:

```typescript
interface GamificationEvent {
  type: 'xp' | 'coin' | 'badge' | 'levelUp';
  data: {
    amount?: number;
    badge?: Badge;
    newLevel?: number;
    message?: string;
  };
}

// Usage
const { triggerEvent } = useGamification();
triggerEvent({ type: 'xp', data: { amount: 10 } });
```

### 18.3 Animation Components

**XP Gain Animation**
```jsx
<XpGainAnimation amount={10} position={{ x, y }} />
```
- Gold text floats up from action location
- Scale bounce on appear
- Fades out over 800ms

**Coin Earn Animation**
```jsx
<CoinEarnAnimation amount={5} />
```
- Coin icon with spin animation
- Float up effect
- Yellow/gold coloring

**Badge Unlock**
```jsx
<BadgeUnlockModal badge={badge} onClose={handleClose} />
```
- Modal overlay with badge reveal
- Pop-in animation for badge icon
- Badge name and description
- Confetti effect option

**Level Up**
```jsx
<LevelUpToast level={6} onClose={handleClose} />
```
- Toast notification (not blocking modal)
- Large level badge with glow
- Auto-dismiss after 3 seconds

**Confetti Effect**
```jsx
<ConfettiEffect active={showConfetti} />
```
- Particle system with colored squares
- Falls from top of screen
- Used for major achievements

### 18.4 Celebration Moments

| Event | Animation | Duration |
|-------|-----------|----------|
| Complete exercise | XP float | 800ms |
| Pass quiz | XP float | 800ms |
| Earn badge | Badge modal + confetti | 3s |
| Level up | Toast notification | 3s |
| Earn coins | Coin float | 800ms |

---

## 19. Common Patterns

### 19.1 Buttons

**Variants**

| Variant   | Style | Usage |
| --------- | ----- | ----- |
| Primary   | Violet gradient | Main actions |
| Secondary | Violet outline | Alternative actions |
| Coral     | Coral gradient | CTAs, Continue |
| Ghost     | Transparent | Tertiary actions |
| Success   | Green gradient | Confirmations |
| Danger    | Red gradient | Destructive |

**Base Button Styling**
```css
.button {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 12px;
  border-bottom: 3px solid rgba(0, 0, 0, 0.15);
  transition: all 150ms ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
}

.button.primary {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
}

.button.coral {
  background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
  color: white;
}
```

### 19.2 Cards

```css
.card {
  background: white;
  border: 1px solid var(--stone-200);
  border-bottom: 3px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  transition: all 200ms ease;
}

.card.interactive:hover {
  transform: translateY(-2px);
  border-color: var(--violet-200);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.1);
}
```

### 19.3 Loading States

**Skeleton**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--stone-200) 0%,
    var(--stone-100) 50%,
    var(--stone-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 8px;
}
```

**Spinner**
- Violet colored
- 24px default size
- Spin animation

### 19.4 Empty States

```jsx
<EmptyState
  icon={<FolderIcon />}
  title="No projects yet"
  description="Create your first project in the Sandbox!"
  action={<Button>Go to Sandbox</Button>}
/>
```

### 19.5 Toast Notifications

```css
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--stone-200);
  border-bottom: 3px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: slide-in-right 200ms ease;
}

.toast.success {
  border-left: 4px solid var(--green-500);
}

.toast.error {
  border-left: 4px solid var(--red-500);
}
```

### 19.6 Progress Bar

```css
.progress-bar {
  height: 8px;
  background: var(--stone-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--violet-400), var(--violet-500));
  border-radius: 4px;
  transition: width 300ms ease;
}
```

---

## 20. State Management

### 20.1 Context Providers

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
```

**ToastContext**
```typescript
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

### 20.2 React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,         // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 20.3 Query Hooks

Located in `hooks/queries/`:

| Hook | Purpose |
|------|---------|
| `useDashboard()` | Dashboard data |
| `useCourses()` | Course list |
| `useCourseMap(courseId)` | Course structure |
| `useLesson(lessonId)` | Lesson content |
| `useExercises()` | Exercise data |
| `useSubmitExercise()` | Submit mutation |
| `useQuizzes()` | Quiz data |
| `useSandbox()` | Sandbox projects |
| `useProfile()` | User profile |
| `useBadges()` | Badge collection |
| `useShop()` | Shop items |
| `usePurchaseItem()` | Purchase mutation |
| `useNotifications()` | Notifications |
| `useHelp()` | Help requests |
| `useGamification()` | Gamification data |

### 20.4 Local Storage

| Key | Content |
|-----|---------|
| `auth_token` | JWT access token |
| `refresh_token` | JWT refresh token |
| `sandbox_draft` | Current code |

---

## 21. API Integration

### 21.1 API Client

Located in `services/api/`:

```typescript
// Base client with auth interceptor
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 21.2 MSW Mocking

Development uses Mock Service Worker:

```typescript
// mocks/handlers.ts
export const handlers = [
  http.get('/api/courses', () => {
    return HttpResponse.json(mockCourses);
  }),
  // ... other handlers
];
```

---

## 22. Directory Structure

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
│   │   ├── useDashboard.ts
│   │   ├── useCourses.ts
│   │   ├── useLesson.ts
│   │   ├── useExercises.ts
│   │   ├── useQuizzes.ts
│   │   ├── useSandbox.ts
│   │   ├── useProfile.ts
│   │   ├── useBadges.ts
│   │   ├── useShop.ts
│   │   ├── useNotifications.ts
│   │   ├── useHelp.ts
│   │   └── useGamification.ts
│   └── useCodeRunner.ts
├── services/
│   ├── api/                   # API client functions
│   │   └── index.ts
│   └── codeRunner/            # Code execution
│       ├── CodeRunnerService.ts
│       ├── JavaScriptExecutor.ts
│       └── PythonExecutor.ts
├── workers/
│   └── pythonWorker.ts        # Pyodide web worker
├── types/
│   └── index.ts               # TypeScript definitions
├── utils/
│   └── index.ts               # Helper utilities
├── mocks/
│   ├── handlers.ts            # MSW handlers
│   └── data/                  # Mock data
├── routes/
│   └── index.tsx              # Router configuration
├── App.tsx
├── main.tsx
└── index.css                  # Global styles & design tokens
```

---

## Appendix: Route Inventory

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

*Version: 2.2.0*
*Last Updated: 2026-01-17*

### Revision History

| Version | Date | Changes |
| ------- | ---- | ------- |
| 2.2.0 | 2026-01-17 | Major update to reflect actual implementation: Crystal glass design system with 3D border-based depth, faceted navigation gems, comprehensive gamification animation system (XP, coins, badges, level up, confetti), full code execution with JavaScript and Python (Pyodide), additional pages (Dashboard, Notifications, Help), detailed component inventory, query hooks documentation, directory structure. |
| 2.1.0 | 2026-01-17 | Design polish: Bricolage Grotesque + DM Sans typography, coral accent color, refined nav pills, context-aware navigation, language-specific course card gradients, winding path visualization. |
| 2.0.0 | 2026-01-17 | Complete rework: floating pill navigation, simplified Learn page, gamification moved to Profile, calm lavender palette |
