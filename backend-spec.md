# Silver Edge Academy - Backend Specification

> **Status:** Not yet implemented. This document specifies the backend API for Silver Edge Academy LMS.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Design](#4-database-design)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Endpoints](#6-api-endpoints)
7. [Request & Response Formats](#7-request--response-formats)
8. [Validation Schemas](#8-validation-schemas)
9. [Error Handling](#9-error-handling)
10. [File Uploads](#10-file-uploads)
11. [Exercise Validation](#11-exercise-validation)
12. [Testing Strategy](#12-testing-strategy)
13. [Seed Data](#13-seed-data)
14. [Environment Configuration](#14-environment-configuration)
15. [API Documentation](#15-api-documentation)
16. [Deployment](#16-deployment)

---

## 1. Overview

### 1.1 Purpose

The backend provides a RESTful API for the Silver Edge Academy LMS, supporting both the Student Portal and Admin Portal frontends. It handles authentication, data persistence, file storage, and business logic for the learning management system.

### 1.2 Key Responsibilities

- User authentication and authorization (JWT-based)
- CRUD operations for all entities (users, courses, lessons, etc.)
- Progress tracking and gamification logic
- File upload management (S3/MinIO)
- Exercise submission validation (server records results, client executes code)
- API documentation via OpenAPI/Swagger

### 1.3 Design Principles

1. **RESTful conventions** - Predictable URL patterns and HTTP methods
2. **Type safety** - Full TypeScript with Zod validation
3. **Separation of concerns** - Controllers, services, repositories pattern
4. **Stateless** - JWT-based auth, no server sessions
5. **Consistent responses** - Standardized success and error formats

### 1.4 Deferred Features (Post-MVP)

- Real-time notifications (WebSockets/SSE)
- Email notifications
- Background job processing
- Rate limiting

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Bun | 1.x |
| Framework | Express | 4.x |
| Language | TypeScript | 5.x |
| Database | MongoDB | 7.x |
| ODM | Mongoose | 8.x |
| Validation | Zod | 3.x |
| Authentication | jsonwebtoken | 9.x |
| Password Hashing | bcrypt | 5.x |
| File Storage | AWS SDK (S3/MinIO) | 3.x |
| API Documentation | swagger-jsdoc + swagger-ui-express | - |
| Testing | Bun test + supertest | - |
| Logging | pino | 8.x |

### 2.1 Why These Choices

- **Bun**: Fast runtime, native TypeScript support, built-in test runner
- **Mongoose**: Schema validation, middleware hooks, mature ecosystem
- **Zod**: TypeScript-first, excellent inference, composable schemas
- **Pino**: Fast JSON logging, structured logs for production

---

## 3. Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── app.ts                   # Express app setup
│   ├── config/
│   │   ├── index.ts             # Configuration loader
│   │   ├── database.ts          # MongoDB connection
│   │   └── swagger.ts           # OpenAPI configuration
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── authorize.ts         # Role-based authorization
│   │   ├── validate.ts          # Zod validation middleware
│   │   ├── errorHandler.ts      # Global error handler
│   │   ├── requestLogger.ts     # Request logging
│   │   └── notFound.ts          # 404 handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schema.ts   # Zod schemas
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.schema.ts
│   │   │   └── users.model.ts   # Mongoose model
│   │   ├── courses/
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── courses.schema.ts
│   │   │   └── courses.model.ts
│   │   ├── sections/
│   │   │   └── ... (same pattern)
│   │   ├── lessons/
│   │   │   └── ...
│   │   ├── exercises/
│   │   │   └── ...
│   │   ├── quizzes/
│   │   │   └── ...
│   │   ├── classes/
│   │   │   └── ...
│   │   ├── progress/
│   │   │   └── ...
│   │   ├── attendance/
│   │   │   └── ...
│   │   ├── gamification/
│   │   │   ├── badges/
│   │   │   ├── xp/
│   │   │   ├── shop/
│   │   │   └── streaks/
│   │   ├── help-requests/
│   │   │   └── ...
│   │   ├── notifications/
│   │   │   └── ...
│   │   ├── analytics/
│   │   │   └── ...
│   │   └── uploads/
│   │       └── ...
│   ├── models/
│   │   └── index.ts             # Re-export all models
│   ├── types/
│   │   ├── index.ts             # Shared types
│   │   ├── express.d.ts         # Express type extensions
│   │   └── environment.d.ts     # Env var types
│   ├── utils/
│   │   ├── ApiError.ts          # Custom error class
│   │   ├── ApiResponse.ts       # Response helpers
│   │   ├── asyncHandler.ts      # Async error wrapper
│   │   ├── pagination.ts        # Pagination helpers
│   │   ├── tokens.ts            # JWT utilities
│   │   └── logger.ts            # Pino logger instance
│   └── seed/
│       ├── index.ts             # Seed runner
│       ├── users.seed.ts
│       ├── courses.seed.ts
│       ├── classes.seed.ts
│       ├── progress.seed.ts
│       └── gamification.seed.ts
├── tests/
│   ├── setup.ts                 # Test setup
│   ├── helpers/
│   │   ├── db.ts                # Test DB utilities
│   │   └── auth.ts              # Auth test helpers
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   ├── courses.test.ts
│   │   └── ...
│   └── unit/
│       ├── services/
│       └── utils/
├── package.json
├── tsconfig.json
├── bunfig.toml
└── .env.example
```

### 3.1 Module Pattern

Each module follows a consistent structure:

```typescript
// module.routes.ts - Route definitions
import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import * as controller from './module.controller';
import * as schema from './module.schema';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, authorize(['admin']), validate(schema.create), controller.create);
router.patch('/:id', authenticate, authorize(['admin']), validate(schema.update), controller.update);
router.delete('/:id', authenticate, authorize(['admin']), controller.remove);

export default router;
```

```typescript
// module.controller.ts - HTTP layer
import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import * as service from './module.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.list(req.query);
  res.json(result);
});
```

```typescript
// module.service.ts - Business logic
import { Model } from './module.model';
import { ApiError } from '@/utils/ApiError';

export const list = async (query: ListQuery) => {
  // Business logic here
};
```

---

## 4. Database Design

### 4.1 MongoDB Collections

Using Mongoose schemas with TypeScript interfaces.

#### 4.1.1 Users Collection

```typescript
// models/user.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  username?: string;
  passwordHash: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  firstName: string;
  lastName: string;
  displayName: string;
  avatarId?: Schema.Types.ObjectId;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null for students without email
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'parent', 'student'],
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    avatarId: { type: Schema.Types.ObjectId, ref: 'ShopItem' },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ email: 1, role: 1 });

export const User = model<IUser>('User', userSchema);
```

#### 4.1.2 Student Profile Collection

```typescript
// models/studentProfile.model.ts
export interface IStudentProfile extends Document {
  userId: Schema.Types.ObjectId;
  parentIds: Schema.Types.ObjectId[];
  classId?: Schema.Types.ObjectId;
  currentLevel: number;
  totalXp: number;
  currencyBalance: number;
  currentStreakDays: number;
  longestStreak: number;
  lastActivityDate?: Date;
  preferences: {
    editorTheme?: string;
    uiTheme?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    parentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    currentLevel: { type: Number, default: 1, min: 1 },
    totalXp: { type: Number, default: 0, min: 0 },
    currencyBalance: { type: Number, default: 0, min: 0 },
    currentStreakDays: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActivityDate: Date,
    preferences: {
      editorTheme: String,
      uiTheme: String,
    },
  },
  { timestamps: true }
);

// Indexes
studentProfileSchema.index({ classId: 1 });
studentProfileSchema.index({ currentLevel: -1 });
studentProfileSchema.index({ totalXp: -1 });

export const StudentProfile = model<IStudentProfile>('StudentProfile', studentProfileSchema);
```

#### 4.1.3 Teacher Profile Collection

```typescript
// models/teacherProfile.model.ts
export interface ITeacherProfile extends Document {
  userId: Schema.Types.ObjectId;
  assignedClassIds: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teacherProfileSchema = new Schema<ITeacherProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    assignedClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  },
  { timestamps: true }
);

export const TeacherProfile = model<ITeacherProfile>('TeacherProfile', teacherProfileSchema);
```

#### 4.1.4 Parent Profile Collection

```typescript
// models/parentProfile.model.ts
export interface IParentProfile extends Document {
  userId: Schema.Types.ObjectId;
  childIds: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const parentProfileSchema = new Schema<IParentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    childIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const ParentProfile = model<IParentProfile>('ParentProfile', parentProfileSchema);
```

#### 4.1.5 Class Collection

```typescript
// models/class.model.ts
export interface IClass extends Document {
  name: string;
  description?: string;
  color: string;
  teacherId: Schema.Types.ObjectId;
  studentIds: Schema.Types.ObjectId[];
  courseIds: Schema.Types.ObjectId[];
  status: 'active' | 'archived' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#6366f1' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    status: {
      type: String,
      enum: ['active', 'archived', 'draft'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes
classSchema.index({ teacherId: 1 });
classSchema.index({ status: 1 });

export const Class = model<IClass>('Class', classSchema);
```

#### 4.1.6 Course Collection

```typescript
// models/course.model.ts
export interface ICourse extends Document {
  title: string;
  description?: string;
  language: 'javascript' | 'python';
  status: 'draft' | 'published';
  createdBy: Schema.Types.ObjectId;
  sectionIds: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    language: {
      type: String,
      enum: ['javascript', 'python'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sectionIds: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ status: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ createdBy: 1 });

export const Course = model<ICourse>('Course', courseSchema);
```

#### 4.1.7 Section Collection

```typescript
// models/section.model.ts
export interface ISection extends Document {
  courseId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  orderIndex: number;
  lessonIds: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    orderIndex: { type: Number, required: true, min: 0 },
    lessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);

// Indexes
sectionSchema.index({ courseId: 1, orderIndex: 1 });

export const Section = model<ISection>('Section', sectionSchema);
```

#### 4.1.8 Lesson Collection

```typescript
// models/lesson.model.ts
export interface ILesson extends Document {
  sectionId: Schema.Types.ObjectId;
  title: string;
  content: string; // Markdown content
  orderIndex: number;
  status: 'draft' | 'published';
  codeMode: 'visual' | 'text' | 'mixed';
  editorComplexity: 'simplified' | 'standard' | 'advanced';
  starterCode?: string;
  estimatedDuration: number; // minutes
  xpReward: number;

  // Locking
  lockedBy?: Schema.Types.ObjectId;
  lockedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    orderIndex: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    codeMode: {
      type: String,
      enum: ['visual', 'text', 'mixed'],
      default: 'text',
    },
    editorComplexity: {
      type: String,
      enum: ['simplified', 'standard', 'advanced'],
      default: 'standard',
    },
    starterCode: String,
    estimatedDuration: { type: Number, default: 15 },
    xpReward: { type: Number, default: 10 },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedAt: Date,
  },
  { timestamps: true }
);

// Indexes
lessonSchema.index({ sectionId: 1, orderIndex: 1 });
lessonSchema.index({ status: 1 });

export const Lesson = model<ILesson>('Lesson', lessonSchema);
```

#### 4.1.9 Exercise Collection

```typescript
// models/exercise.model.ts
export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IExercise extends Document {
  lessonId: Schema.Types.ObjectId;
  title: string;
  instructions: string; // Markdown
  orderIndex: number;
  starterCode?: string;
  solution: string;
  testCases: ITestCase[];
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const exerciseSchema = new Schema<IExercise>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    orderIndex: { type: Number, required: true, min: 0 },
    starterCode: String,
    solution: { type: String, required: true },
    testCases: [testCaseSchema],
    xpReward: { type: Number, default: 15 },
  },
  { timestamps: true }
);

// Indexes
exerciseSchema.index({ lessonId: 1, orderIndex: 1 });

export const Exercise = model<IExercise>('Exercise', exerciseSchema);
```

#### 4.1.10 Quiz Collection

```typescript
// models/quiz.model.ts
export type QuestionType = 'multiple-choice' | 'multiple-answer' | 'true-false' | 'code-output' | 'fill-blank' | 'parsons';

export interface IQuizQuestion {
  type: QuestionType;
  question: string;
  codeSnippet?: string; // For code-output questions
  options: string[];
  correctIndices: number[]; // Supports multiple correct answers
  explanation?: string;
  points: number;
}

export interface IQuiz extends Document {
  lessonId: Schema.Types.ObjectId;
  title: string;
  orderIndex: number;
  questions: IQuizQuestion[];
  maxAttempts: number | null; // null = unlimited
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    type: {
      type: String,
      enum: ['multiple-choice', 'multiple-answer', 'true-false', 'code-output', 'fill-blank', 'parsons'],
      required: true,
    },
    question: { type: String, required: true },
    codeSnippet: String,
    options: [{ type: String, required: true }],
    correctIndices: [{ type: Number, required: true }],
    explanation: String,
    points: { type: Number, default: 1 },
  },
  { _id: true }
);

const quizSchema = new Schema<IQuiz>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, trim: true },
    orderIndex: { type: Number, required: true, min: 0 },
    questions: [quizQuestionSchema],
    maxAttempts: { type: Number, default: null },
    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },
    xpReward: { type: Number, default: 25 },
  },
  { timestamps: true }
);

// Indexes
quizSchema.index({ lessonId: 1, orderIndex: 1 });

export const Quiz = model<IQuiz>('Quiz', quizSchema);
```

#### 4.1.11 Lesson Unlock Collection

```typescript
// models/lessonUnlock.model.ts
export interface ILessonUnlock extends Document {
  lessonId: Schema.Types.ObjectId;
  classId: Schema.Types.ObjectId;
  unlockedBy: Schema.Types.ObjectId;
  unlockedAt: Date;
}

const lessonUnlockSchema = new Schema<ILessonUnlock>({
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  unlockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unlockedAt: { type: Date, default: Date.now },
});

// Compound unique index
lessonUnlockSchema.index({ lessonId: 1, classId: 1 }, { unique: true });

export const LessonUnlock = model<ILessonUnlock>('LessonUnlock', lessonUnlockSchema);
```

#### 4.1.12 Progress Collections

```typescript
// models/lessonProgress.model.ts
export interface ILessonProgress extends Document {
  studentId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  completionPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Compound unique index
lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ studentId: 1, status: 1 });

