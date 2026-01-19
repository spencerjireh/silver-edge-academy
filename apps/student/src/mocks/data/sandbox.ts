import type { SandboxProject } from '@/types/student'

export const mockSandboxProjects: Record<string, SandboxProject[]> = {
  'student-1': [
    {
      id: 'sandbox-1',
      name: 'Calculator App',
      description: 'A simple calculator that can add, subtract, multiply, and divide numbers!',
      language: 'javascript',
      code: `// Calculator Functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return "Cannot divide by zero!";
  }
  return a / b;
}

// Test the calculator
console.log("5 + 3 =", add(5, 3));
console.log("10 - 4 =", subtract(10, 4));
console.log("6 * 7 =", multiply(6, 7));
console.log("20 / 4 =", divide(20, 4));`,
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2025-12-20T14:30:00Z',
    },
    {
      id: 'sandbox-2',
      name: 'Number Guessing Game',
      description: 'Try to guess the secret number!',
      language: 'javascript',
      code: `// Number Guessing Game
const secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function guess(number) {
  attempts++;
  if (number === secretNumber) {
    return "Correct! You got it in " + attempts + " tries!";
  } else if (number < secretNumber) {
    return "Too low! Try again.";
  } else {
    return "Too high! Try again.";
  }
}

// Try some guesses
console.log(guess(50));
console.log(guess(75));
console.log(guess(60));`,
      createdAt: '2025-12-10T08:00:00Z',
      updatedAt: '2025-12-10T08:00:00Z',
    },
    {
      id: 'sandbox-3',
      name: 'Drawing Fun',
      description: 'Drawing shapes with code!',
      language: 'javascript',
      code: `// Drawing shapes with console art
function drawSquare(size) {
  for (let i = 0; i < size; i++) {
    let row = "";
    for (let j = 0; j < size; j++) {
      row += "* ";
    }
    console.log(row);
  }
}

function drawTriangle(height) {
  for (let i = 1; i <= height; i++) {
    let row = "";
    for (let j = 0; j < i; j++) {
      row += "* ";
    }
    console.log(row);
  }
}

console.log("Square:");
drawSquare(4);
console.log("\\nTriangle:");
drawTriangle(5);`,
      createdAt: '2025-11-25T16:00:00Z',
      updatedAt: '2025-12-01T10:00:00Z',
    },
    {
      id: 'sandbox-python-1',
      name: 'Python Hello World',
      description: 'My first Python program!',
      language: 'python',
      code: `# Python Hello World
print("Hello, World!")
print("Welcome to Python!")

# Simple math
x = 5
y = 3
print(f"{x} + {y} = {x + y}")
print(f"{x} * {y} = {x * y}")

# A loop
for i in range(5):
    print(f"Count: {i}")`,
      createdAt: '2025-12-20T10:00:00Z',
      updatedAt: '2025-12-20T10:00:00Z',
    },
  ],
  'student-2': [
    {
      id: 'sandbox-4',
      name: 'Quiz App',
      description: 'A fun quiz application',
      language: 'python',
      code: `# Quiz Application
questions = [
    {"q": "What is 2 + 2?", "a": "4"},
    {"q": "What color is the sky?", "a": "blue"},
    {"q": "How many legs does a spider have?", "a": "8"}
]

score = 0
for question in questions:
    print(question["q"])
    # In a real app, we'd get user input
    print("Answer:", question["a"])
    score += 1

print(f"\\nYou got {score}/{len(questions)} correct!")`,
      createdAt: '2025-12-18T12:00:00Z',
      updatedAt: '2025-12-18T12:00:00Z',
    },
  ],
  'student-3': [],
}
