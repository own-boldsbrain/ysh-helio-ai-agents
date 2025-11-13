#!/usr/bin/env tsx

/**
 * Script to validate API credentials
 *
 * This script checks if the API keys in .env.local are valid by making test requests
 * to each service. It helps identify invalid or expired credentials.
 *
 * Usage: pnpm tsx scripts/validate-api-credentials.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✓ Loaded .env.local\n')
} else {
  console.error('✗ .env.local file not found')
  process.exit(1)
}

interface ValidationResult {
  service: string
  status: 'valid' | 'invalid' | 'skipped' | 'error'
  message: string
}

const results: ValidationResult[] = []

// Utility to add result
function addResult(service: string, status: ValidationResult['status'], message: string) {
  results.push({ service, status, message })
}

// Validate OpenAI API Key
async function validateOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.startsWith('your_') || apiKey === 'sk-proj-...') {
    addResult('OpenAI', 'skipped', 'API key not configured')
    return
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      addResult('OpenAI', 'valid', 'API key is valid')
    } else {
      const error = await response.text()
      addResult('OpenAI', 'invalid', `API key is invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('OpenAI', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate Groq API Key
async function validateGroq() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.startsWith('your_')) {
    addResult('Groq', 'skipped', 'API key not configured')
    return
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      addResult('Groq', 'valid', 'API key is valid')
    } else {
      addResult('Groq', 'invalid', `API key is invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('Groq', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate Google Gemini API Key
async function validateGemini() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.startsWith('your_')) {
    addResult('Google Gemini', 'skipped', 'API key not configured')
    return
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

    if (response.ok) {
      addResult('Google Gemini', 'valid', 'API key is valid')
    } else {
      addResult('Google Gemini', 'invalid', `API key is invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('Google Gemini', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate GitHub OAuth
async function validateGitHub() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret || clientId.startsWith('your_') || clientSecret.startsWith('your_')) {
    addResult('GitHub OAuth', 'skipped', 'Credentials not configured')
    return
  }

  // Note: We can't fully validate OAuth without user interaction
  // Just check if the client ID format is correct
  if (clientId.match(/^[A-Za-z0-9]{20}$/)) {
    addResult('GitHub OAuth', 'valid', 'Client ID format is correct (full validation requires OAuth flow)')
  } else {
    addResult('GitHub OAuth', 'invalid', 'Client ID format is incorrect')
  }
}

// Validate Vercel Token
async function validateVercel() {
  const token = process.env.AI_GATEWAY_API_KEY
  if (!token || token.startsWith('your_') || token === 'docker-local') {
    addResult('Vercel AI Gateway', 'skipped', 'Token not configured')
    return
  }

  try {
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      addResult('Vercel AI Gateway', 'valid', 'Token is valid')
    } else {
      addResult('Vercel AI Gateway', 'invalid', `Token is invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('Vercel AI Gateway', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate Hugging Face Token
async function validateHuggingFace() {
  const token = process.env.HF_TOKEN
  if (!token || token.startsWith('your_')) {
    addResult('Hugging Face', 'skipped', 'Token not configured')
    return
  }

  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      addResult('Hugging Face', 'valid', `Token is valid (User: ${data.name})`)
    } else {
      addResult('Hugging Face', 'invalid', `Token is invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('Hugging Face', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate Docker Hub
async function validateDockerHub() {
  const username = process.env.DOCKER_USERNAME
  const password = process.env.DOCKER_PASSWORD

  if (!username || !password || username.startsWith('your_')) {
    addResult('Docker Hub', 'skipped', 'Credentials not configured')
    return
  }

  try {
    const response = await fetch('https://hub.docker.com/v2/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      addResult('Docker Hub', 'valid', 'Credentials are valid')
    } else {
      addResult('Docker Hub', 'invalid', `Credentials are invalid: ${response.status}`)
    }
  } catch (error) {
    addResult('Docker Hub', 'error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate AWS Credentials
function validateAWS() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey || accessKeyId.startsWith('your_')) {
    addResult('AWS', 'skipped', 'Credentials not configured')
    return
  }

  // Basic format validation
  if (accessKeyId.match(/^AKIA[0-9A-Z]{16}$/) && secretAccessKey.length === 40) {
    addResult('AWS', 'valid', 'Credential format is correct (runtime validation required for full check)')
  } else {
    addResult('AWS', 'invalid', 'Credential format is incorrect')
  }
}

// Check Environment Variables
function checkRequiredEnvVars() {
  const required = [
    'POSTGRES_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'JWE_SECRET',
    'ENCRYPTION_KEY',
    'NEXT_PUBLIC_AUTH_PROVIDERS',
    'SANDBOX_PROVIDER',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length === 0) {
    addResult('Required Variables', 'valid', 'All required environment variables are set')
  } else {
    addResult('Required Variables', 'invalid', `Missing: ${missing.join(', ')}`)
  }
}

// Main validation function
async function validateAllCredentials() {
  console.log('🔍 Validating API Credentials...\n')

  // Check required environment variables
  checkRequiredEnvVars()

  // Validate each service
  await validateOpenAI()
  await validateGroq()
  await validateGemini()
  await validateGitHub()
  await validateVercel()
  await validateHuggingFace()
  await validateDockerHub()
  validateAWS()

  // Print results
  console.log('\n📊 Validation Results:\n')
  console.log('═'.repeat(80))

  results.forEach((result) => {
    const icon =
      result.status === 'valid' ? '✓' : result.status === 'invalid' ? '✗' : result.status === 'skipped' ? '○' : '⚠'

    const color =
      result.status === 'valid'
        ? '\x1b[32m'
        : result.status === 'invalid'
          ? '\x1b[31m'
          : result.status === 'skipped'
            ? '\x1b[90m'
            : '\x1b[33m'

    console.log(`${color}${icon} ${result.service.padEnd(25)}\x1b[0m ${result.message}`)
  })

  console.log('═'.repeat(80))

  // Summary
  const valid = results.filter((r) => r.status === 'valid').length
  const invalid = results.filter((r) => r.status === 'invalid').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const errors = results.filter((r) => r.status === 'error').length

  console.log(`\n📈 Summary: ${valid} valid, ${invalid} invalid, ${errors} errors, ${skipped} skipped\n`)

  if (invalid > 0 || errors > 0) {
    console.log('⚠️  Some credentials are invalid or have errors. Please check your .env.local file.\n')
    process.exit(1)
  } else {
    console.log('✅ All configured credentials are valid!\n')
    process.exit(0)
  }
}

// Run validation
validateAllCredentials().catch((error) => {
  console.error('Fatal error during validation:', error)
  process.exit(1)
})
