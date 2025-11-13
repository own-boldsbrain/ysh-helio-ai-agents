import { SandboxType as Sandbox } from '@/lib/sandbox'
import { AgentExecutionResult } from './index'
import { SafeCommandExecutor } from './utils'

export async function executeDeepSeekInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: { info: (msg: string) => Promise<void>; error: (msg: string) => Promise<void> },
  selectedModel?: string,
  mcpServers?: any,
): Promise<AgentExecutionResult> {
  // Create a simple logger wrapper that implements the required TaskLogger methods
  const taskLogger = {
    info: logger.info,
    error: logger.error,
    command: logger.info, // Map command to info
    success: logger.info, // Map success to info
    updateProgress: async (progress: number, message: string) => {
      await logger.info(`${progress}%: ${message}`)
    },
    // Stub methods that aren't used by SafeCommandExecutor
    append: async () => {},
    updateStatus: async () => {},
  }

  const safeExecutor = new SafeCommandExecutor(sandbox, taskLogger as any)
  const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434'
  const model = selectedModel || 'deepseek-coder:6.7b'

  await logger.info('Using DeepSeek model')

  const pythonScript = `import requests
import json
import sys

ollama_host = "${ollamaHost}"
model = "${model}"

prompt = sys.argv[1] if len(sys.argv) > 1 else "Hello"

response = requests.post(
    f"{ollama_host}/api/generate",
    json={"model": model, "prompt": prompt, "stream": False}
)

if response.status_code == 200:
    result = response.json()
    print(result.get("response", ""))
else:
    print(f"Error: {response.status_code}", file=sys.stderr)
    sys.exit(1)`

  await safeExecutor.executeSafe('sh', ['-c', `echo '${pythonScript}' > /tmp/deepseek_ollama.py`])

  const safeInstruction = instruction.replaceAll('"', String.raw`\"`)
  const result = await safeExecutor.executeSafe('python3', ['/tmp/deepseek_ollama.py', safeInstruction])

  return {
    success: result.success,
    changesDetected: (result.output?.length || 0) > 0,
    agentResponse: result.output,
    error: result.success ? undefined : result.error,
  }
}
