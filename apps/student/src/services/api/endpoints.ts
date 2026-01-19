/**
 * Centralized API endpoint definitions for the student frontend.
 * All endpoints are relative to the API_BASE (/api/student).
 */
export const STUDENT_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },

  dashboard: '/dashboard',

  courses: {
    list: '/courses',
    detail: (id: string) => `/courses/${id}`,
  },

  lessons: {
    detail: (id: string) => `/lessons/${id}`,
    complete: (id: string) => `/lessons/${id}/complete`,
  },

  exercises: {
    detail: (id: string) => `/exercises/${id}`,
    submit: (id: string) => `/exercises/${id}/submit`,
  },

  quizzes: {
    detail: (id: string) => `/quizzes/${id}`,
    submit: (id: string) => `/quizzes/${id}/submit`,
  },

  badges: '/badges',

  xpHistory: '/xp-history',

  shop: {
    items: '/shop/items',
    inventory: '/shop/inventory',
    purchase: '/shop/purchase',
    equip: '/shop/equip',
  },

  sandbox: {
    list: '/sandbox/projects',
    detail: (id: string) => `/sandbox/projects/${id}`,
    create: '/sandbox/projects',
  },

  helpRequests: {
    list: '/help-requests',
    detail: (id: string) => `/help-requests/${id}`,
    create: '/help-requests',
  },

  profile: '/profile',

  notifications: {
    list: '/notifications',
    detail: (id: string) => `/notifications/${id}`,
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
} as const
