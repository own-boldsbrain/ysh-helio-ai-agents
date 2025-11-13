export interface SandboxConfig {
  teamId?: string
  projectId?: string
  token?: string
  timeout?: number
  ports?: number[]
  runtime?: string
  resources?: { vcpus?: number }
}

export interface SandboxResult {
  success: boolean
  sandbox?: any // Vercel Sandbox type
  domain?: string
  error?: string
}

export interface ISandboxProvider {
  create(config: SandboxConfig): Promise<SandboxResult>
  shutdown(sandbox: any): Promise<{ success: boolean; error?: string }>
  runCommand(sandbox: any, cmd: string, args?: string[]): Promise<{ success: boolean; output?: string; error?: string }>
}
