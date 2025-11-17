# 🚀 Deploying Coding Agent Template to GitHub Pages

## 📋 Overview

This document explains how to deploy the Coding Agent Template to GitHub Pages, including necessary adaptations for static hosting and maintaining functionality.

## ⚠️ Important Limitations

GitHub Pages only supports static content, which means:

- **No server-side rendering** - Limited to static generation
- **No API routes** - Cannot run server-side code
- **No database connections** - Must use external services
- **No real-time features** - No WebSocket or streaming
- **No file system access** - Cannot write to disk

## 🏗️ Architecture Adaptation

### 1. **External Backend Architecture**

For full functionality, implement a hybrid approach:

```
┌─────────────────┐    HTTP    ┌──────────────────┐    API    ┌────────────────┐
│ GitHub Pages    │ ─────────► │ External API    │ ─────────► │ Actual Backend │
│ (Static Front)  │            │ (Vercel/AWS)    │           │ (DB, Agents)  │
│ (coding-agent-  │ ◄──────────┤ (Next.js API)   │ ◄──────────┤ (Docker)      │
│ template.pages. │   Data     │                 │   Data     │               │
│ github.io)      │            │                 │            │               │
└─────────────────┘            └──────────────────┘            └────────────────┘
```

### 2. **Static Site Generation Setup**

Update your Next.js configuration for static export:

```js
// next.config.js
const nextConfig = {
  output: 'export', // This enables static site generation
  
  // Adjust path prefix for GitHub Pages subdirectory
  basePath: process.env.NODE_ENV === 'production' ? '/coding-agent-template' : '',
  
  // Disable image optimization for static sites
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true, // Ensure clean URLs
  
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
```

### 3. **API Client for External Services**

Create an API client that works with external services:

```typescript
// lib/github-pages-api-client.ts
class GitHubPagesApiClient {
  private baseUrl: string
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 
                   'https://your-external-api.com/api'
  }

  async getAgents() {
    try {
      const response = await fetch(`${this.baseUrl}/agents`)
      return await response.json()
    } catch (error) {
      console.warn('External API unavailable, using mock data:', error)
      // Return static mock data for GitHub Pages
      return [
        { id: 'claude', name: 'Claude 3.5 Sonnet', status: 'online', tasks: 5 },
        { id: 'gpt-4', name: 'GPT-4 Turbo', status: 'online', tasks: 3 },
        { id: 'gemini', name: 'Gemini Pro', status: 'offline', tasks: 0 },
        { id: 'groq', name: 'Groq LLaMA 3', status: 'online', tasks: 7 },
        { id: 'ollama', name: 'Local Ollama', status: 'online', tasks: 2 },
      ]
    }
  }

  async getTasks() {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`)
      return await response.json()
    } catch (error) {
      console.warn('External API unavailable, using mock data:', error)
      return [
        { id: 'task-1', agent: 'claude', status: 'completed', title: 'Code review' },
        { id: 'task-2', agent: 'gpt-4', status: 'processing', title: 'Bug fix' },
      ]
    }
  }

  async createTask(taskData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      return await response.json()
    } catch (error) {
      console.error('Failed to create task:', error)
      // For GitHub Pages, return a success simulation
      return {
        id: `task-${Date.now()}`,
        status: 'submitted',
        message: 'Task submitted (demo mode)'
      }
    }
  }
}

