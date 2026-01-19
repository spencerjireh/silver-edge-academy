import type { LessonContent, StudentExercise, StudentQuiz, QuizQuestion } from '@/types/student'

export const mockLessonContent: Record<string, LessonContent> = {
  'lesson-12': {
    id: 'lesson-12',
    title: 'While Loops',
    sectionTitle: 'Loops',
    sectionId: 'section-3',
    courseId: 'course-js-basics',
    content: `# Understanding While Loops

While loops help us repeat code as long as a condition is true. They're perfect when we don't know exactly how many times we need to repeat something!

## How While Loops Work

A while loop checks a condition before each repetition:

\`\`\`javascript
let count = 0;
while (count < 5) {
  console.log("Count is: " + count);
  count++;
}
\`\`\`

This will output:
- Count is: 0
- Count is: 1
- Count is: 2
- Count is: 3
- Count is: 4

## Be Careful!

If the condition never becomes false, the loop runs forever! This is called an **infinite loop** and can crash your program.

\`\`\`javascript
// DON'T DO THIS! Infinite loop!
while (true) {
  console.log("This never stops!");
}
\`\`\`

## When to Use While Loops

Use while loops when:
- You don't know how many times to repeat
- You want to repeat until something specific happens
- User input determines when to stop

## Practice Time!

In the next exercise, you'll write your own while loop to count down from 10 to 1. Let's go!`,
    codeMode: 'text',
    starterCode: '// Write your while loop here\n',
    xpReward: 10,
    steps: [
      { type: 'content', id: 'content-1', title: 'Learn about While Loops', completed: true },
      { type: 'exercise', id: 'exercise-1', title: 'Countdown Exercise', completed: false },
      { type: 'quiz', id: 'quiz-1', title: 'While Loops Quiz', completed: false },
    ],
    currentStepIndex: 1,
  },
  'lesson-11': {
    id: 'lesson-11',
    title: 'For Loops',
    sectionTitle: 'Loops',
    sectionId: 'section-3',
    courseId: 'course-js-basics',
    content: `# For Loops

For loops are perfect when you know exactly how many times you want to repeat something.

## Basic For Loop

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log("Hello #" + i);
}
\`\`\`

The for loop has three parts:
1. **Initialization**: \`let i = 0\` - where to start
2. **Condition**: \`i < 5\` - when to stop
3. **Update**: \`i++\` - how to change after each loop

## Looping Through Arrays

For loops are great for going through lists:

\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];
for (let i = 0; i < fruits.length; i++) {
  console.log("I like " + fruits[i]);
}
\`\`\`

Now it's your turn to practice!`,
    codeMode: 'text',
    starterCode: '// Your code here\n',
    xpReward: 10,
    steps: [
      { type: 'content', id: 'content-1', title: 'Learn about For Loops', completed: true },
      { type: 'exercise', id: 'exercise-2', title: 'Print Numbers Exercise', completed: true },
      { type: 'quiz', id: 'quiz-2', title: 'For Loops Quiz', completed: true },
    ],
    currentStepIndex: 2,
  },
}

export const mockExercises: Record<string, StudentExercise> = {
  'exercise-1': {
    id: 'exercise-1',
    lessonId: 'lesson-12',
    title: 'Countdown Exercise',
    instructions: `## Countdown from 10 to 1

Write a while loop that counts down from 10 to 1, printing each number.

**Expected output:**
\`\`\`
10
9
8
7
6
5
4
3
2
1
\`\`\`

**Hints:**
- Start with a variable set to 10
- Use while loop to check if the number is greater than 0
- Print the number inside the loop
- Decrease the number by 1 each time`,
    starterCode: `// Start with a number variable
let number = 10;

// Write your while loop here
`,
    xpReward: 15,
    orderIndex: 0,
  },
  'exercise-2': {
    id: 'exercise-2',
    lessonId: 'lesson-11',
    title: 'Print Numbers Exercise',
    instructions: `## Print Numbers 1 to 5

Write a for loop that prints numbers from 1 to 5.

**Expected output:**
\`\`\`
1
2
3
4
5
\`\`\``,
    starterCode: `// Write your for loop here
`,
    xpReward: 15,
    orderIndex: 0,
  },
}

export const mockQuizzes: Record<string, StudentQuiz> = {
  'quiz-1': {
    id: 'quiz-1',
    lessonId: 'lesson-12',
    title: 'While Loops Quiz',
    description: 'Test your knowledge of while loops!',
    questionCount: 5,
    xpReward: 25,
    maxAttempts: 3,
    currentAttempt: 0,
  },
}

export const mockQuizQuestions: Record<string, QuizQuestion[]> = {
  'quiz-1': [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What keyword starts a while loop in JavaScript?',
      options: ['for', 'while', 'loop', 'repeat'],
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'A while loop can run forever if the condition never becomes false.',
      options: ['True', 'False'],
    },
    {
      id: 'q3',
      type: 'code-output',
      question: 'What does this code output?',
      codeSnippet: `let x = 0;
while (x < 3) {
  console.log(x);
  x++;
}`,
      options: ['0 1 2', '0 1 2 3', '1 2 3', '1 2'],
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'When should you use a while loop instead of a for loop?',
      options: [
        'When you know exactly how many times to loop',
        'When you don\'t know how many times to loop',
        'Never, always use for loops',
        'Only for counting numbers',
      ],
    },
    {
      id: 'q5',
      type: 'code-output',
      question: 'How many times does this loop run?',
      codeSnippet: `let count = 5;
while (count > 0) {
  count--;
}`,
      options: ['4 times', '5 times', '6 times', 'Forever'],
    },
  ],
}

// Correct answers for quizzes (used for grading)
export const mockQuizAnswers: Record<string, number[]> = {
  'quiz-1': [1, 0, 0, 1, 1], // Index of correct option for each question
}