export const LessonProgress = model<ILessonProgress>('LessonProgress', lessonProgressSchema);
```

```typescript
// models/exerciseSubmission.model.ts
export interface IExerciseSubmission extends Document {
  studentId: Schema.Types.ObjectId;
  exerciseId: Schema.Types.ObjectId;
  code: string;
  testsPassed: number;
  testsTotal: number;
  passed: boolean;
  submittedAt: Date;
}

const exerciseSubmissionSchema = new Schema<IExerciseSubmission>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  code: { type: String, required: true },
  testsPassed: { type: Number, required: true, min: 0 },
  testsTotal: { type: Number, required: true, min: 0 },
  passed: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
});

// Indexes for querying last 5 submissions
exerciseSubmissionSchema.index({ studentId: 1, exerciseId: 1, submittedAt: -1 });

export const ExerciseSubmission = model<IExerciseSubmission>('ExerciseSubmission', exerciseSubmissionSchema);
```

```typescript
// models/quizSubmission.model.ts
export interface IQuizSubmission extends Document {
  studentId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  answers: {
    questionId: Schema.Types.ObjectId;
    selectedIndices: number[];
  }[];
  score: number;
  maxScore: number;
  percentage: number;
  attemptNumber: number;
  isFirstAttempt: boolean;
  submittedAt: Date;
}

const quizSubmissionSchema = new Schema<IQuizSubmission>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, required: true },
      selectedIndices: [Number],
    },
  ],
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  attemptNumber: { type: Number, required: true, min: 1 },
  isFirstAttempt: { type: Boolean, required: true },
  submittedAt: { type: Date, default: Date.now },
});

