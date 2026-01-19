# MongoDB Schema Design

This document describes the MongoDB collections and document structures for SilverEdge Academy.

## Design Principles

1. **Embed what you read together** - Courses contain sections, lessons, exercises inline
2. **Reference fast-growing data** - Submissions, progress in separate collections
3. **Denormalize for queries** - Teacher name in class, student class in progress
4. **Use Maps for sparse data** - Lesson unlocks, exercise results

---

## Collections

### users

Base user account for all roles.

```javascript
{
  _id: ObjectId,
  email: String,           // unique, lowercase
  passwordHash: String,
  role: "admin" | "teacher" | "parent" | "student",
  displayName: String,
  avatarUrl: String,
  emailVerified: Boolean,  // default: false
  isActive: Boolean,       // default: true
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 }              // unique
{ role: 1 }
```

---

### students

Student-specific data, separate from users for heavy queries.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // ref: users, unique
  studentNumber: String,   // unique
  classId: ObjectId,       // ref: classes (one class per student)
  parentId: ObjectId,      // ref: users (one parent per student)

  xp: {
    total: Number,         // default: 0
    level: Number          // default: 1
  },
  currency: Number,        // default: 0
  streak: {
    currentDays: Number,   // default: 0
    lastActivityDate: Date
  },

  // Flexible preferences (schema can evolve)
  preferences: {
    theme: String,
    editorFontSize: Number,
    editorTheme: String,
    // ... any additional preferences
  },

  // Embedded badges (small array, denormalized for display)
  badges: [
    {
      badgeId: ObjectId,
      name: String,
      iconUrl: String,
      earnedAt: Date
    }
  ],

  // Purchased item IDs
  inventory: [ObjectId],   // ref: shopItems

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1 }             // unique
{ classId: 1 }
{ studentNumber: 1 }      // unique
{ "xp.total": -1 }        // for sorting
```

---

### courses

Full course with embedded sections, lessons, exercises, quizzes.

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  language: "javascript" | "python",
  status: "draft" | "published" | "archived",

  createdBy: {
    userId: ObjectId,
    displayName: String    // denormalized
  },

  sections: [
    {
      _id: ObjectId,
      title: String,
      order: Number,

      lessons: [
        {
          _id: ObjectId,
          title: String,
          order: Number,
          status: "draft" | "published",
          editorComplexity: "simple" | "standard" | "advanced",
          starterCode: String,

          // Pessimistic locking for editing
          lockedBy: ObjectId,
          lockedAt: Date,

          // Content blocks (flexible structure)
          content: [
            { type: "text", content: String },
            { type: "video", url: String, duration: Number },
            { type: "code", language: String, code: String },
            { type: "image", url: String }
          ],

          // Embedded exercises
          exercises: [
            {
              _id: ObjectId,
              instructions: String,
              starterCode: String,
              xpValue: Number,
              order: Number,
              testCases: [
                {
                  input: String,
                  expectedOutput: String,
                  isRegex: Boolean,
                  isHidden: Boolean
                }
              ]
            }
          ],

          // Optional quiz
          quiz: {
            xpValue: Number,
            maxAttempts: Number,
            questions: [
              {
                question: String,
                options: [String],
                correctIndex: Number
              }
            ]
          }
        }
      ]
    }
  ],

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ language: 1 }
{ status: 1 }
{ "createdBy.userId": 1 }
```

---

### classes

Class with denormalized teacher info and lesson unlocks.

```javascript
{
  _id: ObjectId,
  name: String,

  teacher: {
    userId: ObjectId,
    displayName: String    // denormalized, update when teacher name changes
  },

  courseIds: [ObjectId],   // ref: courses

  // Sparse map: only unlocked lessons stored
  // Key is lessonId as string
  lessonUnlocks: {
    "<lessonId>": {
      unlockedAt: Date,
      unlockedBy: ObjectId
    }
  },

  // Precomputed stats (update on enrollment/progress changes)
  stats: {
    studentCount: Number,
    avgCompletion: Number
  },

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ "teacher.userId": 1 }
{ courseIds: 1 }
```

---

### progress

