// Sandbox provider system with multi-cloud support
import { getDefaultSandboxProvider } from './providers'

import type { SandboxConfig, SandboxResult } from './providers'

// Compatibility layer - maintains existing API while using new provider system
export class Sandbox {
  private provider = getDefaultSandboxProvider()
  private readonly currentSandbox?: any

  static async create(config: SandboxConfig): Promise<SandboxResult> {
    const provider = getDefaultSandboxProvider()
    return await provider.create(config)
  }

  // For backward compatibility with existing code
  async runCommand(command: string) {
    if (!this.currentSandbox) {
      throw new Error('Sandbox not created')
    }
    return await this.provider.runCommand(this.currentSandbox.id, command)
  }

  async shutdown() {
    if (this.currentSandbox) {
      await this.provider.shutdown(this.currentSandbox.id)
    }
  }

  domain(port: number) {
    return this.currentSandbox?.domain(port) || `localhost:${port}`
  }
}

// Export types for compatibility
export type { Sandbox as SandboxType } from '@vercel/sandbox'
