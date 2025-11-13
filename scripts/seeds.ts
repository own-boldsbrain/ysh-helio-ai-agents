import { db } from '../lib/db/client'
import { users, connectors, keys, settings } from '../lib/db/schema'
import { generateId } from '../lib/utils/id'

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
    // Create a test user
    const testUserId = generateId()
    await db.insert(users).values({
      id: testUserId,
      provider: 'github',
      externalId: '12345',
      accessToken: 'encrypted_token',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://github.com/images/error/testuser_happy.gif',
    })

    console.log('✅ Created test user')

    // Create some connectors
    await db.insert(connectors).values([
      {
        id: generateId(),
        userId: testUserId,
        name: 'GitHub MCP',
        description: 'GitHub integration for MCP',
        type: 'remote',
        baseUrl: 'https://api.github.com',
        status: 'connected',
      },
      {
        id: generateId(),
        userId: testUserId,
        name: 'Local File System',
        description: 'Access to local files',
        type: 'local',
        command: 'node /app/mcp-filesystem.js',
        status: 'connected',
      },
    ])

    console.log('✅ Created connectors')

    // Create API keys (in a real app, these would be encrypted)
    await db.insert(keys).values([
      {
        id: generateId(),
        userId: testUserId,
        provider: 'anthropic',
        value: 'encrypted_anthropic_key',
      },
      {
        id: generateId(),
        userId: testUserId,
        provider: 'openai',
        value: 'encrypted_openai_key',
      },
    ])

    console.log('✅ Created API keys')

    // Create default settings
    await db.insert(settings).values([
      {
        id: generateId(),
        userId: testUserId,
        key: 'maxMessagesPerDay',
        value: '100',
      },
      {
        id: generateId(),
        userId: testUserId,
        key: 'theme',
        value: 'dark',
      },
    ])

    console.log('✅ Created settings')
    console.log('🎉 Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
