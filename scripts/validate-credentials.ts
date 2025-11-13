#!/usr/bin/env tsx
/**
 * Script para validar todas as credenciais configuradas
 */

import 'dotenv/config'

interface ValidationResult {
  service: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

const results: ValidationResult[] = []

function logResult(result: ValidationResult) {
  const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'
  console.log(`${icon} ${result.service}: ${result.message}`)
  if (result.details) {
    console.log(`   ${result.details}`)
  }
  results.push(result)
}

// Validate Vercel AI Gateway
async function validateVercelAI() {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    logResult({
      service: 'Vercel AI Gateway',
      status: 'error',
      message: 'API Key não configurada',
      details: 'Defina AI_GATEWAY_API_KEY no .env.local',
    })
    return
  }

  if (!apiKey.startsWith('vck_')) {
    logResult({
      service: 'Vercel AI Gateway',
      status: 'warning',
      message: 'Formato de API Key suspeito',
      details: 'API Keys da Vercel geralmente começam com "vck_"',
    })
    return
  }

  logResult({
    service: 'Vercel AI Gateway',
    status: 'success',
    message: 'API Key configurada',
    details: `Key: ${apiKey.substring(0, 10)}...`,
  })
}

// Validate Google Custom Search
async function validateGoogle() {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  if (!apiKey) {
    logResult({
      service: 'Google Custom Search',
      status: 'error',
      message: 'API Key não configurada',
      details: 'Defina GOOGLE_SEARCH_API_KEY no .env.local',
    })
    return
  }

  logResult({
    service: 'Google Custom Search',
    status: 'success',
    message: 'API Key configurada',
    details: `Key: ${apiKey.substring(0, 10)}...`,
  })
}

// Validate Facebook/Meta
async function validateFacebook() {
  const token = process.env.FACEBOOK_TOKEN
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET
  const catalogId = process.env.FACEBOOK_CATALOG_ID

  const missing = []
  if (!token) missing.push('FACEBOOK_TOKEN')
  if (!appId) missing.push('FACEBOOK_APP_ID')
  if (!appSecret) missing.push('FACEBOOK_APP_SECRET')
  if (!catalogId) missing.push('FACEBOOK_CATALOG_ID')

  if (missing.length > 0) {
    logResult({
      service: 'Facebook/Meta Commerce',
      status: 'error',
      message: 'Credenciais faltando',
      details: `Defina: ${missing.join(', ')}`,
    })
    return
  }

  // Validate token format - token is guaranteed to be defined here
  if (token && !token.startsWith('EAA')) {
    logResult({
      service: 'Facebook/Meta Commerce',
      status: 'warning',
      message: 'Formato de token suspeito',
      details: 'Tokens do Facebook geralmente começam com "EAA"',
    })
    return
  }

  logResult({
    service: 'Facebook/Meta Commerce',
    status: 'success',
    message: 'Todas as credenciais configuradas',
    details: `App ID: ${appId}, Catalog ID: ${catalogId}`,
  })
}

// Validate Hugging Face
async function validateHuggingFace() {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY
  if (!token) {
    logResult({
      service: 'Hugging Face',
      status: 'error',
      message: 'Token não configurado',
      details: 'Defina HF_TOKEN ou HUGGINGFACE_API_KEY no .env.local',
    })
    return
  }

  if (!token.startsWith('hf_')) {
    logResult({
      service: 'Hugging Face',
      status: 'warning',
      message: 'Formato de token suspeito',
      details: 'Tokens do Hugging Face geralmente começam com "hf_"',
    })
    return
  }

  // Try to validate token with HF API
  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      logResult({
        service: 'Hugging Face',
        status: 'success',
        message: 'Token válido e autenticado',
        details: `User: ${data.name || data.id || 'Unknown'}`,
      })
    } else {
      logResult({
        service: 'Hugging Face',
        status: 'error',
        message: 'Token inválido',
        details: `Status: ${response.status} ${response.statusText}`,
      })
    }
  } catch (error) {
    logResult({
      service: 'Hugging Face',
      status: 'warning',
      message: 'Não foi possível validar token',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

// Validate Database
async function validateDatabase() {
  const dbUrl = process.env.POSTGRES_URL
  if (!dbUrl) {
    logResult({
      service: 'PostgreSQL',
      status: 'error',
      message: 'URL de conexão não configurada',
      details: 'Defina POSTGRES_URL no .env.local',
    })
    return
  }

  logResult({
    service: 'PostgreSQL',
    status: 'success',
    message: 'URL de conexão configurada',
    details: dbUrl.includes('localhost') ? 'Ambiente local' : 'Ambiente remoto',
  })
}

// Main execution - using top-level await pattern
console.log('\n🔍 Validando credenciais configuradas...\n')

await validateVercelAI()
await validateGoogle()
await validateFacebook()
await validateHuggingFace()
await validateDatabase()

// Summary
console.log('\n📊 Resumo:')
const success = results.filter((r) => r.status === 'success').length
const warnings = results.filter((r) => r.status === 'warning').length
const errors = results.filter((r) => r.status === 'error').length

console.log(`   ✅ Sucesso: ${success}`)
console.log(`   ⚠️  Avisos: ${warnings}`)
console.log(`   ❌ Erros: ${errors}`)

if (errors > 0) {
  console.log('\n⚠️  Há credenciais com problemas que precisam ser corrigidas!')
  process.exit(1)
} else if (warnings > 0) {
  console.log('\n⚠️  Todas as credenciais estão configuradas, mas há avisos.')
  process.exit(0)
} else {
  console.log('\n🎉 Todas as credenciais estão configuradas corretamente!')
  process.exit(0)
}
