import type { StudentHelpRequest } from '@/types/student'

export const mockHelpRequests: Record<string, StudentHelpRequest[]> = {
  'student-1': [
    {
      id: 'help-1',
      lessonId: 'lesson-11',
      lessonTitle: 'For Loops',
      exerciseId: 'exercise-2',
      exerciseTitle: 'Print Numbers Exercise',
      message: "I don't understand why my loop runs forever. I expected it to stop after 10 times.",
      codeSnapshot: `for (let i = 0; i < 10; i--) {
  console.log(i);
}`,
      status: 'resolved',
      response: `Great question! The issue is in your loop condition.

Your code has:
\`\`\`javascript
for (let i = 0; i < 10; i--) {
  console.log(i);
}
\`\`\`

Notice \`i--\` at the end? This makes \`i\` go DOWN each time. You want \`i++\` to make it go UP!

Try changing it and let me know if you need more help!`,
      teacherName: 'Ms. Santos',
      respondedAt: '2025-12-14T10:30:00Z',
      createdAt: '2025-12-14T09:00:00Z',
    },
  ],
  'student-2': [],
  'student-3': [
    {
      id: 'help-2',
      lessonId: 'py-lesson-3',
      lessonTitle: 'Variables in Python',
      message: 'How do I make a variable that holds my name?',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ],
}

// Track pending help request per student (only one allowed at a time)
export const mockPendingHelpRequestIds: Record<string, string | null> = {
  'student-1': null,
  'student-2': null,
  'student-3': 'help-2',
}