// Indexes
quizSubmissionSchema.index({ studentId: 1, quizId: 1, submittedAt: -1 });
quizSubmissionSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 });

export const QuizSubmission = model<IQuizSubmission>('QuizSubmission', quizSubmissionSchema);
```

#### 4.1.13 Attendance Collection

```typescript
// models/attendance.model.ts
export interface IAttendance extends Document {
  classId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  absenceReason?: string;
  markedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    absenceReason: String,
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound unique index (one record per student per class per day)
attendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, date: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
```

#### 4.1.14 Gamification Collections

```typescript
// models/badge.model.ts
export type BadgeTriggerType =
  | 'first-login'
  | 'first-lesson'
  | 'first-course'
  | 'reach-level'
  | 'earn-xp'
  | 'complete-lessons'
  | 'perfect-quiz'
  | 'streak-days';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string; // Lucide icon name
  gradientFrom: string;
  gradientTo: string;
  triggerType: BadgeTriggerType;
  triggerValue: number; // e.g., level 5, 1000 XP, 7 days
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    gradientFrom: { type: String, required: true },
    gradientTo: { type: String, required: true },
    triggerType: {
      type: String,
      enum: [
        'first-login',
        'first-lesson',
        'first-course',
        'reach-level',
        'earn-xp',
        'complete-lessons',
        'perfect-quiz',
        'streak-days',
      ],
      required: true,
    },
    triggerValue: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Badge = model<IBadge>('Badge', badgeSchema);
```

```typescript
// models/studentBadge.model.ts
export interface IStudentBadge extends Document {
  studentId: Schema.Types.ObjectId;
  badgeId: Schema.Types.ObjectId;
  earnedAt: Date;
}

const studentBadgeSchema = new Schema<IStudentBadge>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
});

// Compound unique index
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true });

export const StudentBadge = model<IStudentBadge>('StudentBadge', studentBadgeSchema);
```

```typescript
// models/xpTransaction.model.ts
export type XpSourceType = 'lesson' | 'exercise' | 'quiz' | 'daily-login' | 'streak-bonus' | 'admin-grant';

export interface IXpTransaction extends Document {
  studentId: Schema.Types.ObjectId;
  amount: number;
  sourceType: XpSourceType;
  sourceId?: Schema.Types.ObjectId;
  isFirstAttempt: boolean;
  description?: string;
  createdAt: Date;
}

const xpTransactionSchema = new Schema<IXpTransaction>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  sourceType: {
    type: String,
    enum: ['lesson', 'exercise', 'quiz', 'daily-login', 'streak-bonus', 'admin-grant'],
    required: true,
  },
  sourceId: Schema.Types.ObjectId,
  isFirstAttempt: { type: Boolean, default: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// Indexes
xpTransactionSchema.index({ studentId: 1, createdAt: -1 });
xpTransactionSchema.index({ studentId: 1, sourceType: 1, sourceId: 1 });

export const XpTransaction = model<IXpTransaction>('XpTransaction', xpTransactionSchema);
```

```typescript
// models/shopItem.model.ts
export type ShopCategory = 'avatar' | 'ui-theme' | 'editor-theme' | 'teacher-reward';

export interface IShopItem extends Document {
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  assetUrl?: string;
  previewUrl?: string;
  isPermanent: boolean; // false = consumable
  isActive: boolean;
  isFeatured: boolean;

  // For teacher rewards
  isTeacherReward: boolean;
  classId?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const shopItemSchema = new Schema<IShopItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['avatar', 'ui-theme', 'editor-theme', 'teacher-reward'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    assetUrl: String,
    previewUrl: String,
    isPermanent: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTeacherReward: { type: Boolean, default: false },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
shopItemSchema.index({ category: 1, isActive: 1 });
shopItemSchema.index({ classId: 1 }); // For teacher rewards

export const ShopItem = model<IShopItem>('ShopItem', shopItemSchema);
```

```typescript
// models/purchase.model.ts
export interface IPurchase extends Document {
  studentId: Schema.Types.ObjectId;
  itemId: Schema.Types.ObjectId;
  priceAtPurchase: number;
  purchasedAt: Date;

  // For teacher rewards
  status: 'completed' | 'pending-fulfillment' | 'fulfilled';
  fulfilledAt?: Date;
  fulfilledBy?: Schema.Types.ObjectId;
}

const purchaseSchema = new Schema<IPurchase>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'ShopItem', required: true },
  priceAtPurchase: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['completed', 'pending-fulfillment', 'fulfilled'],
    default: 'completed',
  },
  fulfilledAt: Date,
  fulfilledBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Indexes
purchaseSchema.index({ studentId: 1, itemId: 1 });
purchaseSchema.index({ status: 1 }); // For pending rewards queue

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
```

#### 4.1.15 Sandbox Project Collection

```typescript
// models/sandboxProject.model.ts
export interface ISandboxProject extends Document {
  studentId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  code: string;
  language: 'javascript' | 'python';
  createdAt: Date;
  updatedAt: Date;
}

const sandboxProjectSchema = new Schema<ISandboxProject>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    code: { type: String, default: '' },
    language: {
      type: String,
      enum: ['javascript', 'python'],
      default: 'javascript',
    },
  },
  { timestamps: true }
);

// Indexes
sandboxProjectSchema.index({ studentId: 1, updatedAt: -1 });

// Limit to 50 projects per student (enforced in service layer)

export const SandboxProject = model<ISandboxProject>('SandboxProject', sandboxProjectSchema);
```

#### 4.1.16 Help Request Collection

```typescript
// models/helpRequest.model.ts
export interface IHelpRequest extends Document {
  studentId: Schema.Types.ObjectId;
  exerciseId: Schema.Types.ObjectId;
  message: string;
  codeSnapshot: string;
  status: 'pending' | 'responded';
  responseMarkdown?: string;
  respondedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  respondedAt?: Date;
}

const helpRequestSchema = new Schema<IHelpRequest>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
  message: { type: String, required: true },
  codeSnapshot: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'responded'],
    default: 'pending',
  },
  responseMarkdown: String,
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  respondedAt: Date,
});

// Indexes
helpRequestSchema.index({ studentId: 1, status: 1 });
helpRequestSchema.index({ status: 1, createdAt: -1 }); // For teacher queue

