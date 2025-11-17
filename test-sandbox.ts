import { DockerSandbox } from './apps/web/lib/sandbox/docker-sandbox'

async function testSandbox() {
  console.log('Testing Docker Sandbox creation...')

  try {
    // Create a simple configuration for the sandbox
    const config = {
      teamId: 'test-team',
      projectId: 'test-project',
      token: 'test-token',
      timeout: 30000, // 30 seconds
    }

    console.log('Creating Docker sandbox...')
    const sandbox = await DockerSandbox.create(config)

    console.log('Sandbox created successfully!')
    console.log('Container ID:', sandbox.containerId)

    // Test running a simple command in the sandbox
    console.log('Testing command execution...')
    const result = await sandbox.runCommand('echo', ['Hello from Docker sandbox!'])

    const stdout = await result.stdout()
    console.log('Command output:', stdout)

    // Clean up
    console.log('Cleaning up sandbox...')
    await sandbox.shutdown()
    console.log('Sandbox cleaned up successfully!')

    console.log('✅ Docker sandbox test completed successfully!')
  } catch (error) {
    console.error('❌ Error during Docker sandbox test:', error)
    process.exit(1)
  }
}

// Run the test
testSandbox()
