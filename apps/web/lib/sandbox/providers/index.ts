export type { ISandboxProvider, SandboxConfig, SandboxResult } from './sandbox-provider'
export { DockerSandboxProvider } from './docker-provider'
export { StubSandboxProvider } from './stub-provider'

import { DockerSandboxProvider } from './docker-provider'
import { ISandboxProvider } from './sandbox-provider'
import { StubSandboxProvider } from './stub-provider'

export type ProviderType = 'docker' | 'stub'

export function getSandboxProvider(type: ProviderType): ISandboxProvider {
  switch (type) {
    case 'docker':
      return new DockerSandboxProvider()
    case 'stub':
      return new StubSandboxProvider()
    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}

// Default provider - can be configured via environment
export function getDefaultSandboxProvider(): ISandboxProvider {
  const providerType = (process.env.SANDBOX_PROVIDER as ProviderType) || 'docker'
  return getSandboxProvider(providerType)
}