export const HelpRequest = model<IHelpRequest>('HelpRequest', helpRequestSchema);
```

#### 4.1.17 Notification Collection

```typescript
// models/notification.model.ts
export type NotificationType =
  | 'badge-earned'
  | 'level-up'
  | 'help-response'
  | 'content-unlocked'
  | 'reward-pending'
  | 'system';

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['badge-earned', 'level-up', 'help-response', 'content-unlocked', 'reward-pending', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
```

#### 4.1.18 Settings Collections

```typescript
// models/gamificationSettings.model.ts
export interface IGamificationSettings extends Document {
  xpValues: {
    completeLesson: number;
    completeExercise: number;
    perfectQuiz: number;
    dailyLogin: number;
    firstOfDay: number;
  };
  levelFormula: {
    baseXp: number;
    multiplier: number;
  };
  levelOverrides: Map<number, number>; // level -> xp required
  updatedBy: Schema.Types.ObjectId;
  updatedAt: Date;
}

const gamificationSettingsSchema = new Schema<IGamificationSettings>({
  xpValues: {
    completeLesson: { type: Number, default: 10 },
    completeExercise: { type: Number, default: 15 },
    perfectQuiz: { type: Number, default: 25 },
    dailyLogin: { type: Number, default: 5 },
    firstOfDay: { type: Number, default: 10 },
  },
  levelFormula: {
    baseXp: { type: Number, default: 100 },
    multiplier: { type: Number, default: 1.5 },
  },
  levelOverrides: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

// Singleton pattern - only one document
export const GamificationSettings = model<IGamificationSettings>(
  'GamificationSettings',
  gamificationSettingsSchema
);
```

```typescript
// models/featureToggle.model.ts
export interface IFeatureToggles extends Document {
  shop: boolean;
  badges: boolean;
  dailyRewards: boolean;
  streaks: boolean;
  codeExecution: boolean;
  avatarUpload: boolean;
  updatedBy: Schema.Types.ObjectId;
  updatedAt: Date;
}

const featureTogglesSchema = new Schema<IFeatureToggles>({
  shop: { type: Boolean, default: true },
  badges: { type: Boolean, default: true },
  dailyRewards: { type: Boolean, default: true },
  streaks: { type: Boolean, default: true },
  codeExecution: { type: Boolean, default: true },
  avatarUpload: { type: Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

// Singleton pattern
export const FeatureToggles = model<IFeatureToggles>('FeatureToggles', featureTogglesSchema);
```

#### 4.1.19 Recently Viewed Collection (Admin)

```typescript
// models/recentlyViewed.model.ts
export interface IRecentlyViewed extends Document {
  userId: Schema.Types.ObjectId;
  itemType: 'user' | 'class' | 'course';
  itemId: Schema.Types.ObjectId;
  viewedAt: Date;
}

const recentlyViewedSchema = new Schema<IRecentlyViewed>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: {
    type: String,
    enum: ['user', 'class', 'course'],
    required: true,
  },
  itemId: { type: Schema.Types.ObjectId, required: true },
  viewedAt: { type: Date, default: Date.now },
});

// Indexes
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });
recentlyViewedSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const RecentlyViewed = model<IRecentlyViewed>('RecentlyViewed', recentlyViewedSchema);
```

#### 4.1.20 Refresh Token Collection

```typescript
// models/refreshToken.model.ts
export interface IRefreshToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index for automatic cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
```

---

## 5. Authentication & Authorization

### 5.1 JWT Strategy

```typescript
// utils/tokens.ts
import jwt from 'jsonwebtoken';
import { config } from '@/config';

interface TokenPayload {
  userId: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn, // '15m'
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn, // '7d'
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};
```

### 5.2 Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/tokens';
import { ApiError } from '@/utils/ApiError';
import { User } from '@/models';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};
```

### 5.3 Authorization Middleware

```typescript
// middleware/authorize.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';

type Role = 'admin' | 'teacher' | 'parent' | 'student';

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

// Usage example:
// router.post('/', authenticate, authorize(['admin']), controller.create);
```

### 5.4 Resource Authorization

For resources that require ownership or relationship checks:

```typescript
// middleware/authorizeResource.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';
import { Class, TeacherProfile } from '@/models';

// Teacher can only access their assigned classes
export const authorizeClassAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const classId = req.params.classId || req.params.id;

  if (user.role === 'admin') {
    return next(); // Admins can access all
  }

  if (user.role === 'teacher') {
    const teacherProfile = await TeacherProfile.findOne({ userId: user._id });

    if (!teacherProfile?.assignedClassIds.includes(classId)) {
      return next(new ApiError(403, 'You do not have access to this class'));
    }
  }

  next();
};

// Student can only access their own data
export const authorizeStudentData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const studentId = req.params.studentId || req.params.id;

  if (user.role === 'admin' || user.role === 'teacher') {
    return next();
  }

  if (user.role === 'student' && user._id.toString() !== studentId) {
    return next(new ApiError(403, 'You can only access your own data'));
  }

  next();
};
```

### 5.5 Password Hashing

```typescript
// utils/password.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

---

## 6. API Endpoints

### 6.1 Authentication

```
POST   /api/auth/login              # Login with email/username + password
POST   /api/auth/refresh            # Refresh access token
POST   /api/auth/logout             # Invalidate refresh token
POST   /api/auth/verify-email       # Verify email (teachers/admins)
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password with token
```

### 6.2 Users

```
GET    /api/users                   # List users (admin only, filterable by role)
POST   /api/users                   # Create user (admin only)
GET    /api/users/:id               # Get user details
PATCH  /api/users/:id               # Update user
DELETE /api/users/:id               # Deactivate user (soft delete)

# Student-specific
GET    /api/users/:id/profile       # Get student profile with gamification
PATCH  /api/users/:id/profile       # Update student preferences
GET    /api/users/:id/progress      # Get overall progress
GET    /api/users/:id/badges        # Get earned badges
GET    /api/users/:id/xp-history    # Get XP transaction history
GET    /api/users/:id/streaks       # Get streak information

# Teacher-specific
GET    /api/users/:id/classes       # Get teacher's assigned classes

# Parent-specific
GET    /api/users/:id/children      # Get linked children
```

### 6.3 Classes

```
GET    /api/classes                 # List classes (filtered by teacher for non-admins)
POST   /api/classes                 # Create class
GET    /api/classes/:id             # Get class details
PATCH  /api/classes/:id             # Update class
DELETE /api/classes/:id             # Archive class

GET    /api/classes/:id/students    # Get enrolled students
POST   /api/classes/:id/students    # Add student to class
DELETE /api/classes/:id/students/:studentId  # Remove student

POST   /api/classes/:id/transfer-student     # Transfer student (resets progress)

GET    /api/classes/:id/courses     # Get assigned courses
POST   /api/classes/:id/courses     # Assign course to class
DELETE /api/classes/:id/courses/:courseId    # Unassign course

POST   /api/classes/:id/unlock-lesson/:lessonId  # Unlock lesson for class
DELETE /api/classes/:id/unlock-lesson/:lessonId  # Lock lesson for class

GET    /api/classes/:id/attendance  # Get attendance records
POST   /api/classes/:id/attendance  # Mark attendance
```

### 6.4 Courses

```
GET    /api/courses                 # List courses
POST   /api/courses                 # Create course
GET    /api/courses/:id             # Get course details
PATCH  /api/courses/:id             # Update course
DELETE /api/courses/:id             # Delete course (blocked if assigned)
POST   /api/courses/:id/clone       # Clone course
POST   /api/courses/:id/publish     # Publish course
POST   /api/courses/:id/unpublish   # Unpublish course
```

### 6.5 Sections

```
GET    /api/courses/:courseId/sections              # List sections
POST   /api/courses/:courseId/sections              # Create section
GET    /api/courses/:courseId/sections/:sectionId   # Get section
PATCH  /api/courses/:courseId/sections/:sectionId   # Update section
DELETE /api/courses/:courseId/sections/:sectionId   # Delete section (blocked if has lessons)
PATCH  /api/courses/:courseId/sections/reorder      # Reorder sections
```

### 6.6 Lessons

```
GET    /api/courses/:courseId/sections/:sectionId/lessons              # List lessons
POST   /api/courses/:courseId/sections/:sectionId/lessons              # Create lesson
GET    /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Get lesson
PATCH  /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Update lesson
DELETE /api/courses/:courseId/sections/:sectionId/lessons/:lessonId    # Delete lesson
POST   /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/duplicate  # Duplicate
PATCH  /api/courses/:courseId/sections/:sectionId/lessons/reorder      # Reorder lessons

# Locking
POST   /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/lock    # Acquire lock
DELETE /api/courses/:courseId/sections/:sectionId/lessons/:lessonId/lock    # Release lock
```

### 6.7 Exercises

```
GET    /api/lessons/:lessonId/exercises              # List exercises
POST   /api/lessons/:lessonId/exercises              # Create exercise
GET    /api/lessons/:lessonId/exercises/:exerciseId  # Get exercise
PATCH  /api/lessons/:lessonId/exercises/:exerciseId  # Update exercise
DELETE /api/lessons/:lessonId/exercises/:exerciseId  # Delete exercise

# Student submissions
POST   /api/exercises/:id/submit                     # Submit solution
GET    /api/exercises/:id/submissions                # Get submissions (teacher: all, student: own)
```

### 6.8 Quizzes

```
GET    /api/lessons/:lessonId/quizzes                # List quizzes
POST   /api/lessons/:lessonId/quizzes                # Create quiz
GET    /api/lessons/:lessonId/quizzes/:quizId        # Get quiz
PATCH  /api/lessons/:lessonId/quizzes/:quizId        # Update quiz
DELETE /api/lessons/:lessonId/quizzes/:quizId        # Delete quiz

# Student submissions
POST   /api/quizzes/:id/submit                       # Submit answers
GET    /api/quizzes/:id/results                      # Get results
GET    /api/quizzes/:id/attempts                     # Get attempt count
```

### 6.9 Progress

```
GET    /api/students/:id/progress                    # Get overall progress
GET    /api/students/:id/progress/course/:courseId   # Get course progress
POST   /api/progress/lesson/:lessonId/start          # Mark lesson started
POST   /api/progress/lesson/:lessonId/complete       # Mark lesson completed
```

### 6.10 Gamification

```
# Badges
GET    /api/badges                  # List badges
POST   /api/badges                  # Create badge (admin)
GET    /api/badges/:id              # Get badge
PATCH  /api/badges/:id              # Update badge (admin)
DELETE /api/badges/:id              # Delete badge (admin)
GET    /api/badges/:id/earners      # Get students who earned badge

# Shop
GET    /api/shop/items              # List shop items
POST   /api/shop/items              # Create item (admin/teacher)
GET    /api/shop/items/:id          # Get item
PATCH  /api/shop/items/:id          # Update item
DELETE /api/shop/items/:id          # Delete item
POST   /api/shop/purchase           # Purchase item

# Teacher rewards
GET    /api/rewards/pending         # Get pending reward purchases (teacher)
POST   /api/rewards/:id/fulfill     # Mark reward as fulfilled

# Settings (admin only)
GET    /api/gamification/settings   # Get gamification settings
PATCH  /api/gamification/settings   # Update settings
```

### 6.11 Help Requests

```
GET    /api/help-requests           # List help requests (filtered by role)
POST   /api/help-requests           # Create help request (student)
GET    /api/help-requests/:id       # Get help request
POST   /api/help-requests/:id/respond  # Respond to request (teacher)
```

### 6.12 Sandbox

```
GET    /api/sandbox/projects        # List student's projects
POST   /api/sandbox/projects        # Create project
GET    /api/sandbox/projects/:id    # Get project
PATCH  /api/sandbox/projects/:id    # Update project
DELETE /api/sandbox/projects/:id    # Delete project
```

### 6.13 Notifications

```
GET    /api/notifications           # List user's notifications
PATCH  /api/notifications/:id/read  # Mark as read
POST   /api/notifications/read-all  # Mark all as read
DELETE /api/notifications/:id       # Delete notification
```

### 6.14 Analytics

```
GET    /api/analytics/school        # School-wide metrics (admin)
GET    /api/analytics/teacher/me    # Teacher's own stats
GET    /api/analytics/class/:id     # Class analytics
GET    /api/analytics/student/:id   # Student analytics
GET    /api/analytics/course/:id    # Course analytics
```

### 6.15 Uploads

```
POST   /api/uploads                 # Upload file
DELETE /api/uploads/:id             # Delete file
```

### 6.16 Settings (Admin)

```
GET    /api/settings/features       # Get feature toggles
PATCH  /api/settings/features       # Update feature toggles
GET    /api/settings/system         # Get system settings
PATCH  /api/settings/system         # Update system settings
```

### 6.17 Recently Viewed (Admin)

```
GET    /api/recently-viewed         # Get recently viewed items
POST   /api/recently-viewed         # Track viewed item
```

---

## 7. Request & Response Formats

### 7.1 Success Response

```typescript
// Single resource
{
  "success": true,
  "data": {
    "id": "...",
    "...": "..."
  }
}

// List with pagination
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 10,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Action confirmation
{
  "success": true,
  "message": "Resource created successfully"
}
```

### 7.2 Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### 7.3 Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `INTERNAL_ERROR` | 500 | Server error |

### 7.4 Business Rule Error Codes

| Code | Description |
|------|-------------|
| `TEACHER_HAS_CLASSES` | Cannot deactivate teacher with assigned classes |
| `COURSE_ASSIGNED_TO_CLASSES` | Cannot delete course assigned to classes |
| `SECTION_HAS_LESSONS` | Cannot delete section with lessons |
| `INSUFFICIENT_BALANCE` | Not enough coins for purchase |
| `MAX_PROJECTS_REACHED` | Sandbox project limit (50) reached |
| `PENDING_HELP_REQUEST` | Student already has pending help request |
| `QUIZ_ATTEMPT_LIMIT` | Maximum quiz attempts reached |
| `LESSON_LOCKED` | Lesson is being edited by another user |

### 7.5 Pagination Query Parameters

```
GET /api/resources?page=1&limit=10&sort=createdAt&order=desc
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number (1-indexed) |
| `limit` | 10 | Items per page (max 100) |
| `sort` | createdAt | Sort field |
| `order` | desc | Sort order (asc/desc) |

### 7.6 Filter Query Parameters

```
GET /api/users?role=student&isActive=true&search=john
GET /api/courses?language=javascript&status=published
```

---

## 8. Validation Schemas

### 8.1 Auth Schemas

```typescript
// modules/auth/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or username required'),
    password: z.string().min(1, 'Password required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});
```

### 8.2 User Schemas

```typescript
// modules/users/users.schema.ts
import { z } from 'zod';

const baseUserSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100).optional(),
});

export const createTeacherSchema = z.object({
  body: baseUserSchema.extend({
    email: z.string().email(),
    password: z.string().min(8),
    assignedClassIds: z.array(z.string()).optional(),
  }),
});

export const createStudentSchema = z.object({
  body: baseUserSchema.extend({
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-z0-9_]+$/, 'Username must be alphanumeric with underscores'),
    email: z.string().email().optional(),
    password: z.string().min(8),
    classId: z.string().optional(),
    parentId: z.string().optional(),
  }),
});

export const createParentSchema = z.object({
  body: baseUserSchema.extend({
    email: z.string().email(),
    password: z.string().min(8),
    childIds: z.array(z.string()).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: baseUserSchema.partial().extend({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(['admin', 'teacher', 'parent', 'student']).optional(),
    isActive: z.coerce.boolean().optional(),
    classId: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sort: z.string().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});
```

### 8.3 Course Schemas

```typescript
// modules/courses/courses.schema.ts
import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    language: z.enum(['javascript', 'python']),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});
```

### 8.4 Section Schemas

```typescript
// modules/sections/sections.schema.ts
import { z } from 'zod';

export const createSectionSchema = z.object({
  params: z.object({
    courseId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
  }),
});

export const reorderSectionsSchema = z.object({
  params: z.object({
    courseId: z.string(),
  }),
  body: z.object({
    order: z.array(z.string()).min(1),
  }),
});
```

### 8.5 Lesson Schemas

```typescript
// modules/lessons/lessons.schema.ts
import { z } from 'zod';

export const createLessonSchema = z.object({
  params: z.object({
    courseId: z.string(),
    sectionId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({
    courseId: z.string(),
    sectionId: z.string(),
    lessonId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    codeMode: z.enum(['visual', 'text', 'mixed']).optional(),
    editorComplexity: z.enum(['simplified', 'standard', 'advanced']).optional(),
    starterCode: z.string().optional(),
    estimatedDuration: z.number().int().positive().optional(),
    xpReward: z.number().int().min(0).optional(),
  }),
});
```

### 8.6 Exercise Schemas

```typescript
// modules/exercises/exercises.schema.ts
import { z } from 'zod';

const testCaseSchema = z.object({
  input: z.string().default(''),
  expectedOutput: z.string().min(1),
  isHidden: z.boolean().default(false),
});

export const createExerciseSchema = z.object({
  params: z.object({
    lessonId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    instructions: z.string().min(1),
    starterCode: z.string().optional(),
    solution: z.string().min(1),
    testCases: z.array(testCaseSchema).min(1),
    xpReward: z.number().int().min(0).default(15),
  }),
});

export const submitExerciseSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    code: z.string(),
    testsPassed: z.number().int().min(0),
    testsTotal: z.number().int().positive(),
    passed: z.boolean(),
  }),
});
```

### 8.7 Quiz Schemas

```typescript
// modules/quizzes/quizzes.schema.ts
import { z } from 'zod';

const quizQuestionSchema = z.object({
  type: z.enum([
    'multiple-choice',
    'multiple-answer',
    'true-false',
    'code-output',
    'fill-blank',
    'parsons',
  ]),
  question: z.string().min(1),
  codeSnippet: z.string().optional(),
  options: z.array(z.string()).min(2),
  correctIndices: z.array(z.number().int().min(0)).min(1),
  explanation: z.string().optional(),
  points: z.number().int().positive().default(1),
});

export const createQuizSchema = z.object({
  params: z.object({
    lessonId: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    questions: z.array(quizQuestionSchema).min(1),
    maxAttempts: z.number().int().positive().nullable().default(null),
    randomizeQuestions: z.boolean().default(false),
    randomizeOptions: z.boolean().default(false),
    xpReward: z.number().int().min(0).default(25),
  }),
});

export const submitQuizSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        selectedIndices: z.array(z.number().int().min(0)),
      })
    ),
  }),
});
```

### 8.8 Validation Middleware

```typescript
// middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
      } else {
        next(error);
      }
    }
  };
};
```

---

## 9. Error Handling

### 9.1 Custom Error Class

```typescript
// utils/ApiError.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, 'VALIDATION_ERROR', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static unprocessable(message: string, code: string) {
    return new ApiError(422, message, code);
  }
}
```

### 9.2 Global Error Handler

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/utils/logger';
import { config } from '@/config';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed',
        details: error.message,
      },
    });
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: 'Resource already exists',
      },
    });
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isDev ? error.message : 'An unexpected error occurred',
    },
  });
};
```

### 9.3 Async Handler

```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 9.4 Not Found Handler

