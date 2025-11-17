// Sandbox provider system with multi-cloud support
import { getDefaultSandboxProvider } from './providers'

import type { SandboxConfig } from './providers'

/**
 * Adapter wrapper around underlying provider sandbox objects to provide
 * a compatibile interface similar to the Vercel SDK that existing code expects.
 */
export class Sandbox {
  private provider = getDefaultSandboxProvider()
  private providerSandbox: any
  sandboxId?: string
  domainUrl?: string

  private constructor(providerSandbox: any, domain?: string) {
    this.providerSandbox = providerSandbox
    this.sandboxId = providerSandbox?.sandboxId || providerSandbox?.id || undefined
    this.domainUrl = domain
  }

  /**
   * Create a sandbox using the configured provider and return a sandbox adapter
   */
  static async create(config: SandboxConfig): Promise<Sandbox> {
    const provider = getDefaultSandboxProvider()
    const result = await provider.create(config)
    if (!result.success || !result.sandbox) {
      throw new Error(result.error || 'Failed to create sandbox')
    }

    const adapter = new Sandbox(result.sandbox, result.domain)
    return adapter
  }

  // Allow reconnecting to existing sandbox if provider supports it
  static async get(options: {
    sandboxId: string
    teamId?: string
    projectId?: string
    token?: string
  }): Promise<Sandbox | null> {
    const provider = getDefaultSandboxProvider()
    // If provider implements get(), use it
    if ((provider as any).get) {
      try {
        const result = await (provider as any).get(options)
        if (result) {
          return new Sandbox(result.sandbox || result, result.domain)
        }
      } catch {
        // ignore
      }
    }
    // fallback: not supported
    return null
  }

  // Backward compatible runCommand signature
  async runCommand(commandOrOptions: any, args?: string[]) {
    // Support both shapes: runCommand(cmd, args) or runCommand({cmd, args, cwd, env, detached, stdout, stderr})
    let cmd: string
    let argv: string[] | undefined

    if (typeof commandOrOptions === 'string') {
      cmd = commandOrOptions
      argv = args
    } else if (typeof commandOrOptions === 'object' && commandOrOptions.cmd) {
      cmd = commandOrOptions.cmd
      argv = commandOrOptions.args || []
    } else {
      throw new Error('Invalid runCommand arguments')
    }

    const provider = getDefaultSandboxProvider()
    const result = await provider.runCommand(this.providerSandbox, cmd, argv)

    // Normalize result to Vercel-like SDK style used by the repo
    const stdoutFn = async () => result.output || ''
    const stderrFn = async () => result.error || ''
    const exitCode = result.success ? 0 : 1

    return {
      stdout: stdoutFn,
      stderr: stderrFn,
      exitCode,
      success: result.success,
    }
  }

  async stop(): Promise<void> {
    try {
      const provider = getDefaultSandboxProvider()
      await provider.shutdown(this.providerSandbox)
    } catch {
      // best effort
    }
  }

  domain(port?: number): string {
    if (this.domainUrl) return this.domainUrl
    const p = port || 3000
    return `localhost:${p}`
  }
}

// Export types for compatibility
// Export type alias for the local Sandbox wrapper to allow other modules to import the Sandbox type
// Export the local Sandbox type alias for existing modules
export type SandboxType = Sandbox
