# Silver Edge Academy - Admin Portal Specification

> This document extends the main `spec.md` and serves as the complete specification for the Admin Portal. It defines all screens, components, behaviors, and interactions for the administrative interface.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System](#2-design-system)
3. [Layout & Navigation](#3-layout--navigation)
4. [Dashboard](#4-dashboard)
5. [User Management](#5-user-management)
6. [Classes](#6-classes)
7. [Courses](#7-courses)
8. [Badges](#8-badges)
9. [Shop](#9-shop)
10. [Gamification Settings](#10-gamification-settings)
11. [Feature Toggles](#11-feature-toggles)
12. [System Settings](#12-system-settings)
13. [Common Patterns](#13-common-patterns)
14. [State Management](#14-state-management)
15. [API Integration](#15-api-integration)

---

## 1. Overview

### 1.1 Purpose

The Admin Portal provides full administrative control over the Silver Edge Academy LMS. Administrators have unrestricted access to all system features, while Teachers function as restricted administrators with limited scope.

### 1.2 Target Platform

- **Desktop only** - No mobile or tablet optimization required
- **Minimum viewport**: 1280px width
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

### 1.3 Access Control

| Role    | Access Level                                      |
| ------- | ------------------------------------------------- |
| Admin   | Full access to all features                       |
| Teacher | Restricted admin - limited to assigned classes    |

### 1.4 Teacher Role Details

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

### 1.5 Development Approach

> **Note:** The Admin Portal follows a **frontend-first development approach**. All API calls are mocked using Mock Service Worker (MSW) in development mode. Backend integration will be implemented separately.

**Mock Credentials for Testing:**

| Role    | Email                          | Password    |
| ------- | ------------------------------ | ----------- |
| Admin   | admin@silveredge.com           | password123    |
| Teacher | teacher1@silveredge.com       | password123   |

**Implementation Status:**
- Frontend: Fully implemented with MSW mocking
- Backend: Pending integration
- Authentication: Mocked (JWT-style tokens stored in localStorage)

---

## 2. Design System

### 2.1 Typography

- **Font Family**: Nunito (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

| Element         | Size   | Weight | Color        |
| --------------- | ------ | ------ | ------------ |
| Page Title      | 18px   | Bold   | slate-800    |
| Section Header  | 14px   | Semibold | slate-800  |
| Body Text       | 14px   | Regular | slate-600   |
| Small/Caption   | 12px   | Regular | slate-400   |
| Table Header    | 12px   | Semibold | slate-500  |
| Table Cell      | 14px   | Regular | slate-700   |

### 2.2 Color Palette

**Accent Colors (Indigo)**
```
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
```
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
```
Success: emerald-500 (#10b981)
Warning: amber-500 (#f59e0b)
Error:   red-500 (#ef4444)
Info:    sky-500 (#0ea5e9)
```

### 2.3 Spacing

Base unit: 4px

| Token | Value | Usage                    |
| ----- | ----- | ------------------------ |
| xs    | 4px   | Tight spacing            |
| sm    | 8px   | Component padding        |
| md    | 12px  | Default gaps             |
| lg    | 16px  | Section padding          |
| xl    | 24px  | Page padding             |
| 2xl   | 32px  | Large section spacing    |

### 2.4 Border Radius

| Token   | Value | Usage              |
| ------- | ----- | ------------------ |
| sm      | 4px   | Small elements     |
| default | 6px   | Inputs, buttons    |
| md      | 8px   | Cards              |
| lg      | 12px  | Panels, modals     |
| xl      | 16px  | Large containers   |
| full    | 9999px| Pills, avatars     |

### 2.5 Shadows

```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow:    0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### 2.6 Icons

- **Library**: Lucide Icons
- **Default Size**: 20px (w-5 h-5)
- **Small Size**: 16px (w-4 h-4)
- **Large Size**: 24px (w-6 h-6)

---

## 3. Layout & Navigation

### 3.1 Page Structure

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

### 3.2 Sidebar

**Dimensions**
- Expanded width: 256px (w-64)
- Collapsed width: 72px
- Transition: 200ms ease-in-out

**Structure**
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
- **Selected state persists** in collapsed view (accent background)
- Collapse state persisted in localStorage

**Navigation Items**
| Item            | Icon              | Route              |
| --------------- | ----------------- | ------------------ |
| Dashboard       | layout-dashboard  | /admin             |
| Teachers        | graduation-cap    | /admin/teachers    |
| Parents         | users             | /admin/parents     |
| Students        | user              | /admin/students    |
| Classes         | school            | /admin/classes     |
| Courses         | book-open         | /admin/courses     |
| Badges          | award             | /admin/badges      |
| Shop            | shopping-bag      | /admin/shop        |
| Gamification    | trophy            | /admin/gamification|
| Features        | toggle-right      | /admin/features    |
| System          | settings          | /admin/system      |

### 3.3 Header

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
- **Notifications**: Bell icon with badge for unread count
- **Help**: Question mark icon (future feature)

**Styling**
- Background: white/80 with backdrop-blur
- Border: slate-200 bottom
- Sticky positioning
- z-index: 10

### 3.4 Content Area

- Padding: 24px (p-6)
- Background: slate-50
- Fade-in animation on page load (400ms)

---

## 4. Dashboard

**Route**: `/admin`

### 4.1 Statistics Cards

Row of 4 cards displaying key metrics:

| Card          | Icon       | Color   | Metric                    |
| ------------- | ---------- | ------- | ------------------------- |
| Total Users   | users      | accent  | Count of all active users |
| Active Classes| school     | emerald | Classes in current term   |
| Courses       | book-open  | amber   | Published courses         |
| XP Earned     | zap        | violet  | Total XP earned this week |

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

### 4.2 Charts Section

Two-column layout:

**Left: User Activity (Line Chart)**
- Title: "User Activity"
- Subtitle: "Daily active users over the past 30 days"
- X-axis: Dates
- Y-axis: Active user count
- Hover: Show exact values

**Right: Course Progress (Bar Chart)**
- Title: "Course Progress"
- Subtitle: "Average completion by course"
- X-axis: Course names
- Y-axis: Percentage (0-100%)
- Color-coded by language (amber=JS, sky=Python)

### 4.3 Recently Viewed

**Persistence**: Stored in database per admin user

**Structure**
```
+------------------------------------------+
| Recently Viewed                    [View All] |
+------------------------------------------+
| [Icon] Item Name          Type    Time    |
| [Icon] Item Name          Type    Time    |
| [Icon] Item Name          Type    Time    |
+------------------------------------------+
```

**Tracked Items**
- Users (individual user profiles)
- Classes
- Courses

**Display**
- Maximum 5 items shown
- Icon varies by type
- Relative time ("2 hours ago", "Yesterday")
- Click navigates to item

---

## 5. User Management

User management is split into three separate pages for Teachers, Parents, and Students, each with dedicated routes and tailored interfaces.

### 5.1 Teachers

**Route**: `/admin/teachers`

#### 5.1.1 Teacher List Page

**Structure**
```
+----------------------------------------------------------+
| Teachers                                  [+ Add Teacher]  |
+----------------------------------------------------------+
| Search [____________] [Status \/] [Sort \/]               |
+----------------------------------------------------------+
| Table                                                     |
+----------------------------------------------------------+
| Pagination                                                |
+----------------------------------------------------------+
```

**Table Columns**
| Column        | Width  | Sortable | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| Name          | auto   | Yes      | Full name with avatar          |
| Email         | 200px  | Yes      | Email address                  |
| Classes       | 100px  | Yes      | Count of assigned classes      |
| Students      | 100px  | Yes      | Total students across classes  |
| Status        | 100px  | Yes      | Active/Inactive badge          |
| Joined        | 120px  | Yes      | Registration date              |
| Actions       | 80px   | No       | Dropdown menu                  |

**Row Actions**
- View Profile
- Edit
- Deactivate (disabled if has assigned classes)

**Deactivation Rule**: Teachers with assigned classes cannot be deactivated. The action is disabled with tooltip: "Remove teacher from all classes first"

#### 5.1.2 Teacher Create Form

**Route**: `/admin/teachers/create`

**Form Sections**

1. **Basic Information**
   - First Name (required)
   - Last Name (required)
   - Email (required, validated)
   - Password (required, min 8 chars)
   - Confirm Password (required, must match)

2. **Teacher-Specific Fields**
   - Assign to Classes (multi-select, optional)

3. **Status**
   - Radio: Active (default) / Inactive

**Form Actions**
- Cancel (returns to teacher list)
- Create Teacher (submits form)

#### 5.1.3 Teacher Edit Form

**Route**: `/admin/teachers/:id/edit`

Same structure as create form with:
- Pre-populated fields
- Password fields optional (only if changing)
- Shows created/updated timestamps

**Danger Zone**
- Deactivate Teacher button (with confirmation)
- Button disabled if teacher has assigned classes

#### 5.1.4 Teacher Detail Page

**Route**: `/admin/teachers/:id`

**Structure**
```
+----------------------------------------------------------+
| [Back] Teacher Name                        [Edit] [...]   |
+----------------------------------------------------------+
| Profile Card                                              |
| +------------------------------------------------------+ |
| | [Avatar]  Name, Email, Teacher Badge               | |
| |           Status, Joined Date                        | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| [Overview] [Classes] [Activity]                          |
+----------------------------------------------------------+
| Tab Content                                               |
+----------------------------------------------------------+
```

**Overview Tab**
- Quick stats cards (classes count, total students, active courses)
- Recent activity timeline

**Classes Tab**
- List of assigned classes with student counts
- Class progress summaries
- Quick links to class details

**Activity Tab**
- Full activity log with filters
- Login history
- Actions performed

---

### 5.2 Parents

**Route**: `/admin/parents`

#### 5.2.1 Parent List Page

**Structure**
```
+----------------------------------------------------------+
| Parents                                    [+ Add Parent]  |
+----------------------------------------------------------+
| Search [____________] [Status \/] [Sort \/]               |
+----------------------------------------------------------+
| Table                                                     |
+----------------------------------------------------------+
| Pagination                                                |
+----------------------------------------------------------+
```

**Table Columns**
| Column        | Width  | Sortable | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| Name          | auto   | Yes      | Full name with avatar          |
| Email         | 200px  | Yes      | Email address                  |
| Children      | 150px  | Yes      | Linked student names           |
| Status        | 100px  | Yes      | Active/Inactive badge          |
| Joined        | 120px  | Yes      | Registration date              |
| Actions       | 80px   | No       | Dropdown menu                  |

**Row Actions**
- View Profile
- Edit
- Deactivate

#### 5.2.2 Parent Create Form

**Route**: `/admin/parents/create`

**Form Sections**

1. **Basic Information**
   - First Name (required)
   - Last Name (required)
   - Email (required, validated)
   - Password (required, min 8 chars)
   - Confirm Password (required, must match)

2. **Parent-Specific Fields**
   - Link Children (student search/select, optional)
   - Search existing students by name/username
   - Display linked children as cards with remove option

3. **Status**
   - Radio: Active (default) / Inactive

**Form Actions**
- Cancel (returns to parent list)
- Create Parent (submits form)

#### 5.2.3 Parent Edit Form

**Route**: `/admin/parents/:id/edit`

Same structure as create form with:
- Pre-populated fields including linked children
- Password fields optional (only if changing)
- Shows created/updated timestamps
- Can add/remove children links

**Danger Zone**
- Deactivate Parent button (with confirmation)

#### 5.2.4 Parent Detail Page

**Route**: `/admin/parents/:id`

**Structure**
```
+----------------------------------------------------------+
| [Back] Parent Name                         [Edit] [...]   |
+----------------------------------------------------------+
| Profile Card                                              |
| +------------------------------------------------------+ |
| | [Avatar]  Name, Email, Parent Badge                 | |
| |           Status, Joined Date                        | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| [Overview] [Children] [Activity]                         |
+----------------------------------------------------------+
| Tab Content                                               |
+----------------------------------------------------------+
```

**Overview Tab**
- Account information
- Quick links to children profiles

**Children Tab**
- Cards for linked children showing:
  - Avatar, name, class
  - Current level, XP
  - Recent course progress
  - Link to child's detail page
- "Link Children" button to add more children

**Activity Tab**
- Login history
- Account changes

---

### 5.3 Students

**Route**: `/admin/students`

#### 5.3.1 Student List Page

**Structure**
```
+----------------------------------------------------------+
| Students                                  [+ Add Student]  |
+----------------------------------------------------------+
| Search [____________] [Class \/] [Status \/] [Sort \/]    |
+----------------------------------------------------------+
| Table                                                     |
+----------------------------------------------------------+
| Pagination                                                |
+----------------------------------------------------------+
```

**Table Columns**
| Column        | Width  | Sortable | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| Name          | auto   | Yes      | Full name with avatar          |
| Username      | 150px  | Yes      | Student username               |
| Class         | 150px  | Yes      | Assigned class name            |
| Level         | 80px   | Yes      | Current level number           |
| XP            | 100px  | Yes      | Total XP earned                |
| Status        | 100px  | Yes      | Active/Inactive badge          |
| Joined        | 120px  | Yes      | Registration date              |
| Actions       | 80px   | No       | Dropdown menu                  |

**Row Actions**
- View Profile
- Edit
- Deactivate

#### 5.3.2 Student Create Form

**Route**: `/admin/students/create`

**Form Sections**

1. **Basic Information**
   - First Name (required)
   - Last Name (required)
   - Username (required, alphanumeric + underscores, 3-20 chars)
   - Email (optional, validated if provided)
   - Password (required, min 8 chars)
   - Confirm Password (required, must match)

   *Note: Students can login with either username or email (if provided)*

2. **Student-Specific Fields**
   - Assign to Class (single select, optional)
   - Link Parent (parent search/select, optional)

3. **Status**
   - Radio: Active (default) / Inactive

**Form Actions**
- Cancel (returns to student list)
- Create Student (submits form)

#### 5.3.3 Student Edit Form

**Route**: `/admin/students/:id/edit`

Same structure as create form with:
- Pre-populated fields
- Password fields optional (only if changing)
- Shows created/updated timestamps
- Can change class assignment
- Can link/unlink parent

**Danger Zone**
- Deactivate Student button (with confirmation)

#### 5.3.4 Student Detail Page

**Route**: `/admin/students/:id`

**Structure**
```
+----------------------------------------------------------+
| [Back] Student Name                        [Edit] [...]   |
+----------------------------------------------------------+
| Profile Card                                              |
| +------------------------------------------------------+ |
| | [Avatar]  Name, Email, Student Badge                | |
| |           Class, Level, XP, Status                   | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| [Overview] [Courses] [Achievements] [Activity]           |
+----------------------------------------------------------+
| Tab Content                                               |
+----------------------------------------------------------+
```

**Overview Tab**
- Quick stats cards (level, XP, badges earned, courses completed)
- Recent activity timeline
- Current courses progress bars

**Courses Tab**
- Enrolled courses with progress percentages
- Lesson completion breakdown per course
- Quiz scores and attempts

**Achievements Tab**
- Badges earned with dates
- XP history chart
- Level progression timeline

**Activity Tab**
- Full activity log with filters
- Login history
- Lesson completions, quiz attempts

---

## 6. Classes

**Route**: `/admin/classes`

### 6.1 Class List

**Structure**
```
+----------------------------------------------------------+
| Classes                                   [+ Create Class] |
+----------------------------------------------------------+
| Search [____________] [Status \/]                         |
+----------------------------------------------------------+
| Table                                                     |
+----------------------------------------------------------+
| Pagination                                                |
+----------------------------------------------------------+
```

**Table Columns**
| Column        | Width  | Sortable | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| Class Name    | auto   | Yes      | Name with color indicator      |
| Teacher       | 180px  | Yes      | Assigned teacher name          |
| Students      | 100px  | Yes      | Enrolled count                 |
| Courses       | 100px  | Yes      | Assigned course count          |
| Status        | 100px  | Yes      | Active/Archived badge          |
| Actions       | 80px   | No       | Dropdown menu                  |

**Row Actions**
- View Details
- Edit
- Archive

### 6.2 Class Create Form

**Route**: `/admin/classes/create`

**Form Sections**

1. **Class Details**
   - Class Name (required)
   - Description (optional)
   - Color (color picker, for visual identification)

2. **Assignment**
   - Assign Teacher (single select, searchable)
   - Assign Courses (multi-select)

3. **Students**
   - Add Students (multi-select with search)
   - Or: Bulk import via CSV

4. **Status**
   - Radio: Active (default) / Draft

**Form Actions**
- Cancel
- Create Class

### 6.3 Class Edit Form

**Route**: `/admin/classes/:id/edit`

Same as create with:
- Pre-populated fields
- Additional student management (add/remove)

**Danger Zone**
- Archive Class (soft delete)
- Delete Class (only if no activity recorded)

### 6.4 Class Detail Page

**Route**: `/admin/classes/:id`

**Structure**
```
+----------------------------------------------------------+
| [Back] Class Name                         [Edit] [...]    |
+----------------------------------------------------------+
| Class Info Card                                           |
| +------------------------------------------------------+ |
| | Teacher, Status                                      | |
| | Student Count, Course Count, Avg Progress            | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| [Roster] [Progress] [Attendance] [Courses]               |
+----------------------------------------------------------+
| Tab Content                                               |
+----------------------------------------------------------+
```

**Roster Tab**
- Student list with quick stats
- Add/remove students
- Bulk actions (message, export)

**Progress Tab**
- Course completion overview
- Per-student progress bars
- Drill-down to lesson level

**Attendance Tab**
- Calendar view of class sessions
- Attendance records per session
- Attendance rate statistics

**Courses Tab**
- Assigned courses with status
- Add/remove courses
- Course progress summary

---

## 7. Courses

**Route**: `/admin/courses`

### 7.1 Course List

**Structure**
```
+----------------------------------------------------------+
| Courses                                   [+ Create Course]|
+----------------------------------------------------------+
| Search [____________] [Language \/] [Status \/]           |
+----------------------------------------------------------+
| Course Grid / Table Toggle                                |
+----------------------------------------------------------+
| Content                                                   |
+----------------------------------------------------------+
| Pagination                                                |
+----------------------------------------------------------+
```

**Grid View (Default)**
- Cards in 3-column grid
- Each card shows:
  - Course title
  - Language badge (JS=amber, Python=sky)
  - Status badge (Draft/Published)
  - Section count, lesson count
  - Assigned class count
  - Last updated

**Table View**
| Column        | Width  | Sortable | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| Course        | auto   | Yes      | Title with language badge      |
| Sections      | 80px   | Yes      | Section count                  |
| Lessons       | 80px   | Yes      | Lesson count                   |
| Classes       | 100px  | Yes      | Assigned class count           |
| Status        | 100px  | Yes      | Draft/Published                |
| Updated       | 120px  | Yes      | Last modified date             |
| Actions       | 80px   | No       | Dropdown                       |

### 7.2 Course Create Form

**Route**: `/admin/courses/create`

**Form Sections**

1. **Course Details**
   - Course Title (required)
   - Description (optional, rich text)

2. **Programming Language**
   - Radio cards with icons:
     - JavaScript (amber theme)
     - Python (sky theme)
   - Visual card selection with checkmark indicator

3. **Publication Status**
   - Radio: Draft (default) / Published
   - Note: Draft courses visible only to admins/teachers

**Form Actions**
- Cancel
- Create Course (redirects to detail for adding content)

### 7.3 Course Edit Form

**Route**: `/admin/courses/:id/edit`

**Form Sections**

1. **Course Details**
   - Course Title (required)
   - Description (optional)
   - Language (read-only after creation)

2. **Publication Status**
   - Radio: Draft / Published
   - Warning if unpublishing course with active students

**Danger Zone**
- Delete Course
  - Blocked if assigned to any class
  - Error message: "This course is assigned to X classes. Remove all assignments before deleting."

**Form Actions**
- Cancel
- Save Changes

### 7.4 Course Detail Page

**Route**: `/admin/courses/:id`

**Structure**
```
+----------------------------------------------------------+
| [Back] Course Title [Lang]               [Edit] [Publish] |
+----------------------------------------------------------+
| Stats Row                                                 |
| +--------+ +--------+ +--------+ +--------+              |
| |Sections| |Lessons | |Students| |Avg Prog|              |
| +--------+ +--------+ +--------+ +--------+              |
+----------------------------------------------------------+
| [Content] [Classes] [Statistics]                          |
+----------------------------------------------------------+
| Tab Content                                               |
+----------------------------------------------------------+
```

#### 7.4.1 Content Tab - Section Management

**Section List Structure**
```
+----------------------------------------------------------+
| [::] Section 1: Introduction               [Edit] [Delete]|
+----------------------------------------------------------+
| | [::] Lesson 1.1: Getting Started         [Edit] [...]  ||
| | [::] Lesson 1.2: Basic Syntax            [Edit] [...]  ||
| +--------------------------------------------------------+|
| | [+ Add Lesson]                                         ||
+----------------------------------------------------------+
| [::] Section 2: Variables                  [Edit] [Delete]|
+----------------------------------------------------------+
| | [::] Lesson 2.1: What are Variables      [Edit] [...]  ||
| +--------------------------------------------------------+|
| | [+ Add Lesson]                                         ||
+----------------------------------------------------------+
| [+ Add Section]                                           |
+----------------------------------------------------------+
```

Note: `[::]` represents drag handle for reordering.

**Add Section (Inline Form)**

Clicking "[+ Add Section]" expands an inline form below existing sections:

```
+----------------------------------------------------------+
| [+ Add Section]  <-- Button transforms into form below    |
+----------------------------------------------------------+
| Section Title *  [________________________]               |
| Description      [________________________] (optional)    |
|                                                           |
|                              [Cancel]  [Create Section]   |
+----------------------------------------------------------+
```

- Form appears inline (no modal)
- Section title is required
- Description is optional
- Cancel collapses the form
- Create Section adds the section and collapses form
- New section appears at bottom of list

**Edit Section (Inline)**

Clicking "[Edit]" on a section transforms the section header into an editable form:

```
+----------------------------------------------------------+
| Section Title *  [Introduction____________]               |
| Description      [Learn the basics________]               |
|                              [Cancel]  [Save]             |
+----------------------------------------------------------+
```

- Edits happen inline (no modal)
- Cancel reverts changes
- Save updates the section

**Delete Section**

Clicking "[Delete]" on a section:

- **If section has lessons**: Show disabled state with tooltip: "Remove all lessons from this section first"
- **If section is empty**: Show confirmation dialog:
  ```
  +------------------------------------------+
  | Delete Section?                          |
  +------------------------------------------+
  | Are you sure you want to delete          |
  | "Introduction"? This cannot be undone.   |
  |                                          |
  | [Cancel]                       [Delete]  |
  +------------------------------------------+
  ```

**Reorder Sections (Drag and Drop)**

- Each section has a drag handle (grip icon) on the left
- Drag sections to reorder
- Visual feedback during drag (shadow, placeholder)
- Order persists immediately on drop (optimistic update)
- API call: `PATCH /api/courses/:id/sections/reorder`

#### 7.4.2 Content Tab - Lesson Management

**Add Lesson (Inline in Section)**

Clicking "[+ Add Lesson]" within a section expands an inline form:

```
+----------------------------------------------------------+
| | [+ Add Lesson]  <-- Transforms into form below         ||
+----------------------------------------------------------+
| | Lesson Title *  [________________________]             ||
| |                                                        ||
| |                            [Cancel]  [Create Lesson]   ||
+----------------------------------------------------------+
```

- Form appears inline within the section
- Only lesson title is required initially
- Cancel collapses the form
- Create Lesson adds the lesson to the section
- New lesson appears at bottom of section's lesson list
- After creation, user can click "Edit" to open full Lesson Editor

**Edit Lesson**

Clicking "[Edit]" on a lesson navigates to the full Lesson Editor page:
- Route: `/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId`

**Lesson Actions Menu (...)**

Clicking "[...]" shows dropdown with:
- **Duplicate**: Creates a copy of the lesson in the same section with title "Copy of [Original Title]"
- **Delete**: Shows confirmation dialog:
  ```
  +------------------------------------------+
  | Delete Lesson?                           |
  +------------------------------------------+
  | Are you sure you want to delete          |
  | "Getting Started"? This cannot be undone.|
  |                                          |
  | [Cancel]                       [Delete]  |
  +------------------------------------------+
  ```

**Reorder Lessons (Drag and Drop)**

- Each lesson has a drag handle (grip icon) on the left
- Drag lessons to reorder within the same section
- Lessons cannot be dragged to different sections
- Visual feedback during drag
- Order persists immediately on drop (optimistic update)
- API call: `PATCH /api/courses/:courseId/sections/:sectionId/lessons/reorder`

#### 7.4.3 Classes Tab

- List of classes using this course
- Per-class progress statistics
- Assign to additional classes button
- Click class row to navigate to class detail

#### 7.4.4 Statistics Tab

- Completion rates by lesson (bar chart)
- Average quiz scores per lesson
- Time spent analytics (avg time per lesson)
- Difficulty analysis (pass rates, retry counts)

---

### 7.5 Lesson Editor

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
| |                                                      | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
| Sidebar: Lesson Info, Statistics, Metadata               |
+----------------------------------------------------------+
```

#### 7.5.1 Content Tab

**Rich Text Editor with Toolbar**
```
+----------------------------------------------------------+
| [B] [I] [U] | [H1] [H2] | [UL] [OL] | [Code] [Img] [Link] |
+----------------------------------------------------------+
| Editor Area (Markdown support)                            |
|                                                           |
| # Lesson Title                                            |
| Content here...                                           |
|                                                           |
| ```javascript                                             |
| console.log("Hello");                                     |
| ```                                                       |
+----------------------------------------------------------+
```

**Toolbar Actions**
| Button | Action |
|--------|--------|
| B | Bold text |
| I | Italic text |
| U | Underline text |
| H1 | Heading 1 |
| H2 | Heading 2 |
| UL | Unordered list |
| OL | Ordered list |
| Code | Insert code block (with language selector) |
| Img | Insert image (upload or URL) |
| Link | Insert hyperlink |

**Editor Features**
- Markdown syntax support
- Live preview option
- Code blocks with syntax highlighting (language auto-detected or selectable)
- Auto-save draft every 30 seconds

#### 7.5.2 Exercises Tab

**Exercise List**
```
+----------------------------------------------------------+
| Code Exercises                          [+ Add Exercise]  |
+----------------------------------------------------------+
| +------------------------------------------------------+ |
| | [v] Exercise 1: Hello World                          | |
| |     Write a program that prints "Hello, World!"      | |
| +------------------------------------------------------+ |
| | [>] Exercise 2: Variables                            | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**Exercise Accordion (Expanded)**
```
+----------------------------------------------------------+
| [v] Exercise 1: Hello World                    [Delete]   |
+----------------------------------------------------------+
| Title *        [Hello World_____________________]         |
|                                                           |
| Instructions   [Write a program that prints...]           |
|                (Rich text area)                           |
|                                                           |
| Starter Code   +--------------------------------------+   |
|                | // Write your code below             |   |
|                |                                      |   |
|                +--------------------------------------+   |
|                                                           |
| Solution       +--------------------------------------+   |
|                | console.log("Hello, World!");        |   |
|                +--------------------------------------+   |
|                                                           |
| Test Cases     [+ Add Test Case]                          |
| +------------------------------------------------------+ |
| | Input: (none)  Expected: "Hello, World!"   [Delete]  | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**Exercise Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | Text | Yes | Exercise name |
| Instructions | Rich Text | Yes | What the student should do |
| Starter Code | Code Editor | No | Pre-filled code for student |
| Solution | Code Editor | Yes | Correct answer (hidden from students) |
| Test Cases | List | No | Automated tests to validate solution |

**Test Case Structure**
- Input: String or JSON (optional)
- Expected Output: String (required)
- Hidden: Boolean (if true, student doesn't see this test)

#### 7.5.3 Quiz Tab

**Quiz Question List**
```
+----------------------------------------------------------+
| Lesson Quiz (Optional)                  [+ Add Question]  |
+----------------------------------------------------------+
| +------------------------------------------------------+ |
| | Q1: What does JavaScript add to web pages?           | |
| |     Type: Multiple Choice                  [Delete]  | |
| +------------------------------------------------------+ |
| | Q2: JavaScript runs only in browsers.                | |
| |     Type: True/False                       [Delete]  | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**Question Types**

1. **Multiple Choice**
   ```
   +----------------------------------------------------------+
   | Question *     [What does JavaScript add to web pages?]   |
   | Type           [Multiple Choice v]                        |
   |                                                           |
   | Options        ( ) [Interactivity_______] <-- Correct     |
   |                ( ) [Colors______________]                 |
   |                ( ) [Images______________]                 |
   |                ( ) [Text formatting_____]                 |
   |                [+ Add Option]                             |
   |                                                           |
   | Explanation    [JavaScript is primarily used to add...]   |
   +----------------------------------------------------------+
   ```

2. **True/False**
   ```
   +----------------------------------------------------------+
   | Question *     [JavaScript runs only in browsers.]        |
   | Type           [True/False v]                             |
   |                                                           |
   | Correct Answer ( ) True  (x) False                        |
   |                                                           |
   | Explanation    [JavaScript can also run on servers...]    |
   +----------------------------------------------------------+
   ```

3. **Code Output**
   ```
   +----------------------------------------------------------+
   | Question *     [What will this code output?]              |
   | Type           [Code Output v]                            |
   |                                                           |
   | Code Snippet   +--------------------------------------+   |
   |                | console.log(2 + "2");                |   |
   |                +--------------------------------------+   |
   |                                                           |
   | Options        ( ) [22___________] <-- Correct            |
   |                ( ) [4____________]                        |
   |                ( ) [Error________]                        |
   |                ( ) [undefined____]                        |
   |                                                           |
   | Explanation    [When adding number and string...]         |
   +----------------------------------------------------------+
   ```

**Question Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Question | Text | Yes | The question text |
| Type | Select | Yes | multiple-choice, true-false, code-output |
| Options | List | Yes (for MC/Code) | Answer choices |
| Correct Answer | Selection | Yes | Which option is correct |
| Code Snippet | Code | Only for code-output | Code to analyze |
| Explanation | Text | No | Shown after answering |

#### 7.5.4 Settings Tab

**Lesson Settings Form**
```
+----------------------------------------------------------+
| Lesson Settings                                           |
+----------------------------------------------------------+
| Lesson Title *   [What is JavaScript?_______________]     |
|                                                           |
| Estimated Duration                                        |
| [15____] minutes                                          |
|                                                           |
| XP Reward                                                 |
| [10____] XP                                               |
|                                                           |
| Code Editor Mode                                          |
| ( ) Visual (Block-based) - For beginners                  |
| (x) Text (Code) - Traditional code editor                 |
| ( ) Mixed - Both options available                        |
|                                                           |
| Publication Status                                        |
| ( ) Draft - Only visible to admins/teachers               |
| (x) Published - Visible to students                       |
|                                                           |
| Prerequisites (Optional)                                  |
| [Select lessons that must be completed first... v]        |
+----------------------------------------------------------+
```

**Settings Fields**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| Lesson Title | Text | Yes | - | Display name |
| Duration | Number | No | 15 | Estimated minutes |
| XP Reward | Number | No | 10 | XP earned on completion |
| Editor Mode | Radio | Yes | text | Visual/Text/Mixed |
| Status | Radio | Yes | draft | Draft/Published |
| Prerequisites | Multi-select | No | none | Required prior lessons |

#### 7.5.5 Lesson Editor Sidebar

**Lesson Info Card**
- Course name (link)
- Section name
- Lesson order number
- Current status badge

**Statistics Card** (read-only)
- Completions count
- Pass rate percentage
- Average time spent
- Rating (if enabled)

**Metadata Card** (read-only)
- Created date
- Last updated date
- Updated by (name)

---

## 8. Badges

**Route**: `/admin/badges`

### 8.1 Badge List

**Structure**
```
+----------------------------------------------------------+
| Badges                                    [+ Create Badge] |
+----------------------------------------------------------+
| Search [____________] [Category \/]                       |
+----------------------------------------------------------+
| Badge Grid                                                |
+----------------------------------------------------------+
```

**Grid Layout**
- 4-column responsive grid
- Each badge card shows:
  - Badge icon with gradient background
  - Badge name
  - Trigger type
  - Earned count (clickable)
  - Status (Active/Inactive)

**Badge Card Structure**
```
+---------------------------+
| [Gradient BG + Icon]      |
+---------------------------+
| Badge Name                |
| Trigger: First Login      |
| 234 students earned  -->  |
| [Active]                  |
+---------------------------+
```

**Earned Count Click**: Opens modal showing list of students who earned this badge with dates.

### 8.2 Badge Create/Edit Form

**Route**: `/admin/badges/create` or `/admin/badges/:id/edit`

**Form Sections**

1. **Badge Appearance**
   - Icon picker (from Lucide library)
   - Gradient colors (from/to color pickers)
   - Live preview

2. **Badge Details**
   - Name (required)
   - Description (shown to students)

3. **Trigger Configuration**
   - Trigger Type (select):
     - First Login
     - Complete First Lesson
     - Complete First Course
     - Reach Level X
     - Earn X XP
     - Complete X Lessons
     - Perfect Quiz Score
     - X Day Streak
     - Custom (future)
   - Trigger Parameters (dynamic based on type)

4. **Status**
   - Radio: Active / Inactive

**Form Actions**
- Cancel
- Save Badge

---

## 9. Shop

**Route**: `/admin/shop`

### 9.1 Shop Item List

**Structure**
```
+----------------------------------------------------------+
| Shop                                      [+ Add Item]     |
+----------------------------------------------------------+
| [Avatars] [UI Themes] [Editor Themes]                     |
+----------------------------------------------------------+
| Item Grid                                                 |
+----------------------------------------------------------+
```

**Tabs by Category**
- Avatars
- UI Themes
- Editor Themes

**Item Grid**
- 4-column grid
- Each item shows:
  - Preview image/icon
  - Item name
  - Price in coins
  - Purchase count
  - Status

### 9.2 Shop Item Create/Edit Form

**Route**: `/admin/shop/create` or `/admin/shop/:id/edit`

Opens as **full modal/form** (not inline editing).

**Form Sections**

1. **Item Details**
   - Name (required)
   - Description
   - Category (select)

2. **Appearance**
   - Preview Image upload
   - Or: Icon + colors (for themes)

3. **Pricing**
   - Price in Coins (number input)
   - Limited Quantity (optional checkbox + number)

4. **Availability**
   - Status: Available / Coming Soon / Sold Out
   - Featured (checkbox)

**Form Actions**
- Cancel
- Save Item

### 9.3 Custom Avatar Packs

> **MVP Discussion**: This feature may be deferred post-MVP. If included:

- Upload pack of avatar options
- Set pack price
- Individual avatars within pack
- Pack preview gallery

---

## 10. Gamification Settings

**Route**: `/admin/gamification`

### 10.1 Page Structure

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

**Unsaved Changes**: Yellow indicator in header when form is dirty.

### 10.2 XP Values Section

Table of XP rewards for actions:

| Action              | Default XP | Custom XP |
| ------------------- | ---------- | --------- |
| Complete Lesson     | 10         | [__]      |
| Complete Exercise   | 15         | [__]      |
| Perfect Quiz        | 25         | [__]      |
| Daily Login         | 5          | [__]      |
| First of Day        | 10         | [__]      |

Reset to Default button per row.

### 10.3 Level Formula Section

```
Level XP = Base XP * (Multiplier ^ Level)
```

**Inputs**
- Base XP: Number input (default: 100)
- Multiplier: Decimal input (default: 1.5)

**Preview Table**
Shows calculated XP for levels 1-10 based on formula.

---

## 11. Feature Toggles

**Route**: `/admin/features`

### 11.1 Page Structure

```
+----------------------------------------------------------+
| Feature Toggles                                [Save]     |
+----------------------------------------------------------+
| Feature Grid                                              |
+----------------------------------------------------------+
```

**Behavior**: All toggles require clicking Save to apply (uniform UX).

**Unsaved Changes**: Yellow indicator when any toggle changed.

### 11.2 Feature Toggle Cards

Grid of feature cards:

```
+----------------------------------+
| [Icon]                   [Toggle]|
| Feature Name                     |
| Description of what this does    |
+----------------------------------+
```

**Available Toggles**

| Feature           | Description                              |
| ----------------- | ---------------------------------------- |
| Shop              | Enable/disable coin shop                 |
| Badges            | Enable/disable badge system              |
| Daily Rewards     | Enable daily login XP                    |
| Streaks           | Enable streak tracking                   |
| Code Execution    | Allow running code (safety)              |
| Avatar Upload     | Allow custom avatar uploads              |

### 11.3 Disable Confirmation

When disabling a feature, show confirmation modal:

```
+------------------------------------------+
| Disable [Feature Name]?                  |
+------------------------------------------+
| This will hide this feature from all     |
| users. Existing data will be preserved.  |
|                                          |
| [Cancel]              [Disable Feature]  |
+------------------------------------------+
```

---

## 12. System Settings

**Route**: `/admin/system`

### 12.1 Page Structure

```
+----------------------------------------------------------+
| System Settings                                [Save]     |
+----------------------------------------------------------+
| Code Execution                                            |
+----------------------------------------------------------+
| File Upload                                               |
+----------------------------------------------------------+
| Sessions                                                  |
+----------------------------------------------------------+
| Storage                                                   |
+----------------------------------------------------------+
```

### 12.2 Code Execution Section

| Setting              | Type     | Default | Description               |
| -------------------- | -------- | ------- | ------------------------- |
| Execution Timeout    | Number   | 10s     | Max code run time         |
| Memory Limit         | Number   | 128MB   | Max memory per execution  |
| Output Limit         | Number   | 10KB    | Max stdout size           |
| Network Access       | Toggle   | Off     | Allow network in code     |
| File System Access   | Toggle   | Off     | Allow FS in code          |

### 12.3 File Upload Section

| Setting              | Type     | Default | Description               |
| -------------------- | -------- | ------- | ------------------------- |
| Max File Size        | Number   | 5MB     | Per-file limit            |
| Allowed Types        | Multi    | Images  | File type whitelist       |
| Storage per User     | Number   | 50MB    | Total storage quota       |

### 12.4 Sessions Section

| Setting              | Type     | Default | Description               |
| -------------------- | -------- | ------- | ------------------------- |
| Session Duration     | Number   | 24h     | Login session length      |
| Remember Me Duration | Number   | 30d     | Extended session          |
| Max Sessions         | Number   | 5       | Concurrent logins         |

### 12.5 Storage Section

**Read-only display:**

```
+------------------------------------------+
| Storage Usage                            |
+------------------------------------------+
| Used: 2.4 GB / 10 GB                     |
| [===========                       ] 24% |
+------------------------------------------+
| Breakdown:                               |
| - User Avatars: 500 MB                   |
| - Course Media: 1.2 GB                   |
| - Exports: 700 MB                        |
+------------------------------------------+
| [Clear Old Exports]                      |
+------------------------------------------+
```

---

## 13. Common Patterns

### 13.1 Tables

**Standard Structure**
```html
<table>
  <thead>
    <tr>
      <th>Column (sortable)</th>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

**Features**
- Hover state: slate-50 background
- Sortable columns: Click header to sort, icon indicates direction
- Full-width layout
- Horizontal scroll on overflow

### 13.2 Pagination

**Structure**
```
Showing 1-10 of 156 results    [<] [1] [2] [3] ... [16] [>]
```

**Behavior**
- Show first, last, and 2 pages around current
- Ellipsis for gaps
- Previous/Next arrows
- Disabled state at boundaries

### 13.3 Search & Filters

**Search Input**
- Debounced (300ms)
- Placeholder with context ("Search teachers...")
- Clear button when has value

**Filter Dropdowns**
- Select component
- "All" option clears filter
- Multiple filters combine with AND

### 13.4 Modals

**Structure**
```
+------------------------------------------+
| Modal Title                          [X] |
+------------------------------------------+
| Modal content...                         |
|                                          |
+------------------------------------------+
| [Cancel]                    [Primary]    |
+------------------------------------------+
```

**Behavior**
- Backdrop click closes (unless destructive)
- Escape key closes
- Focus trap within modal
- Scroll within modal body

### 13.5 Toast Notifications

**Positions**: Bottom-right

**Types**
- Success: Green left border
- Error: Red left border
- Warning: Amber left border
- Info: Blue left border

**Behavior**
- Auto-dismiss after 5s
- Manual dismiss via X button
- Stack vertically
- Slide-in animation

### 13.6 Confirmation Dialogs

For destructive actions:

```
+------------------------------------------+
| Delete Course?                           |
+------------------------------------------+
| Are you sure you want to delete          |
| "JavaScript Basics"? This cannot be      |
| undone.                                   |
|                                          |
| [Cancel]                       [Delete]  |
+------------------------------------------+
```

- Red-styled destructive button
- Clear description of consequences

### 13.7 Empty States

When no data exists:

```
+------------------------------------------+
|            [Illustration]                |
|                                          |
|        No courses yet                    |
|   Create your first course to get        |
|            started.                      |
|                                          |
|         [+ Create Course]                |
+------------------------------------------+
```

### 13.8 Loading States

**Skeleton Loading**
- Pulsing gray shapes matching content layout
- Applied to cards, tables, charts

**Spinner**
- For buttons: Inline spinner replacing icon
- For page: Centered spinner

### 13.9 Error States

**Form Validation**
- Red border on invalid fields
- Error message below field
- Focus first invalid field on submit

**API Errors**
- Toast notification for transient errors
- Inline error message for persistent issues
- Retry button where applicable

---

## 14. State Management

### 14.1 URL State

Persist in URL query parameters:
- Current tab
- Search query
- Active filters
- Sort column/direction
- Current page

Example: `/admin/users?tab=teachers&search=john&sort=name&order=asc&page=2`

### 14.2 Local Storage

Persist across sessions:
- Sidebar collapsed state
- Table view preferences (grid/table)
- Items per page preference

### 14.3 Database Persistence

Persist in database:
- Recently viewed items (per admin user)
- Last visited section (per admin user)

### 14.4 Form State

**Unsaved Changes Indicator**
- All forms/settings pages show indicator when dirty
- Yellow dot or badge in header/tab
- Prompt on navigation away: "You have unsaved changes. Discard?"

### 14.5 Optimistic Updates

For toggles and quick actions:
- Update UI immediately
- Revert on API failure
- Show error toast

### 14.6 Concurrent Editing

Use pessimistic locking for:
- Course content editing
- Lesson editing
- System settings

Lock indicator shows who is editing and when lock expires.

---

## 15. API Integration

### 15.1 Request Patterns

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

**Detail Endpoints**
```
GET /api/admin/users/:id
```

**Create Endpoints**
```
POST /api/admin/users
Content-Type: application/json
Body: { ...userData }
```

**Update Endpoints**
```
PATCH /api/admin/users/:id
Content-Type: application/json
Body: { ...changes }
```

**Delete Endpoints**
```
DELETE /api/admin/courses/:id
```

### 15.2 Error Responses

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

### 15.3 Bulk Operations

```
POST /api/admin/users/bulk
Content-Type: application/json
Body: {
  "action": "deactivate",
  "ids": ["uuid1", "uuid2"]
}
```

### 15.4 File Uploads

```
POST /api/admin/upload
Content-Type: multipart/form-data
Body: FormData with file
```

Response:
```json
{
  "url": "https://storage.example.com/...",
  "filename": "image.png",
  "size": 102400
}
```

### 15.5 Course, Section & Lesson Endpoints

#### Course Endpoints

```
GET    /api/courses                    # List courses (paginated)
GET    /api/courses/:id                # Get course details
POST   /api/courses                    # Create course
PATCH  /api/courses/:id                # Update course
DELETE /api/courses/:id                # Delete course (blocked if assigned to classes)
PATCH  /api/courses/:id/publish        # Publish course
```

#### Section Endpoints

```
GET    /api/courses/:courseId/sections              # List sections
POST   /api/courses/:courseId/sections              # Create section
PATCH  /api/courses/:courseId/sections/:sectionId   # Update section
DELETE /api/courses/:courseId/sections/:sectionId   # Delete section (blocked if has lessons)
PATCH  /api/courses/:courseId/sections/reorder      # Reorder sections
```

**Create Section Request**
```json
{
  "title": "Introduction",
  "description": "Learn the basics"
}
```

**Reorder Sections Request**
```json
{
  "order": ["section-id-3", "section-id-1", "section-id-2"]
}
```

**Delete Section Error (has lessons)**
```json
{
  "error": {
    "code": "SECTION_HAS_LESSONS",
    "message": "Cannot delete section with lessons. Remove all lessons first.",
    "details": {
      "lessonCount": 5
    }
  }
}
```

#### Lesson Endpoints

```
GET    /api/courses/:courseId/sections/:sectionId/lessons              # List lessons
GET    /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Get lesson
POST   /api/courses/:courseId/sections/:sectionId/lessons              # Create lesson
PATCH  /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Update lesson
DELETE /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Delete lesson
POST   /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/duplicate  # Duplicate lesson
PATCH  /api/courses/:courseId/sections/:sectionId/lessons/reorder      # Reorder lessons
```

**Create Lesson Request**
```json
{
  "title": "What is JavaScript?"
}
```

**Update Lesson Request**
```json
{
  "title": "What is JavaScript?",
  "content": "# Markdown content...",
  "duration": 15,
  "xpReward": 10,
  "editorMode": "text",
  "status": "draft",
  "exercises": [
    {
      "id": "ex1",
      "title": "Hello World",
      "instructions": "Write a program...",
      "starterCode": "// Start here",
      "solution": "console.log('Hello');",
      "testCases": [
        { "input": "", "expected": "Hello", "hidden": false }
      ]
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "What does JS add to pages?",
      "options": ["Interactivity", "Colors", "Images", "Text"],
      "correctIndex": 0,
      "explanation": "JS adds interactivity."
    }
  ]
}
```

**Reorder Lessons Request**
```json
{
  "order": ["lesson-id-2", "lesson-id-1", "lesson-id-3"]
}
```

**Duplicate Lesson Response**
```json
{
  "data": {
    "id": "new-lesson-id",
    "title": "Copy of What is JavaScript?",
    "...": "...copied fields"
  }
}
```

---

## Appendix A: Page Inventory

### Teachers
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Teacher List           | /admin/teachers                | Mocked    |
| Teacher Create         | /admin/teachers/create         | Mocked    |
| Teacher Edit           | /admin/teachers/:id/edit       | Mocked    |
| Teacher Detail         | /admin/teachers/:id            | Mocked    |

### Parents
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Parent List            | /admin/parents                 | Mocked    |
| Parent Create          | /admin/parents/create          | Mocked    |
| Parent Edit            | /admin/parents/:id/edit        | Mocked    |
| Parent Detail          | /admin/parents/:id             | Mocked    |

### Students
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Student List           | /admin/students                | Mocked    |
| Student Create         | /admin/students/create         | Mocked    |
| Student Edit           | /admin/students/:id/edit       | Mocked    |
| Student Detail         | /admin/students/:id            | Mocked    |

### Classes
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Class List             | /admin/classes                 | Mocked    |
| Class Create           | /admin/classes/create          | Mocked    |
| Class Edit             | /admin/classes/:id/edit        | Mocked    |
| Class Detail           | /admin/classes/:id             | Mocked    |

### Courses
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Course List            | /admin/courses                 | Mocked    |
| Course Create          | /admin/courses/create          | Mocked    |
| Course Edit            | /admin/courses/:id/edit        | Mocked    |
| Course Detail          | /admin/courses/:id             | Mocked    |
| Lesson Editor          | /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId | Mocked |

### Badges
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Badge List             | /admin/badges                  | Mocked    |
| Badge Create           | /admin/badges/create           | Mocked    |
| Badge Edit             | /admin/badges/:id/edit         | Mocked    |
| Badge Detail           | /admin/badges/:id              | Mocked    |

### Shop
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Shop List              | /admin/shop                    | Mocked    |
| Shop Item Create       | /admin/shop/create             | Mocked    |
| Shop Item Edit         | /admin/shop/:id/edit           | Mocked    |
| Shop Item Detail       | /admin/shop/:id                | Mocked    |

### Settings & Dashboard
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Dashboard              | /admin                         | Mocked    |
| Gamification Settings  | /admin/gamification            | Mocked    |
| Feature Toggles        | /admin/features                | Mocked    |
| System Settings        | /admin/system                  | Mocked    |

### Teacher-Specific (visible when logged in as teacher)
| Page                   | Route                          | Status    |
| ---------------------- | ------------------------------ | --------- |
| Help Requests          | /admin/help-requests           | Planned   |
| Pending Rewards        | /admin/pending-rewards         | Planned   |

---

## Appendix B: Component Library

### Buttons

| Variant   | Usage                          | Style                    |
| --------- | ------------------------------ | ------------------------ |
| Primary   | Main actions                   | accent-600 bg, white text|
| Secondary | Alternative actions            | slate-100 bg, slate-700  |
| Ghost     | Tertiary actions               | transparent, slate-600   |
| Danger    | Destructive actions            | red-600 bg, white text   |
| Disabled  | Unavailable actions            | slate-200 bg, slate-400  |

### Form Inputs

| Type      | Description                    |
| --------- | ------------------------------ |
| Text      | Standard text input            |
| Textarea  | Multi-line text                |
| Select    | Dropdown selection             |
| Checkbox  | Boolean toggle (square)        |
| Radio     | Single selection from group    |
| Toggle    | On/off switch                  |
| Number    | Numeric input with steppers    |
| Date      | Date picker                    |
| File      | File upload with preview       |

### Status Badges

| Status    | Color                          |
| --------- | ------------------------------ |
| Active    | emerald-100 bg, emerald-700    |
| Inactive  | slate-100 bg, slate-600        |
| Draft     | amber-100 bg, amber-700        |
| Published | accent-100 bg, accent-700      |
| Archived  | slate-100 bg, slate-500        |

---

*Last Updated: 2026-01-16*
*Version: 1.3.0*

**Changelog v1.3.0:**
- Added detailed Teacher Role section (1.4) with sidebar structure and permissions
- Removed Term/Schedule from class management (no academic term system)
- Updated API endpoints to use nested routes structure
- Teachers use same portal with hidden unauthorized navigation items

**Changelog v1.2.0:**
- Removed leaderboards feature toggle (leaderboards not in MVP scope)
- Updated student authentication: username required, email optional
- Students can login with username OR email