```typescript
// middleware/notFound.ts
import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
```

---

## 10. File Uploads

### 10.1 Upload Service

```typescript
// modules/uploads/uploads.service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { config } from '@/config';
import { ApiError } from '@/utils/ApiError';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
  forcePathStyle: true, // Required for MinIO
});

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  audio: ['audio/mp3', 'audio/wav', 'audio/mpeg'],
  document: ['application/pdf'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string
): Promise<{ url: string; key: string }> => {
  // Validate file type
  const allAllowed = Object.values(ALLOWED_TYPES).flat();
  if (!allAllowed.includes(file.mimetype)) {
    throw ApiError.badRequest('File type not allowed');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw ApiError.badRequest('File size exceeds limit');
  }

  const extension = file.originalname.split('.').pop();
  const key = `${folder}/${uuidv4()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `${config.s3.publicUrl}/${config.s3.bucket}/${key}`;

  return { url, key };
};

export const deleteFile = async (key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    })
  );
};
```

### 10.2 Upload Route

```typescript
// modules/uploads/uploads.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '@/middleware/auth';
import * as controller from './uploads.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  upload.single('file'),
  controller.upload
);

router.delete(
  '/:key(*)',
  authenticate,
  authorize(['admin', 'teacher']),
  controller.remove
);