export const githubPagesApiClient = new GitHubPagesApiClient()
```

## 🚀 Deployment Process

### 1. **Prepare Repository Settings**

1. Go to your repository Settings
2. Navigate to Pages section
3. Select "GitHub Actions" as the source
4. Ensure your repository is public if you want it accessible

### 2. **Environment Setup**

Create a `.env.production` file for GitHub Pages:

```bash
# .env.production
NEXT_PUBLIC_APP_NAME="Coding Agent Template Demo"
NEXT_PUBLIC_GITHUB_PAGES=true
NEXT_PUBLIC_EXTERNAL_API_URL=https://your-production-api.com
NEXT_PUBLIC_GITHUB_REPO_OWNER=your-username
NEXT_PUBLIC_GITHUB_REPO_NAME=coding-agent-template
```

### 3. **GitHub Actions Workflow**

The workflow should be in `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build static site
        run: |
          # Create GitHub Pages config
          cat > next.config.pages.js << 'EOF'
          const nextConfig = {
            output: 'export',
            basePath: '/coding-agent-template', // Replace with your repo name
            images: {
              unoptimized: true,
            },
            trailingSlash: true,
          }
          module.exports = nextConfig
          EOF
          
          # Use GitHub Pages config for build
          mv next.config.pages.js next.config.js
          
          # Build the app
          pnpm build
          
          # Rename dist to out for GitHub Pages
          mv dist out 2>/dev/null || mv build out 2>/dev/null || true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './out'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🧪 Testing Locally

### 1. **Build for Static Export**

```bash
# Build the static version
pnpm build

# The output will be in the `out` directory
ls out/
```

### 2. **Serve Locally for Testing**

```bash
# Install a simple static server
npm install -g serve

# Serve the static build
serve out
```

## 📊 GitHub Pages Features Maintained

Even in static form, GitHub Pages can showcase:

- **Documentation** - All project docs and guides
- **Demo UI** - Interactive frontend with mock data
- **Architecture Overview** - Visual diagrams and documentation
- **API References** - Static API documentation
- **Performance Metrics** - Static performance reports
- **Monitoring Dashes** - Static versions of dashboards

## 🛠️ GitHub Pages Optimized Components

### Static Agent Status Component:

```tsx
// components/static-agent-status.tsx
'use client'

import { useState, useEffect } from 'react'

interface AgentStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  tasks: number
}

export function StaticAgentStatus() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load agents from external API or use static data
    const loadAgents = async () => {
      try {
        const response = await fetch('/api/github-pages/agents.json') // Pre-built static data
        const data = await response.json()
        setAgents(data)
      } catch {
        // Fallback to static data
        setAgents([
          { id: 'claude', name: 'Claude 3.5', status: 'online', tasks: 3 },
          { id: 'gpt-4', name: 'GPT-4 Turbo', status: 'online', tasks: 5 },
          { id: 'gemini', name: 'Gemini Pro', status: 'offline', tasks: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  if (loading) {
    return <div>Loading agent status...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map(agent => (
        <div key={agent.id} className={`p-4 rounded-lg border ${
          agent.status === 'online' ? 'border-green-500 bg-green-50' :
          agent.status === 'busy' ? 'border-yellow-500 bg-yellow-50' :
          'border-gray-500 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{agent.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              agent.status === 'online' ? 'bg-green-200 text-green-800' :
              agent.status === 'busy' ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {agent.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{agent.tasks} active tasks</p>
        </div>
      ))}
    </div>
  )
}
```

## 📝 Updating GitHub Pages Content

For static content updates:

1. Update the static data files in `public/data/`
2. Modify the `getStaticProps` functions to use new mock data
3. Re-run the build and deployment
4. The GitHub Actions workflow will automatically deploy updates

## 🔗 GitHub Pages URL

Once deployed, your GitHub Pages site will be available at:
`https://your-username.github.io/coding-agent-template`

## 🎯 Recommended Use Cases

GitHub Pages version is ideal for:

- 📚 **Documentation** - Project documentation and guides
- 🎯 **Demo** - Interactive frontend demonstration
- 📊 **Reporting** - Static performance and metrics reports
- 📖 **Knowledge Base** - Articles and tutorials
- 👥 **Community** - Project showcase and onboarding

## 🚨 Important Notes

- GitHub Pages is for **demonstration and documentation**
- Full functionality requires a **server environment** with Docker and AI API access
- Set up external API service for **real dynamic features**
- Use GitHub Pages as a **marketing and documentation hub**

---

**Last Updated:** November 17, 2025  
**Version:** 1.0.0  
**Status:** Ready for Production Deployment