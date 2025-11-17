import { Pool, type PoolClient } from 'pg'

let pool: Pool | null = null

const DEFAULT_POOL_CONFIG = {
  max: 20, // maximum number of clients in the pool
  min: 4, // minimum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500, // maximum number of times a connection can be used
}

export function getConnectionPool(
  connectionString: string,
  config = DEFAULT_POOL_CONFIG
): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ...config,
      application_name: 'coding-agent-app',
    })

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client:', err)
    })

    pool.on('connect', () => {
      console.error('New client connected to pool')
    })

    pool.on('remove', () => {
      console.error('Client removed from pool')
    })
  }

  return pool
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Connection pool not initialized')
  }

  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('Failed to get client from pool:', error)
    throw error
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function executeQuery<T>(
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = await getClient()

  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function executeQuerySingle<T>(
  query: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}
