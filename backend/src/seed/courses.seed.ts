import { Types } from 'mongoose'
import { Course } from '../modules/courses/courses.model'
import { Section } from '../modules/sections/sections.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Exercise } from '../modules/exercises/exercises.model'
import { Quiz } from '../modules/quizzes/quizzes.model'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

export interface SeededCourses {
  javascript: Types.ObjectId
  python: Types.ObjectId
}

export async function seedCourses(adminId: Types.ObjectId): Promise<SeededCourses> {
  logger.info('Seeding courses...')

  // JavaScript Course
  const jsCourse = await Course.create({
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    language: 'javascript',
    status: 'published',
    createdBy: adminId,
  })

  // JavaScript Sections
  const jsSection1 = await Section.create({
    courseId: jsCourse._id,
    title: 'Getting Started',
    description: 'Introduction to JavaScript',
    orderIndex: 0,
  })

  const jsSection2 = await Section.create({
    courseId: jsCourse._id,
    title: 'Variables and Data Types',
    description: 'Learn about variables and data types',
    orderIndex: 1,
  })

  // JavaScript Lessons
  const jsLesson1 = await Lesson.create({
    sectionId: jsSection1._id,
    title: 'Hello World',
    content: `# Hello World in JavaScript

Welcome to JavaScript! Let's write your first program.

## Console Output

In JavaScript, we use \`console.log()\` to print messages:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This will display "Hello, World!" in the console.

## Try it yourself!

Write your own message in the code editor.`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'simplified',
    starterCode: '// Write your first JavaScript code here\n',
    xpReward: 10,
  })

  await Exercise.create({
    lessonId: jsLesson1._id,
    title: 'Print Your Name',
    instructions: 'Use console.log() to print your name.',
    orderIndex: 0,
    starterCode: '// Print your name below\n',
    solution: 'console.log("Your Name");',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Your Name', isHidden: false },
    ],
    xpReward: 15,
  })

  await Quiz.create({
    lessonId: jsLesson1._id,
    title: 'Hello World Quiz',
    questions: [
      {
        id: uuidv4(),
        type: 'multiple-choice',
        question: 'Which function is used to print output in JavaScript?',
        options: ['print()', 'console.log()', 'echo()', 'output()'],
        correctIndex: 1,
        explanation: 'console.log() is the standard way to output data in JavaScript.',
        orderIndex: 0,
      },
      {
        id: uuidv4(),
        type: 'true-false',
        question: 'JavaScript is case-sensitive.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Yes, JavaScript distinguishes between uppercase and lowercase letters.',
        orderIndex: 1,
      },
    ],
    xpReward: 25,
  })

  await Lesson.create({
    sectionId: jsSection2._id,
    title: 'Variables',
    content: `# Variables in JavaScript

Variables are containers for storing data values.

## Declaring Variables

Use \`let\` for variables that can change:

\`\`\`javascript
let name = "Alice";
let age = 10;
\`\`\`

Use \`const\` for constants that don't change:

\`\`\`javascript
const PI = 3.14159;
\`\`\`

## Naming Rules

- Start with a letter, underscore, or dollar sign
- Can contain letters, digits, underscores
- Case-sensitive`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'standard',
    starterCode: '// Practice creating variables\n',
    xpReward: 10,
  })

  logger.info('Created JavaScript course with sections, lessons, exercises, and quizzes')

  // Python Course
  const pyCourse = await Course.create({
    title: 'Python Basics',
    description: 'Introduction to Python programming',
    language: 'python',
    status: 'published',
    createdBy: adminId,
  })

  const pySection1 = await Section.create({
    courseId: pyCourse._id,
    title: 'Python Introduction',
    description: 'Getting started with Python',
    orderIndex: 0,
  })

  const pyLesson1 = await Lesson.create({
    sectionId: pySection1._id,
    title: 'Hello Python',
    content: `# Hello Python

Python is a great first programming language!

## Printing Output

Use the \`print()\` function:

\`\`\`python
print("Hello, World!")
\`\`\`

## Python is Fun

- Easy to read and write
- No semicolons needed
- Indentation matters!`,
    orderIndex: 0,
    status: 'published',
    codeMode: 'text',
    editorComplexity: 'simplified',
    starterCode: '# Write your first Python code here\n',
    xpReward: 10,
  })

  await Exercise.create({
    lessonId: pyLesson1._id,
    title: 'Print Hello',
    instructions: 'Use print() to display "Hello, Python!"',
    orderIndex: 0,
    starterCode: '# Print Hello, Python!\n',
    solution: 'print("Hello, Python!")',
    testCases: [
      { id: uuidv4(), input: '', expectedOutput: 'Hello, Python!', isHidden: false },
    ],
    xpReward: 15,
  })

  logger.info('Created Python course with sections and lessons')

  return {
    javascript: jsCourse._id,
    python: pyCourse._id,
  }
}
