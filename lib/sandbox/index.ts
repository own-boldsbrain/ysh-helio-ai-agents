/**
 * Sandbox abstraction layer
 * Supports both Vercel Sandbox and Docker implementations
 */

export interface CommandResult {
  success: boolean
  output: string
  error?: string
}

export interface SandboxType {
  sandboxId: string
  domain?: string

  // Command execution
  runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult>

  // Lifecycle management
  stop(): Promise<void>
}

export interface SandboxCreateOptions {
  teamId?: string
  projectId?: string
  token?: string
  source?: {
    type: 'git'
    url: string
    revision?: string
    depth?: number
  }
  timeout?: number
  ports?: number[]
  runtime?: string
  resources?: {
    vcpus?: number
  }
}

export interface SandboxGetOptions {
  sandboxId: string
  teamId?: string
  projectId?: string
  token?: string
}

/**
 * Base Sandbox interface that both implementations must follow
 */
export abstract class Sandbox implements SandboxType {
  abstract sandboxId: string
  abstract domain?: string

  abstract runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult>

  abstract stop(): Promise<void>

  static async create(options: SandboxCreateOptions): Promise<SandboxType> {
    const provider = process.env.SANDBOX_PROVIDER || 'docker'

    if (provider === 'docker') {
      const { DockerSandbox } = await import('./docker-sandbox')
      return DockerSandbox.create(options)
    } else {
      throw new Error('Only Docker sandbox provider is supported. Set SANDBOX_PROVIDER=docker in your environment.')
    }
  }

  static async get(options: SandboxGetOptions): Promise<SandboxType> {
    const provider = process.env.SANDBOX_PROVIDER || 'docker'

    if (provider === 'docker') {
      const { DockerSandbox } = await import('./docker-sandbox')
      return DockerSandbox.get(options)
    } else {
      throw new Error('Only Docker sandbox provider is supported. Set SANDBOX_PROVIDER=docker in your environment.')
    }
  }
}
