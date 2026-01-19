// User models
export { User, type IUser } from '../modules/users/users.model'
export { StudentProfile, type IStudentProfile } from '../modules/users/studentProfile.model'
export { TeacherProfile, type ITeacherProfile } from '../modules/users/teacherProfile.model'
export { ParentProfile, type IParentProfile } from '../modules/users/parentProfile.model'

// Content models
export { Course, type ICourse } from '../modules/courses/courses.model'
export { Section, type ISection } from '../modules/sections/sections.model'
export { Lesson, type ILesson } from '../modules/lessons/lessons.model'
export { Exercise, type IExercise, type ITestCase } from '../modules/exercises/exercises.model'
export { Quiz, type IQuiz, type IQuizQuestion } from '../modules/quizzes/quizzes.model'

// Class models
export { Class, type IClass } from '../modules/classes/classes.model'
export { LessonUnlock, type ILessonUnlock } from '../modules/classes/lessonUnlock.model'

// Progress models
export { LessonProgress, type ILessonProgress } from '../modules/progress/lessonProgress.model'
export {
  ExerciseSubmission,
  type IExerciseSubmission,
} from '../modules/progress/exerciseSubmission.model'
export { QuizSubmission, type IQuizSubmission } from '../modules/progress/quizSubmission.model'

// Attendance model
export { Attendance, type IAttendance } from '../modules/attendance/attendance.model'

// Auth model
export { RefreshToken, type IRefreshToken } from '../modules/auth/refreshToken.model'
