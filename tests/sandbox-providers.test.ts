import { strict as assert } from 'node:assert'
import { StubSandboxProvider, DockerSandboxProvider, getSandboxProvider } from '../lib/sandbox/providers'

async function testStubProvider() {
  console.log('Testing StubSandboxProvider...')
  const provider = new StubSandboxProvider()
  const config = {
    teamId: 'test-team',
    projectId: 'test-project',
    token: 'test-token',
    timeout: 30000,
    ports: [3000],
    runtime: 'node',
  }

  const result = await provider.create(config)
  assert(result.success, 'Stub provider should succeed')
  assert(result.sandbox, 'Should return sandbox object')
  assert(result.domain, 'Should return domain')

  // Test runCommand
  const cmdResult = await provider.runCommand(result.sandbox!.id, 'echo hello')
  assert(cmdResult.success, 'Command should succeed')
  assert((cmdResult.output || '').includes('Stub'), 'Should return stub output')

  // Test shutdown
  await provider.shutdown(result.sandbox!.id)

  console.log('StubSandboxProvider tests passed')
}

async function testDockerProvider() {
  console.log('Testing DockerSandboxProvider...')
  const provider = new DockerSandboxProvider()
  const config = {
    timeout: 30000,
    ports: [3001],
    runtime: 'node',
  }

  const result = await provider.create(config)
  if (!result.success) {
    console.log('Docker not available, skipping Docker tests')
    return
  }

  assert(result.sandbox, 'Should return sandbox object')
  assert(result.domain, 'Should return domain')

  // Test runCommand
  const cmdResult = await provider.runCommand(result.sandbox!.id, 'echo hello')
  assert(cmdResult.success, 'Command should succeed')

  // Test shutdown
  await provider.shutdown(result.sandbox!.id)

  console.log('DockerSandboxProvider tests passed')
}

async function testProviderFactory() {
  console.log('Testing provider factory...')
  const stubProvider = getSandboxProvider('stub')
  assert(stubProvider instanceof StubSandboxProvider, 'Should return StubSandboxProvider')

  const dockerProvider = getSandboxProvider('docker')
  assert(dockerProvider instanceof DockerSandboxProvider, 'Should return DockerSandboxProvider')

  console.log('Provider factory tests passed')
}

async function runTests() {
  try {
    await testStubProvider()
    await testDockerProvider()
    await testProviderFactory()
    console.log('All sandbox provider tests passed!')
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

await runTests()
