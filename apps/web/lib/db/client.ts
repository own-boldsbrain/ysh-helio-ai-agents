import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL environment variable is required')
      }

      // Configure PostgreSQL client with connection pooling
      const client = postgres(process.env.POSTGRES_URL, {
        // Connection pool configuration
        max: 20, // Maximum number of connections in the pool
        idle_timeout: 30, // Close idle connections after 30 seconds
        connect_timeout: 10, // Time to wait for connection before timing out
        prepare: false, // Disable prepared statements if not needed
      })

      _db = drizzle(client, {
        schema,
        logger: process.env.NODE_ENV === 'development', // Enable query logging in development
      })
    }
    return Reflect.get(_db, prop)
  },
})

// Graceful shutdown function to close database connections
export async function closeDbConnection() {
  if (_db) {
    const client = _db.client as unknown as { end: () => Promise<void> }
    if (typeof client.end === 'function') {
      await client.end()
    }
  }
}
