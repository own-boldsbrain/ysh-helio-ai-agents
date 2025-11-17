import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Port
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  
  // Next.js public variables
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().min(1),
  
  // Optional variables with defaults
  GITHUB_CLIENT_SECRET: z.string().optional(),
  API_SECRET: z.string().optional(),
  JWE_SECRET: z.string().optional().default('dev-secret-key-change-in-production'),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Vercel related
  SANDBOX_VERCEL_TOKEN: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_TEAM_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }
  
  try {
    validatedEnv = envSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:')
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
      throw new Error('Invalid environment configuration. Please check your .env file.')
    }
    throw error
  }
}

// Automatically validate on import in production
if (process.env.NODE_ENV === 'production') {
  getEnv()
}

// Export the validated environment
export const env = getEnv()