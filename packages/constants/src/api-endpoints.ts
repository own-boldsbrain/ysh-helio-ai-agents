export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CALLBACK: '/api/auth/callback',
    SESSION: '/api/auth/session',
  },

  // Sandboxes
  SANDBOXES: {
    LIST: '/api/sandboxes',
    CREATE: '/api/sandboxes',
    GET: (id: string) => `/api/sandboxes/${id}`,
    DELETE: (id: string) => `/api/sandboxes/${id}`,
    EXECUTE: (id: string) => `/api/sandboxes/${id}/execute`,
  },

  // Tasks
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET: (id: string) => `/api/tasks/${id}`,
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
  },
} as const
