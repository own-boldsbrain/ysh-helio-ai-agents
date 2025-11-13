import { Sandbox } from '@vercel/sandbox'

import { ISandboxProvider, SandboxConfig, SandboxResult } from './sandbox-provider'

export class VercelSandboxProvider implements ISandboxProvider {
  async create(config: SandboxConfig): Promise<SandboxResult> {
    try {
      if (!config.teamId || !config.projectId || !config.token) {
        throw new Error('Missing required config: teamId, projectId, token')
      }
      const sandbox = await Sandbox.create({
        teamId: config.teamId,
        projectId: config.projectId,
        token: config.token,
        timeout: config.timeout,
        ports: config.ports,
        runtime: config.runtime,
        resources: config.resources?.vcpus ? { vcpus: config.resources.vcpus } : undefined,
      })
      return {
        success: true,
        sandbox,
        domain: sandbox.domain(config.ports?.[0] || 3000),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async shutdown(sandbox: any): Promise<{ success: boolean; error?: string }> {
    // Vercel sandboxes auto-shutdown, but we can try to kill processes
    try {
      await sandbox.runCommand({ cmd: 'pkill', args: ['-f', 'node'] })
      await sandbox.runCommand({ cmd: 'pkill', args: ['-f', 'python'] })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Shutdown failed',
      }
    }
  }

  async runCommand(
    sandbox: any,
    cmd: string,
    args?: string[],
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      const result = await sandbox.runCommand({ cmd, args })
      return {
        success: result.success,
        output: result.output,
        error: result.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Command failed',
      }
    }
  }
}
