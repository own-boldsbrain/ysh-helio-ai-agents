import 'dotenv/config'
import { db } from '../lib/db/client'
import { users, tasks, taskMessages, connectors } from '../lib/db/schema'
import { generateId } from '../lib/utils/id'

function getTaskData(i: number) {
  let taskType: string
  let taskStatus: 'pending' | 'processing' | 'completed' | 'error' | 'stopped'
  let taskProgress: number

  if (i === 1) {
    taskType = 'README'
    taskStatus = 'completed'
    taskProgress = 100
  } else if (i === 2) {
    taskType = 'script'
    taskStatus = 'processing'
    taskProgress = 50
  } else {
    taskType = 'component'
    taskStatus = 'pending'
    taskProgress = 0
  }

  return { taskType, taskStatus, taskProgress }
}

async function createFixtures() {
  console.log('🔧 Creating test fixtures...')

  try {
    // Create a fixture user
    const fixtureUserId = generateId()
    await db.insert(users).values({
      id: fixtureUserId,
      provider: 'github',
      externalId: 'fixture123',
      accessToken: 'fixture_token',
      username: 'fixtureuser',
      email: 'fixture@example.com',
      name: 'Fixture User',
      avatarUrl: 'https://github.com/images/error/fixtureuser_happy.gif',
    })

    console.log('✅ Created fixture user')

    // Create test tasks
    const taskIds = []
    for (let i = 1; i <= 3; i++) {
      const taskId = generateId()
      taskIds.push(taskId)

      const { taskType, taskStatus, taskProgress } = getTaskData(i)

      await db.insert(tasks).values({
        id: taskId,
        userId: fixtureUserId,
        prompt: `Test task ${i}: Create a simple ${taskType}`,
        title: `Test Task ${i}`,
        selectedAgent: 'claude',
        status: taskStatus,
        progress: taskProgress,
        maxDuration: 300,
        installDependencies: false,
        keepAlive: false,
      })
    }

    console.log('✅ Created test tasks')

    // Create task messages for the first task
    await db.insert(taskMessages).values([
      {
        id: generateId(),
        taskId: taskIds[0],
        role: 'user',
        content: 'Create a README file for this project',
      },
      {
        id: generateId(),
        taskId: taskIds[0],
        role: 'agent',
        content: 'I have successfully created a README.md file with project documentation.',
      },
    ])

    console.log('✅ Created task messages')

    // Create fixture connectors
    await db.insert(connectors).values([
      {
        id: generateId(),
        userId: fixtureUserId,
        name: 'Test MCP Server',
        description: 'Fixture MCP server for testing',
        type: 'remote',
        baseUrl: 'https://test-mcp.example.com',
        status: 'connected',
      },
    ])

    console.log('✅ Created fixture connectors')
    console.log('🎉 Test fixtures created successfully!')
    console.log(`Fixture user ID: ${fixtureUserId}`)
    console.log(`Task IDs: ${taskIds.join(', ')}`)
  } catch (error) {
    console.error('❌ Error creating fixtures:', error)
    process.exit(1)
  }
}

await createFixtures()
