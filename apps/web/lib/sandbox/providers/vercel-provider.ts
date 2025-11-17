import { ISandboxProvider, SandboxConfig, SandboxResult } from './sandbox-provider'

/**
 * Vercel Sandbox Provider (DEPRECATED)
 * This provider is no longer supported after removing @vercel/sandbox dependency.
 * Use DockerSandboxProvider instead.
 */
export class VercelSandboxProvider implements ISandboxProvider {
  async create(_config: SandboxConfig): Promise<SandboxResult> {
    return {
      success: false,
      error: 'Vercel Sandbox provider is no longer supported. Use Docker provider instead.',
    }
  }

  async shutdown(_sandbox: any): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error: 'Vercel Sandbox provider is no longer supported',
    }
  }

  async runCommand(
    _sandbox: any,
    _cmd: string,
    _args?: string[],
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return {
      success: false,
      error: 'Vercel Sandbox provider is no longer supported',
    }
  }
}
