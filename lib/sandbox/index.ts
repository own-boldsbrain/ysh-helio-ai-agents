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
    const provider = process.env.SANDBOX_PROVIDER || 'vercel'

    if (provider === 'docker') {
      const { DockerSandbox } = await import('./docker-sandbox')
      return DockerSandbox.create(options)
    } else {
      // Fallback to Vercel Sandbox
      const { Sandbox: VercelSandbox } = await import('@vercel/sandbox')
      return VercelSandbox.create({
        teamId: options.teamId!,
        projectId: options.projectId!,
        token: options.token!,
        source: options.source,
        timeout: options.timeout,
        ports: options.ports,
        runtime: options.runtime,
        resources: options.resources,
      }) as unknown as SandboxType
    }
  }

  static async get(options: SandboxGetOptions): Promise<SandboxType> {
    const provider = process.env.SANDBOX_PROVIDER || 'vercel'

    if (provider === 'docker') {
      const { DockerSandbox } = await import('./docker-sandbox')
      return DockerSandbox.get(options)
    } else {
      // Fallback to Vercel Sandbox
      const { Sandbox: VercelSandbox } = await import('@vercel/sandbox')
      return VercelSandbox.get({
        sandboxId: options.sandboxId,
        teamId: options.teamId!,
        projectId: options.projectId!,
        token: options.token!,
      }) as unknown as SandboxType
    }
  }
}