export default router;
```

---

## 11. Exercise Validation

### 11.1 Server-Side Recording

The backend does **not** execute student code. Code execution happens in the browser (client-side). The backend:

1. Receives submission results from the client
2. Validates the submission format
3. Records the results
4. Awards XP if first passing submission
5. Updates progress

```typescript
// modules/exercises/exercises.service.ts
import { Exercise, ExerciseSubmission, StudentProfile, XpTransaction, LessonProgress } from '@/models';
import { ApiError } from '@/utils/ApiError';
import { checkAndAwardBadges } from '@/modules/gamification/badges/badges.service';

interface SubmitExerciseInput {
  studentId: string;
  exerciseId: string;
  code: string;
  testsPassed: number;
  testsTotal: number;
  passed: boolean;
}

export const submitExercise = async (input: SubmitExerciseInput) => {
  const { studentId, exerciseId, code, testsPassed, testsTotal, passed } = input;

  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    throw ApiError.notFound('Exercise');
  }

  // Validate test counts match
  if (testsTotal !== exercise.testCases.length) {
    throw ApiError.badRequest('Invalid test count');
  }

  // Create submission record
  const submission = await ExerciseSubmission.create({
    studentId,
    exerciseId,
    code,
    testsPassed,
    testsTotal,
    passed,
  });

  // Clean up old submissions (keep last 5)
  const submissions = await ExerciseSubmission.find({ studentId, exerciseId })
    .sort({ submittedAt: -1 })
    .skip(5);

  if (submissions.length > 0) {
    await ExerciseSubmission.deleteMany({
      _id: { $in: submissions.map((s) => s._id) },
    });
  }

  // Award XP on first pass
  if (passed) {
    const previousPass = await ExerciseSubmission.findOne({
      studentId,
      exerciseId,
      passed: true,
      _id: { $ne: submission._id },
    });

    if (!previousPass) {
      // First time passing - award XP
      await awardXp(studentId, exercise.xpReward, 'exercise', exerciseId);

      // Update lesson progress
      await updateLessonProgress(studentId, exercise.lessonId.toString());

      // Check for badges
      await checkAndAwardBadges(studentId);
    }
  }

  return {
    submission,
    isFirstPass: passed && !previousPass,
    xpAwarded: passed && !previousPass ? exercise.xpReward : 0,
  };
};

const awardXp = async (
  studentId: string,
  amount: number,
  sourceType: string,
  sourceId: string
) => {
  // Create transaction
  await XpTransaction.create({
    studentId,
    amount,
    sourceType,
    sourceId,
    isFirstAttempt: true,
  });

  // Update student profile
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (profile) {
    profile.totalXp += amount;

    // Check for level up
    const newLevel = calculateLevel(profile.totalXp);
    if (newLevel > profile.currentLevel) {
      profile.currentLevel = newLevel;
      // TODO: Create level-up notification
    }

    await profile.save();
  }
};
```

---

## 12. Testing Strategy

### 12.1 Test Configuration

```typescript
// tests/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### 12.2 Test Helpers

```typescript
// tests/helpers/auth.ts
import { User, StudentProfile, TeacherProfile } from '@/models';
import { generateAccessToken } from '@/utils/tokens';
import { hashPassword } from '@/utils/password';

export const createTestUser = async (role: string, overrides = {}) => {
  const user = await User.create({
    email: `test-${Date.now()}@example.com`,
    passwordHash: await hashPassword('password123'),
    role,
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    emailVerified: true,
    isActive: true,
    ...overrides,
  });

  if (role === 'student') {
    await StudentProfile.create({ userId: user._id });
  } else if (role === 'teacher') {
    await TeacherProfile.create({ userId: user._id });
  }

  const token = generateAccessToken({ userId: user._id.toString(), role });

  return { user, token };
};
```

### 12.3 Integration Test Example

```typescript
// tests/integration/auth.test.ts
import { describe, test, expect, beforeAll } from 'bun:test';
import supertest from 'supertest';
import { app } from '@/app';
import { User } from '@/models';
import { hashPassword } from '@/utils/password';

const request = supertest(app);

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await User.create({
      email: 'test@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'admin',
      firstName: 'Test',
      lastName: 'Admin',
      displayName: 'Test Admin',
      emailVerified: true,
      isActive: true,
    });
  });

  test('should login with valid credentials', async () => {
    const response = await request.post('/api/auth/login').send({
      identifier: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  test('should reject invalid password', async () => {
    const response = await request.post('/api/auth/login').send({
      identifier: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  test('should reject non-existent user', async () => {
    const response = await request.post('/api/auth/login').send({
      identifier: 'nonexistent@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

### 12.4 Unit Test Example

```typescript
// tests/unit/utils/tokens.test.ts
import { describe, test, expect } from 'bun:test';
import { generateAccessToken, verifyAccessToken } from '@/utils/tokens';

