/**
 * Docker-based Sandbox implementation
 * Provides local sandbox environments using Docker containers
 * Features:
 * - Persistent volumes for project data
 * - Resource usage metrics (CPU, memory, disk)
 * - Docker layer caching for faster builds
 * - Support for specialized images
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import type { SandboxType, SandboxCreateOptions, SandboxGetOptions, CommandResult } from './index'

const execAsync = promisify(exec)

// Store active containers in memory
const activeContainers = new Map<string, DockerSandbox>()

export interface ResourceMetrics {
  cpu: number // CPU usage percentage
  memory: number // Memory usage in MB
  memoryLimit: number // Memory limit in MB
  diskUsage: number // Disk usage in MB
  networkRx: number // Network received in bytes
  networkTx: number // Network transmitted in bytes
}

export class DockerSandbox implements SandboxType {
  sandboxId: string
  domain?: string
  private containerId?: string
  private ports: number[]
  private projectDir = '/workspace/project'
  private volumeName?: string

  constructor(sandboxId: string, containerId?: string, ports: number[] = [3000], volumeName?: string) {
    this.sandboxId = sandboxId
    this.containerId = containerId
    this.ports = ports
    this.volumeName = volumeName
    this.domain = `localhost:${ports[0]}`
  }

  static async create(options: SandboxCreateOptions): Promise<DockerSandbox> {
    const sandboxId = `sandbox-${randomBytes(8).toString('hex')}`
    const ports = options.ports || [3000]
    
    // Create persistent volume for project data
    const volumeName = `${sandboxId}-data`
    try {
      await execAsync(`docker volume create ${volumeName}`)
    } catch (error) {
      console.error('Failed to create volume:', error)
    }
    
    // Build port mappings for Docker
    const portMappings = ports.map(p => `-p ${p}:${p}`).join(' ')
    
    // Prepare environment variables
    const envVars: string[] = []
    if (options.source) {
      envVars.push(`-e GIT_URL=${options.source.url}`)
      if (options.source.revision) {
        envVars.push(`-e GIT_BRANCH=${options.source.revision}`)
      }
      if (options.source.depth) {
        envVars.push(`-e GIT_DEPTH=${options.source.depth}`)
      }
    }
    
    // Add resource limits
    const memoryLimit = process.env.SANDBOX_MEMORY_LIMIT || '2g'
    const cpuLimit = process.env.SANDBOX_CPU_LIMIT || '2'
    const resourceLimits = `--memory=${memoryLimit} --cpus=${cpuLimit}`
    
    // Create and start container
    const dockerImage = process.env.SANDBOX_DOCKER_IMAGE || 'coding-agent-sandbox:latest'
    const networkName = process.env.DOCKER_NETWORK || 'coding-agent-network'
    
    try {
      // Ensure network exists
      try {
        await execAsync(`docker network inspect ${networkName}`)
      } catch {
        await execAsync(`docker network create ${networkName}`)
      }
      
      // Run container with volume mount and resource limits
      let finalCommand = `docker run -d --name ${sandboxId} --network ${networkName} ${portMappings} ${resourceLimits} -v ${volumeName}:/workspace ${envVars.join(' ')} ${dockerImage}`
      
      if (options.source) {
        // Add init script to clone repo
        finalCommand += ` /bin/sh -c "git clone --depth ${options.source.depth || 1} -b ${options.source.revision || 'main'} ${options.source.url} /workspace/project && tail -f /dev/null"`
      } else {
        finalCommand += ' tail -f /dev/null'
      }
      
      const { stdout } = await execAsync(finalCommand)
      const containerId = stdout.trim()
      
      const sandbox = new DockerSandbox(sandboxId, containerId, ports, volumeName)
      activeContainers.set(sandboxId, sandbox)
      
      return sandbox
    } catch (error) {
      // Cleanup volume on failure
      try {
        await execAsync(`docker volume rm ${volumeName}`)
      } catch {}
      throw new Error(`Failed to create Docker sandbox: ${error}`)
    }
  }

  static async get(options: SandboxGetOptions): Promise<DockerSandbox> {
    // Check if already in memory
    const existing = activeContainers.get(options.sandboxId)
    if (existing) {
      return existing
    }
    
    // Try to find existing container
    try {
      const { stdout } = await execAsync(`docker ps -q -f name=${options.sandboxId}`)
      const containerId = stdout.trim()
      
      if (!containerId) {
        throw new Error(`Container ${options.sandboxId} not found`)
      }
      
      // Get port mappings
      const { stdout: portsOut } = await execAsync(
        `docker inspect --format='{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} {{end}}' ${containerId}`
      )
      const ports = portsOut
        .split(' ')
        .filter(p => p.includes('tcp'))
        .map(p => parseInt(p.split('/')[0]))
        .filter(p => !isNaN(p))
      
      const sandbox = new DockerSandbox(options.sandboxId, containerId, ports.length > 0 ? ports : [3000])
      activeContainers.set(options.sandboxId, sandbox)
      
      return sandbox
    } catch (error) {
      throw new Error(`Failed to get Docker sandbox: ${error}`)
    }
  }

  async runCommand(options: { cmd: string; args: string[]; cwd?: string }): Promise<CommandResult> {
    if (!this.containerId) {
      return {
        success: false,
        output: '',
        error: 'Container not initialized'
      }
    }
    
    const workDir = options.cwd || this.projectDir
    const fullCommand = [options.cmd, ...options.args].join(' ')
    const escapedCommand = fullCommand.replace(/"/g, '\\"')
    
    try {
      const { stdout, stderr } = await execAsync(
        `docker exec -w ${workDir} ${this.containerId} /bin/sh -c "${escapedCommand}"`
      )
      
      return {
        success: true,
        output: stdout || stderr || ''
      }
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string; message?: string }
      return {
        success: false,
        output: err.stdout || '',
        error: err.stderr || err.message || 'Command execution failed'
      }
    }
  }

  async stop(): Promise<void> {
    if (!this.containerId) {
      return
    }
    
    try {
      // Stop and remove container
      await execAsync(`docker stop ${this.containerId}`)
      await execAsync(`docker rm ${this.containerId}`)
      
      // Optionally remove volume (configurable)
      const keepVolume = process.env.SANDBOX_KEEP_VOLUME === 'true'
      if (!keepVolume && this.volumeName) {
        await execAsync(`docker volume rm ${this.volumeName}`)
      }
      
      // Remove from active containers
      activeContainers.delete(this.sandboxId)
    } catch (error) {
      console.error('Failed to stop container')
    }
  }

  /**
   * Get resource usage metrics for the container
   */
  async getMetrics(): Promise<ResourceMetrics> {
    if (!this.containerId) {
      throw new Error('Container not initialized')
    }

    try {
      // Get container stats (single snapshot)
      const { stdout } = await execAsync(
        `docker stats ${this.containerId} --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.NetIO}}"`
      )

      const [cpuStr, memStr, netStr] = stdout.trim().split(',')

      // Parse CPU percentage (e.g., "12.34%" -> 12.34)
      const cpu = Number.parseFloat(cpuStr.replace('%', ''))

      // Parse memory usage (e.g., "123.4MiB / 2GiB" -> usage: 123.4, limit: 2048)
      const memMatch = memStr.match(/(\d+\.?\d*)(MiB|GiB)\s*\/\s*(\d+\.?\d*)(MiB|GiB)/)
      let memory = 0
      let memoryLimit = 0
      if (memMatch) {
        const [, usageVal, usageUnit, limitVal, limitUnit] = memMatch
        memory = usageUnit === 'GiB' ? Number.parseFloat(usageVal) * 1024 : Number.parseFloat(usageVal)
        memoryLimit = limitUnit === 'GiB' ? Number.parseFloat(limitVal) * 1024 : Number.parseFloat(limitVal)
      }

      // Parse network I/O (e.g., "1.2kB / 3.4kB" -> rx: 1228.8, tx: 3481.6)
      const netMatch = netStr.match(/(\d+\.?\d*)(B|kB|MB|GB)\s*\/\s*(\d+\.?\d*)(B|kB|MB|GB)/)
      let networkRx = 0
      let networkTx = 0
      if (netMatch) {
        const [, rxVal, rxUnit, txVal, txUnit] = netMatch
        const unitMultiplier = { B: 1, kB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 }
        networkRx = Number.parseFloat(rxVal) * (unitMultiplier[rxUnit as keyof typeof unitMultiplier] || 1)
        networkTx = Number.parseFloat(txVal) * (unitMultiplier[txUnit as keyof typeof unitMultiplier] || 1)
      }

      // Get disk usage for the volume
      let diskUsage = 0
      if (this.volumeName) {
        try {
          const { stdout: duOut } = await execAsync(
            `docker exec ${this.containerId} du -sm /workspace | cut -f1`
          )
          diskUsage = Number.parseInt(duOut.trim(), 10)
        } catch {
          diskUsage = 0
        }
      }

      return {
        cpu,
        memory,
        memoryLimit,
        diskUsage,
        networkRx,
        networkTx,
      }
    } catch (error) {
      throw new Error(`Failed to get metrics: ${error}`)
    }
  }
}
