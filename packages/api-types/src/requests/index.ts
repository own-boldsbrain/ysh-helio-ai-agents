export interface CreateSandboxRequest {
  name: string
  environment: 'nodejs' | 'python' | 'ruby' | 'java'
  diskSize?: number
  memorySize?: number
}

export interface ExecuteTaskRequest {
  sandboxId: string
  command: string
  timeout?: number
  cwd?: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  sandboxId: string
  command: string
}