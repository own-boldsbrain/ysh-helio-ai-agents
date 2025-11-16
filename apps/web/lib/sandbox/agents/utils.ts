import { redactSensitiveInfo } from '@/lib/utils/logging'
import { TaskLogger } from '@/lib/utils/task-logger'

import type { Sandbox } from '@vercel/sandbox'

export interface CommandResult {
  success: boolean
  output: string
  error?: string
  exitCode?: number
}

export interface CommandOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  cwd?: string
  env?: Record<string, string>
}

export class SafeCommandExecutor {
  constructor(
    protected sandbox: Sandbox,
    protected logger: TaskLogger,
  ) {}

  /**
   * Execute a command safely, avoiding shell injection
   */
  async executeSafe(command: string, args: string[] = [], options: CommandOptions = {}): Promise<CommandResult> {
    const { timeout = 30000, retries = 0, retryDelay = 1000, cwd, env } = options

    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command
    const redactedCommand = redactSensitiveInfo(fullCommand)

    await this.logger.command(redactedCommand)

    let lastError: string | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          await this.logger.info(`Retry attempt ${attempt}/${retries}`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }

        // Use sandbox.runCommand with proper argument separation to avoid shell injection
        // Since sandbox.runCommand expects a single command string, we build it safely
        const safeCommand =
          args.length > 0 ? `${command} ${args.map((arg) => `'${arg.replace(/'/g, "'\"'\"'")}'`).join(' ')}` : command
        const result = await this.sandbox.runCommand(safeCommand)

        const output = (await result.output?.())?.trim() || ''
        const redactedOutput = redactSensitiveInfo(output)

        if (result.exitCode === 0) {
          await this.logger.info(redactedOutput || 'Command executed successfully')
          return {
            success: true,
            output: redactedOutput,
          }
        } else {
          const error = (await result.output?.('stderr')) || 'Command failed'
          const redactedError = redactSensitiveInfo(error)
          await this.logger.error(redactedError)
          lastError = redactedError

          // Don't retry on the last attempt
          if (attempt === retries) {
            return {
              success: false,
              output: redactedOutput,
              error: redactedError,
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        const redactedError = redactSensitiveInfo(errorMsg)
        await this.logger.error(`Command execution error: ${redactedError}`)
        lastError = redactedError

        if (attempt === retries) {
          return {
            success: false,
            output: '',
            error: redactedError,
          }
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      output: '',
      error: lastError || 'Unknown error after retries',
    }
  }

  /**
   * Execute a shell script safely by writing it to a file first
   */
  async executeScript(script: string, options: CommandOptions = {}): Promise<CommandResult> {
    // Generate a unique script name to avoid conflicts
    const scriptName = `script_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.sh`

    // Write script to file
    const writeResult = await this.executeSafe('sh', ['-c', `cat > /tmp/${scriptName} << 'EOF'\n${script}\nEOF`])

    if (!writeResult.success) {
      return writeResult
    }

    // Make script executable
    const chmodResult = await this.executeSafe('chmod', ['+x', `/tmp/${scriptName}`])

    if (!chmodResult.success) {
      return chmodResult
    }

    // Execute script
    const execResult = await this.executeSafe('/tmp/${scriptName}', [], options)

    // Clean up script file
    await this.executeSafe('rm', ['-f', `/tmp/${scriptName}`])

    return execResult
  }
}

// Mock executor for testing
export class MockCommandExecutor extends SafeCommandExecutor {
  private readonly mockResults: Map<string, CommandResult> = new Map()

  setMockResult(command: string, result: CommandResult) {
    this.mockResults.set(command, result)
  }

  async executeSafe(command: string, args: string[] = [], options: CommandOptions = {}): Promise<CommandResult> {
    const fullCommand = `${command} ${args.join(' ')}`
    const mockResult = this.mockResults.get(fullCommand)

    if (mockResult) {
      await this.logger.info(`[MOCK] ${redactSensitiveInfo(fullCommand)}`)
      if (mockResult.success) {
        await this.logger.info(mockResult.output)
      } else {
        await this.logger.error(mockResult.error || 'Mock command failed')
      }
      return mockResult
    }

    // Fall back to real execution if no mock
    return super.executeSafe(command, args, options)
  }
}
