export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  githubId: string
  createdAt: Date
  updatedAt: Date
}

export interface Sandbox {
  id: string
  userId: string
  name: string
  status: 'creating' | 'active' | 'inactive' | 'failed'
  environment: 'nodejs' | 'python' | 'ruby' | 'java'
  createdAt: Date
  expiresAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  sandboxId: string
  createdAt: Date
  updatedAt: Date
}