import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, blob } from 'drizzle-orm/sqlite-core'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

// Define the database schema tables
// This is a simplified version - you would expand these based on your actual requirements

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  githubId: text('github_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`),
})

export const sandboxes = sqliteTable('sandboxes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['creating', 'active', 'inactive', 'failed'] }).notNull(),
  environment: text('environment', { enum: ['nodejs', 'python', 'ruby', 'java'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] }).notNull(),
  sandboxId: text('sandbox_id').notNull(),
  command: text('command'),
  timeout: integer('timeout'),
  cwd: text('cwd'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  logs: blob('logs', { mode: 'json' }), // Store as JSON blob
  error: text('error'),
})

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(), // 'github', etc.
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at'), // Unix timestamp in seconds
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})
