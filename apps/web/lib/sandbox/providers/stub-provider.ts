import { ISandboxProvider, SandboxConfig, SandboxResult } from './sandbox-provider'

export class StubSandboxProvider implements ISandboxProvider {
  async create(config: SandboxConfig): Promise<SandboxResult> {
    // Stub implementation - simulates sandbox creation without actual resources
    console.log('StubSandboxProvider: Creating sandbox (simulated)')
    return {
      success: true,
      sandbox: {
        id: `stub-${Date.now()}`,
        domain: (port: number) => `stub-sandbox.local:${port}`,
        runCommand: async (command: string) => {
          console.log(`StubSandboxProvider: Running command: ${command}`)
          return { success: true, output: 'Stub command executed' }
        },
        shutdown: async () => {
          console.log('StubSandboxProvider: Shutting down sandbox')
        },
      },
      domain: `stub-sandbox.local:${config.ports?.[0] || 3000}`,
    }
  }

  async shutdown(sandbox: any): Promise<{ success: boolean; error?: string }> {
    console.log(`StubSandboxProvider: Shutting down sandbox ${sandbox.id || sandbox}`)
    return { success: true }
  }

  async runCommand(
    sandbox: any,
    cmd: string,
    args?: string[],
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    const fullCommand = args && args.length > 0 ? `${cmd} ${args.join(' ')}` : cmd
    console.log(`StubSandboxProvider: Running command in ${sandbox.id || sandbox}: ${fullCommand}`)
    return { success: true, output: 'Stub command output' }
  }
}
