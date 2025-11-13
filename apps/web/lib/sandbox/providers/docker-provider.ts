import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { ISandboxProvider, SandboxConfig, SandboxResult } from './sandbox-provider'

const execAsync = promisify(exec)

export class DockerSandboxProvider implements ISandboxProvider {
  private readonly runningContainers = new Set<string>()

  async create(config: SandboxConfig): Promise<SandboxResult> {
    try {
      // Create a simple Node.js container for code execution
      const containerName = `sandbox-${Date.now()}`
      const image = 'node:18-alpine'
      const port = config.ports?.[0] || 3000

      // Run Docker container
      const runCommand = `docker run -d --name ${containerName} -p ${port}:3000 ${image} sh -c "while true; do sleep 1; done"`
      await execAsync(runCommand)

      this.runningContainers.add(containerName)

      return {
        success: true,
        sandbox: {
          id: containerName,
          domain: (p: number) => `localhost:${p}`,
          runCommand: async (cmd: string) => {
            try {
              const { stdout } = await execAsync(`docker exec ${containerName} sh -c "${cmd}"`)
              return { success: true, output: stdout }
            } catch (error) {
              return { success: false, output: error instanceof Error ? error.message : 'Command failed' }
            }
          },
          shutdown: async () => {
            await this.shutdown(containerName)
          },
        },
        domain: `localhost:${port}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Docker sandbox',
      }
    }
  }

  async shutdown(sandbox: any): Promise<{ success: boolean; error?: string }> {
    try {
      const sandboxId = sandbox.id || sandbox
      await execAsync(`docker stop ${sandboxId}`)
      await execAsync(`docker rm ${sandboxId}`)
      this.runningContainers.delete(sandboxId)
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMsg }
    }
  }

  async runCommand(
    sandbox: any,
    cmd: string,
    args?: string[],
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      const sandboxId = sandbox.id || sandbox
      const fullCommand = args && args.length > 0 ? `${cmd} ${args.join(' ')}` : cmd
      const { stdout } = await execAsync(`docker exec ${sandboxId} sh -c "${fullCommand}"`)
      return { success: true, output: stdout }
    } catch (error) {
      return { success: false, output: '', error: error instanceof Error ? error.message : 'Command failed' }
    }
  }
}