Student progress per lesson. Separate collection (grows with activity).

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  lessonId: ObjectId,
  courseId: ObjectId,      // denormalized for course-level queries
  classId: ObjectId,       // denormalized for class reports

  status: "not_started" | "in_progress" | "completed",
  completionPct: Number,   // 0-100

  // Map of exercise results (key is exerciseId as string)
  exerciseResults: {
    "<exerciseId>": {
      passed: Boolean,
      attempts: Number,
      lastSubmittedAt: Date
    }
  },

  quizResult: {
    score: Number,
    attempts: Number,
    firstAttemptScore: Number,
    lastAttemptAt: Date
  },

  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ studentId: 1, lessonId: 1 }   // unique compound
{ studentId: 1, courseId: 1 }
{ classId: 1, lessonId: 1 }
{ classId: 1, status: 1 }
```

---

### submissions

Code submissions. High volume, use TTL for auto-cleanup.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  exerciseId: ObjectId,
  lessonId: ObjectId,      // denormalized
  courseId: ObjectId,      // denormalized

  code: String,
  testResults: {
    passed: Number,
    total: Number
  },
  passed: Boolean,
  submittedAt: Date
}

// Indexes
{ studentId: 1, exerciseId: 1 }
{ studentId: 1, submittedAt: -1 }
{ submittedAt: 1 }, { expireAfterSeconds: 7776000 }  // 90-day TTL
```

---

### attendance

Daily attendance per class (one document per class per day).

```javascript
{
  _id: ObjectId,
  classId: ObjectId,
  date: Date,              // date only, no time component

  records: [
    {
      studentId: ObjectId,
      status: "present" | "absent" | "late",
      reason: String       // only for absences
    }
  ],

  markedBy: ObjectId,
  markedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ classId: 1, date: 1 }    // unique compound
{ "records.studentId": 1 }
```

---

### badges

Badge definitions (admin-created).

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  iconUrl: String,         // Lucide icon name or URL
  iconColor: String,       // gradient color

  // Simple trigger (one per badge, no complex logic)
  trigger: {
    type: "exercises_completed" | "streak_days" | "xp_earned" |
          "level_reached" | "first_exercise" | "first_quiz" | "course_completed",
    value: Number          // threshold
  },

  createdBy: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ "trigger.type": 1 }
{ isActive: 1 }
```

---

### shopItems

Shop items (admin and teacher-created).

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: "avatar" | "ui_theme" | "editor_theme" | "custom_reward",
  price: Number,
  assetUrl: String,
  isPermanent: Boolean,    // true = permanent, false = consumable
  isTeacherReward: Boolean,
  classId: ObjectId,       // only for teacher rewards
  createdBy: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ category: 1 }
{ isTeacherReward: 1, classId: 1 }
{ isActive: 1 }
```

---

### purchases

Purchase history with item snapshot.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  itemId: ObjectId,

  // Snapshot at time of purchase (prices may change)
  itemSnapshot: {
    name: String,
    category: String,
    price: Number
  },

  purchasedAt: Date,
  fulfilledAt: Date,       // for teacher rewards
  fulfilledBy: ObjectId    // teacher who fulfilled
}

// Indexes
{ studentId: 1 }
{ itemId: 1 }
{ studentId: 1, itemId: 1 }
{ fulfilledAt: 1 }         // find unfulfilled rewards
```

---

### helpRequests

Student help requests on exercises.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  exerciseId: ObjectId,
  lessonId: ObjectId,
  classId: ObjectId,       // for teacher queries

  message: String,
  codeSnapshot: String,    // student's code at request time

  status: "pending" | "responded",
  responseMarkdown: String,
  respondedBy: ObjectId,
  respondedAt: Date,

  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ classId: 1, status: 1 }
{ studentId: 1 }
{ status: 1, createdAt: -1 }
```

---

### sandboxProjects

Student sandbox projects for free-form coding practice.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  name: String,
  description: String,
  code: String,
  language: "javascript" | "python",
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ studentId: 1 }
{ studentId: 1, createdAt: -1 }
```

---

### xpTransactions

XP history for auditing.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  amount: Number,          // can be negative for adjustments
  sourceType: "exercise" | "quiz" | "badge" | "admin_adjustment",
  sourceId: ObjectId,      // reference to source
  isFirstAttempt: Boolean, // XP only on first attempt
  note: String,            // for admin adjustments
  createdAt: Date
}

// Indexes
{ studentId: 1, createdAt: -1 }
{ studentId: 1, sourceType: 1 }
```

---

## Common Query Patterns

### Get student dashboard
```javascript
// Single query gets student with all embedded data
db.students.findOne({ userId: ObjectId("...") })
```

### Get course with all content
```javascript
// Single document has everything
db.courses.findOne({ _id: ObjectId("...") })
```

### Get class progress report
```javascript
db.progress.aggregate([
  { $match: { classId: ObjectId("...") } },
  { $group: {
      _id: "$studentId",
      avgCompletion: { $avg: "$completionPct" },
      lessonsCompleted: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
  }}
])
```

### Check if lesson is unlocked for class
```javascript
db.classes.findOne(
  { _id: classId },
  { [`lessonUnlocks.${lessonId}`]: 1 }
)
```