describe('Token Utils', () => {
  const payload = { userId: '123', role: 'student' as const };

  test('should generate valid access token', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should verify valid access token', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  test('should reject invalid token', () => {
    expect(() => verifyAccessToken('invalid-token')).toThrow();
  });
});
```

### 12.5 Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/integration/auth.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

---

## 13. Seed Data

### 13.1 Seed Runner

```typescript
// seed/index.ts
import mongoose from 'mongoose';
import { config } from '@/config';
import { seedUsers } from './users.seed';
import { seedCourses } from './courses.seed';
import { seedClasses } from './classes.seed';
import { seedProgress } from './progress.seed';
import { seedGamification } from './gamification.seed';
import { logger } from '@/utils/logger';

const seed = async () => {
  try {
    await mongoose.connect(config.database.url);
    logger.info('Connected to database');

    // Clear existing data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    logger.info('Cleared existing data');

    // Seed in order (respecting dependencies)
    const users = await seedUsers();
    logger.info(`Seeded ${Object.keys(users).length} users`);

    const courses = await seedCourses(users);
    logger.info(`Seeded ${courses.length} courses`);

    const classes = await seedClasses(users, courses);
    logger.info(`Seeded ${classes.length} classes`);

    await seedProgress(users, courses);
    logger.info('Seeded progress data');

    await seedGamification(users);
    logger.info('Seeded gamification data');

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
```

### 13.2 Users Seed

```typescript
// seed/users.seed.ts
import { User, StudentProfile, TeacherProfile, ParentProfile } from '@/models';
import { hashPassword } from '@/utils/password';

export const seedUsers = async () => {
  const password = await hashPassword('password123');

  // Admin
  const admin = await User.create({
    email: 'admin@silveredge.com',
    passwordHash: password,
    role: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    displayName: 'System Admin',
    emailVerified: true,
    isActive: true,
  });

  // Teachers
  const teacher1 = await User.create({
    email: 'maria.santos@silveredge.edu',
    passwordHash: password,
    role: 'teacher',
    firstName: 'Maria',
    lastName: 'Santos',
    displayName: 'Ms. Santos',
    emailVerified: true,
    isActive: true,
  });
  await TeacherProfile.create({ userId: teacher1._id, assignedClassIds: [] });

  const teacher2 = await User.create({
    email: 'john.smith@silveredge.edu',
    passwordHash: password,
    role: 'teacher',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'Mr. Smith',
    emailVerified: true,
    isActive: true,
  });
  await TeacherProfile.create({ userId: teacher2._id, assignedClassIds: [] });

  // Students
  const students = [];
  const studentData = [
    { username: 'alex_coder', firstName: 'Alex', lastName: 'Chen', level: 5, xp: 680 },
    { username: 'maya_dev', firstName: 'Maya', lastName: 'Patel', level: 12, xp: 3500 },
    { username: 'newbie', firstName: 'Sam', lastName: 'Wilson', level: 1, xp: 0 },
    { username: 'emma_js', firstName: 'Emma', lastName: 'Johnson', level: 7, xp: 1200 },
    { username: 'lucas_py', firstName: 'Lucas', lastName: 'Brown', level: 4, xp: 450 },
    { username: 'sophia_code', firstName: 'Sophia', lastName: 'Garcia', level: 8, xp: 1800 },
    { username: 'noah_dev', firstName: 'Noah', lastName: 'Martinez', level: 3, xp: 250 },
    { username: 'olivia_bug', firstName: 'Olivia', lastName: 'Anderson', level: 6, xp: 900 },
    { username: 'liam_loop', firstName: 'Liam', lastName: 'Taylor', level: 9, xp: 2200 },
    { username: 'ava_func', firstName: 'Ava', lastName: 'Thomas', level: 2, xp: 120 },
  ];

  for (const data of studentData) {
    const student = await User.create({
      username: data.username,
      passwordHash: password,
      role: 'student',
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      emailVerified: false,
      isActive: true,
    });

    await StudentProfile.create({
      userId: student._id,
      currentLevel: data.level,
      totalXp: data.xp,
      currencyBalance: data.xp * 2, // 2 coins per XP
      currentStreakDays: Math.floor(Math.random() * 10),
      longestStreak: Math.floor(Math.random() * 30),
    });

    students.push(student);
  }

  // Parents
  const parent1 = await User.create({
    email: 'parent1@example.com',
    passwordHash: password,
    role: 'parent',
    firstName: 'David',
    lastName: 'Chen',
    displayName: 'David Chen',
    emailVerified: true,
    isActive: true,
  });
  await ParentProfile.create({ userId: parent1._id, childIds: [students[0]._id] });

  // Update student with parent
  await StudentProfile.updateOne(
    { userId: students[0]._id },
    { $push: { parentIds: parent1._id } }
  );

  return {
    admin,
    teachers: [teacher1, teacher2],
    students,
    parents: [parent1],
  };
};
```

### 13.3 Courses Seed

```typescript
// seed/courses.seed.ts
import { Course, Section, Lesson, Exercise, Quiz } from '@/models';

export const seedCourses = async (users: any) => {
  const courses = [];

  // JavaScript Basics Course
  const jsCourse = await Course.create({
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript programming',
    language: 'javascript',
    status: 'published',
    createdBy: users.teachers[0]._id,
  });

  const jsSection1 = await Section.create({
    courseId: jsCourse._id,
    title: 'Getting Started',
    description: 'Introduction to JavaScript',
    orderIndex: 0,
  });

  const jsLesson1 = await Lesson.create({
    sectionId: jsSection1._id,
    title: 'What is JavaScript?',
    content: `# What is JavaScript?

JavaScript is a programming language that makes websites interactive...

## Why Learn JavaScript?

- It runs in every web browser
- It's beginner-friendly
- It's powerful and versatile`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'text',
    xpReward: 10,
  });

  await Exercise.create({
    lessonId: jsLesson1._id,
    title: 'Hello World',
    instructions: 'Write a program that prints "Hello, World!" to the console.',
    orderIndex: 0,
    starterCode: '// Write your code below\n',
    solution: 'console.log("Hello, World!");',
    testCases: [
      { input: '', expectedOutput: 'Hello, World!', isHidden: false },
    ],
    xpReward: 15,
  });

  // Add more sections and lessons...
  const jsSection2 = await Section.create({
    courseId: jsCourse._id,
    title: 'Variables',
    description: 'Understanding variables and data types',
    orderIndex: 1,
  });

  // Python Course
  const pythonCourse = await Course.create({
    title: 'Python Adventures',
    description: 'Explore programming with Python',
    language: 'python',
    status: 'published',
    createdBy: users.teachers[1]._id,
  });

  // Add Python sections and lessons...

  // Update course with section IDs
  await Course.updateOne(
    { _id: jsCourse._id },
    { $set: { sectionIds: [jsSection1._id, jsSection2._id] } }
  );

  courses.push(jsCourse, pythonCourse);
  return courses;
};
```

### 13.4 Classes Seed

```typescript
// seed/classes.seed.ts
import { Class, TeacherProfile, StudentProfile, LessonUnlock } from '@/models';

export const seedClasses = async (users: any, courses: any) => {
  const classes = [];

  // Class 1 - JavaScript Beginners
  const class1 = await Class.create({
    name: 'JavaScript Beginners 2026',
    description: 'Morning class for JavaScript fundamentals',
    color: '#f59e0b',
    teacherId: users.teachers[0]._id,
    studentIds: users.students.slice(0, 5).map((s: any) => s._id),
    courseIds: [courses[0]._id],
    status: 'active',
  });

  // Update teacher profile
  await TeacherProfile.updateOne(
    { userId: users.teachers[0]._id },
    { $push: { assignedClassIds: class1._id } }
  );

  // Update student profiles
  for (const student of users.students.slice(0, 5)) {
    await StudentProfile.updateOne(
      { userId: student._id },
      { $set: { classId: class1._id } }
    );
  }

  // Unlock some lessons for the class
  // (Get lesson IDs and create unlock records)

  // Class 2 - Python Explorers
  const class2 = await Class.create({
    name: 'Python Explorers 2026',
    description: 'Afternoon Python class',
    color: '#3b82f6',
    teacherId: users.teachers[1]._id,
    studentIds: users.students.slice(5).map((s: any) => s._id),
    courseIds: [courses[1]._id],
    status: 'active',
  });

  await TeacherProfile.updateOne(
    { userId: users.teachers[1]._id },
    { $push: { assignedClassIds: class2._id } }
  );

  for (const student of users.students.slice(5)) {
    await StudentProfile.updateOne(
      { userId: student._id },
      { $set: { classId: class2._id } }
    );
  }

  classes.push(class1, class2);
  return classes;
};
```

### 13.5 Gamification Seed

```typescript
// seed/gamification.seed.ts
import {
  Badge,
  StudentBadge,
  ShopItem,
  GamificationSettings,
  FeatureToggles,
} from '@/models';

export const seedGamification = async (users: any) => {
  // Create badges
  const badges = await Badge.insertMany([
    {
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'footprints',
      gradientFrom: '#8b5cf6',
      gradientTo: '#6366f1',
      triggerType: 'first-lesson',
      triggerValue: 1,
      isActive: true,
      createdBy: users.admin._id,
    },
    {
      name: 'Bug Squasher',
      description: 'Pass 10 exercises',
      icon: 'bug',
      gradientFrom: '#22c55e',
      gradientTo: '#16a34a',
      triggerType: 'complete-lessons',
      triggerValue: 10,
      isActive: true,
      createdBy: users.admin._id,
    },
    {
      name: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: 'flame',
      gradientFrom: '#f97316',
      gradientTo: '#ea580c',
      triggerType: 'streak-days',
      triggerValue: 7,
      isActive: true,
      createdBy: users.admin._id,
    },
    {
      name: 'Level 5',
      description: 'Reach level 5',
      icon: 'trophy',
      gradientFrom: '#eab308',
      gradientTo: '#ca8a04',
      triggerType: 'reach-level',
      triggerValue: 5,
      isActive: true,
      createdBy: users.admin._id,
    },
  ]);

  // Award some badges to students
  const advancedStudents = users.students.filter((s: any) =>
    ['alex_coder', 'maya_dev', 'liam_loop'].includes(s.username)
  );

  for (const student of advancedStudents) {
    await StudentBadge.create({
      studentId: student._id,
      badgeId: badges[0]._id,
      earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    });
  }

  // Create shop items
  await ShopItem.insertMany([
    {
      name: 'Robot Avatar',
      description: 'A friendly robot companion',
      category: 'avatar',
      price: 50,
      previewUrl: '/avatars/robot.png',
      isPermanent: true,
      isActive: true,
      isFeatured: true,
      isTeacherReward: false,
      createdBy: users.admin._id,
    },
    {
      name: 'Wizard Avatar',
      description: 'A magical coding wizard',
      category: 'avatar',
      price: 75,
      previewUrl: '/avatars/wizard.png',
      isPermanent: true,
      isActive: true,
      isFeatured: false,
      isTeacherReward: false,
      createdBy: users.admin._id,
    },
    {
      name: 'Dark Mode Theme',
      description: 'Easy on the eyes',
      category: 'ui-theme',
      price: 100,
      isPermanent: true,
      isActive: true,
      isFeatured: true,
      isTeacherReward: false,
      createdBy: users.admin._id,
    },
    {
      name: 'Monokai Editor',
      description: 'Classic dark editor theme',
      category: 'editor-theme',
      price: 80,
      isPermanent: true,
      isActive: true,
      isFeatured: false,
      isTeacherReward: false,
      createdBy: users.admin._id,
    },
  ]);

  // Create settings (singleton)
  await GamificationSettings.create({
    xpValues: {
      completeLesson: 10,
      completeExercise: 15,
      perfectQuiz: 25,
      dailyLogin: 5,
      firstOfDay: 10,
    },
    levelFormula: {
      baseXp: 100,
      multiplier: 1.5,
    },
    updatedBy: users.admin._id,
  });

  await FeatureToggles.create({
    shop: true,
    badges: true,
    dailyRewards: true,
    streaks: true,
    codeExecution: true,
    avatarUpload: false,
    updatedBy: users.admin._id,
  });
};
```

### 13.6 Running Seeds

```bash
# Run seed script
bun run seed

# Or via npm script
bun run db:seed
```

Add to `package.json`:
```json
{
  "scripts": {
    "seed": "bun run src/seed/index.ts",
    "db:seed": "bun run seed"
  }
}
```

---

## 14. Environment Configuration

### 14.1 Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/silveredge

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=silveredge
S3_PUBLIC_URL=http://localhost:9000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Logging
LOG_LEVEL=debug
```

### 14.2 Configuration Loader

```typescript
// config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  MONGODB_URI: z.string(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  S3_ENDPOINT: z.string(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  S3_PUBLIC_URL: z.string(),

  CORS_ORIGIN: z.string().transform((s) => s.split(',')),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,

  database: {
    url: env.MONGODB_URI,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  s3: {
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    bucket: env.S3_BUCKET,
    publicUrl: env.S3_PUBLIC_URL,
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  log: {
    level: env.LOG_LEVEL,
  },
};
```

---

## 15. API Documentation

### 15.1 Swagger Configuration

```typescript
// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Silver Edge Academy API',
      version: '1.0.0',
      description: 'API documentation for Silver Edge Academy LMS',
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.schema.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 15.2 Route Documentation Example

```typescript
// modules/auth/auth.routes.ts

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), controller.login);
```

### 15.3 Swagger UI Setup

```typescript
// app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/config/swagger';

const app = express();

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});
```

Access documentation at: `http://localhost:3000/api/docs`

---

## 16. Deployment

### 16.1 Docker Compose (Updated for MongoDB)

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: silveredge
    ports:
      - "27017:27017"

  minio:
    image: minio/minio
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"
      - "9001:9001"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    depends_on:
      - mongodb
      - minio
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/silveredge?authSource=admin
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ROOT_USER}
      S3_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      S3_BUCKET: silveredge
      S3_PUBLIC_URL: http://localhost:9000
      CORS_ORIGIN: http://localhost:8080
    ports:
      - "3000:3000"

volumes:
  mongodb_data:
  minio_data:
```

### 16.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

### 16.3 Build Script

```json
// package.json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun run dist/index.js",
    "seed": "bun run src/seed/index.ts",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Appendix A: Type Definitions

### Express Extensions

```typescript
// types/express.d.ts
import { IUser } from '@/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
```

### Environment Types

```typescript
// types/environment.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    PORT: string;
    MONGODB_URI: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    S3_ENDPOINT: string;
    S3_REGION: string;
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET: string;
    S3_PUBLIC_URL: string;
    CORS_ORIGIN: string;
    LOG_LEVEL: string;
  }
}
```

---

## Appendix B: Dependencies

```json
// package.json
{
  "name": "silveredge-backend",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x",
    "bcrypt": "^5.x",
    "cors": "^2.x",
    "express": "^4.x",
    "helmet": "^7.x",
    "jsonwebtoken": "^9.x",
    "mongoose": "^8.x",
    "multer": "^1.x",
    "pino": "^8.x",
    "pino-http": "^9.x",
    "swagger-jsdoc": "^6.x",
    "swagger-ui-express": "^5.x",
    "uuid": "^9.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.x",
    "@types/cors": "^2.x",
    "@types/express": "^4.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/multer": "^1.x",
    "@types/swagger-jsdoc": "^6.x",
    "@types/swagger-ui-express": "^4.x",
    "@types/uuid": "^9.x",
    "bun-types": "^1.x",
    "mongodb-memory-server": "^9.x",
    "supertest": "^6.x",
    "typescript": "^5.x"
  }
}
```

---

*Version: 1.0.0*
*Last Updated: 2026-01-17*

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Initial backend specification with MongoDB/Mongoose, Zod validation, Bun runtime, comprehensive seed data |
