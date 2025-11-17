# GitHub Pages Deployment Configuration

This document outlines how to deploy the Coding Agent Template to GitHub Pages, including the necessary Next.js configuration changes and GitHub Actions workflow.

## 🎯 Overview

GitHub Pages is a static site hosting service that can serve the output of a Next.js application using Static Site Generation (SSG) or Incremental Static Regeneration (ISR). To deploy the multi-agent AI system to GitHub Pages, we'll need to make some architectural adaptations.

## 🏗️ GitHub Pages Limitations & Adaptations

### Key Limitations
1. **No Server-Side Rendering** - Limited to static generation
2. **No API Routes** - GitHub Pages is static-only (no dynamic server endpoints)
3. **No Database Connection** - Must use external services for data persistence
4. **No Real-time Features** - No WebSocket connections or server-side streaming

### Necessary Adaptations

#### 1. **API Architecture Changes**
```typescript
// Instead of direct database access, we'll use an external API backend
// lib/api/client.ts
export const apiClient = {
  getTasks: async () => {
    // Fetch from external API or GitHub Issues/Projects API
    const response = await fetch('https://your-external-api.com/api/tasks')
    return response.json()
  },

  createTask: async (taskData: any) => {
    // Send to external API or use GitHub Issues API
    const response = await fetch('https://your-external-api.com/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    return response.json()
  },

  getAgents: async () => {
    // Return static agent list or fetch from external service
    return [
      { id: 'claude', name: 'Claude', status: 'online' },
      { id: 'gpt-4', name: 'GPT-4', status: 'online' },
      // ... other agents
    ]
  }
}
```

#### 2. **Next.js Configuration for GitHub Pages**

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Important: This tells Next.js to build a static app
  
  // For GitHub Pages, we need to add a path prefix if hosted on a subdirectory
  basePath: process.env.NODE_ENV === 'production' ? '/coding-agent-template' : '',
  
  // Disable server-side features not supported on static hosting
  images: {
    unoptimized: true, // Disable image optimization for static exports
  },
  
  trailingSlash: true, // This helps with GitHub Pages routing
  
  // Remove any API route dependencies
  experimental: {
    // Disable features not compatible with static export
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
```

#### 3. **Static Generation Implementation**

```typescript
// pages/index.tsx or app/page.tsx (depending on your setup)
import { GetStaticProps } from 'next'
import { AgentCard } from '../components/agent-card'
import { TaskList } from '../components/task-list'

interface HomePageProps {
  agents: any[]
  tasks: any[]
  stats: {
    totalAgents: number
    activeAgents: number
    totalTasks: number
    onlineSince: string
  }
}

export default function HomePage({ agents, tasks, stats }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Coding Agent</h1>
            <span className="text-sm text-muted-foreground">
              {stats.activeAgents}/{stats.totalAgents} agents online
            </span>
          </div>
          <nav>
            <ul className="flex gap-4">
              <li><a href="/">Home</a></li>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container py-6">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <TaskList tasks={tasks} />
        </section>
      </main>

      <footer className="border-t py-4 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Powered by Coding Agent Template • Online since {stats.onlineSince}</p>
          <p className="mt-2">GitHub Pages deployment</p>
        </div>
      </footer>
    </div>
  )
}

// Static generation - fetch data at build time
export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch data from external services or static sources
    const agents = [
      { id: 'claude', name: 'Claude 3.5 Sonnet', status: 'online', model: 'claude-sonnet-4.5' },
      { id: 'gpt-4', name: 'GPT-4 Turbo', status: 'online', model: 'gpt-4-turbo' },
      { id: 'gemini', name: 'Gemini Pro', status: 'online', model: 'gemini-2.5-pro' },
      { id: 'groq', name: 'Groq LLaMA 3', status: 'online', model: 'llama3-70b' },
      { id: 'ollama', name: 'Ollama Local', status: 'online', model: 'qwen2.5-coder' },
    ]

    // For GitHub Pages, we'll use mock data or data from external API
    const tasks = [
      { 
        id: 'task-1', 
        title: 'Optimize database queries', 
        status: 'completed', 
        agent: 'claude',
        createdAt: new Date().toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString()
      },
      { 
        id: 'task-2', 
        title: 'Fix authentication bug', 
        status: 'processing', 
        agent: 'gpt-4',
        createdAt: new Date().toISOString()
      },
    ]

    const props: HomePageProps = {
      agents,
      tasks,
      stats: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'online').length,
        totalTasks: tasks.length,
        onlineSince: new Date().toISOString()
      }
    }

    return {
      props,
      revalidate: 300, // Revalidate every 5 minutes (if using ISR with external API)
    }
  } catch (error) {
    console.error('Error generating static props:', error)
    return {
      props: {
        agents: [],
        tasks: [],
        stats: {
          totalAgents: 0,
          activeAgents: 0,
          totalTasks: 0,
          onlineSince: new Date().toISOString()
        }
      },
      revalidate: 60, // Retry after 1 minute on error
    }
  }
}
```

## 🔧 GitHub Actions Workflow for GitHub Pages

```yaml
# .github/workflows/deploy-pages.yml
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
  build:
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
        run: npm install -g pnpm@9.15.0

      - name: Install dependencies
        run: pnpm install

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Create environment file for build
        run: |
          cat > .env.local << EOF
          # GitHub Pages build environment
          NEXT_PUBLIC_APP_NAME="Coding Agent Template"
          NEXT_PUBLIC_APP_ENV="production"
          NEXT_PUBLIC_GITHUB_PAGES=true
          # External API endpoints for dynamic features
          NEXT_PUBLIC_EXTERNAL_API_URL=https://your-backend-api.com
          NEXT_PUBLIC_GITHUB_REPO_OWNER=your-username
          NEXT_PUBLIC_GITHUB_REPO_NAME=coding-agent-template
          EOF

      - name: Build for GitHub Pages
        run: |
          # Modify next.config.js temporarily for static export
          cp next.config.ts next.config.ts.backup
          cat > next.config.ts << 'EOL'
          /** @type {import('next').NextConfig} */
          const nextConfig = {
            output: 'export',
            basePath: process.env.NODE_ENV === 'production' ? '/coding-agent-template' : '',
            images: {
              unoptimized: true,
            },
            trailingSlash: true,
            experimental: {
              serverComponentsExternalPackages: [],
            },
            env: {
              NEXT_PUBLIC_GITHUB_PAGES: 'true',
            }
          }

          module.exports = nextConfig
          export default nextConfig
          EOL
          
          # Build the application
          pnpm build
          
          # Restore original config
          mv next.config.ts.backup next.config.ts

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './out'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🚀 Alternative Approach: Hybrid Architecture

For a more robust solution that maintains some dynamic functionality, consider a hybrid approach:

1. **Static Frontend** - Hosted on GitHub Pages
2. **External Backend** - Hosted elsewhere (Vercel, AWS, etc.)
3. **API Gateway** - To connect frontend to backend services

### Implementation:

```typescript
// lib/github-pages-api.ts
class GitHubPagesApiClient {
  private baseUrl: string
  
  constructor() {
    // Use environment variable or fallback to external service
    this.baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'https://api.coding-agent.example.com'
  }
  
  async getAgents() {
    const response = await fetch(`${this.baseUrl}/api/agents`)
    return response.json()
  }
  
  async createTask(taskData: any) {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication
      },
      body: JSON.stringify(taskData)
    })
    return response.json()
  }
  
  // Fallback to static data if external API is unavailable
  async getAgentsWithFallback() {
    try {
      return await this.getAgents()
    } catch (error) {
      console.warn('External API unavailable, using fallback data:', error)
      // Return static agent configurations
      return [
        { id: 'claude', name: 'Claude 3.5 Sonnet', status: 'online', model: 'claude-sonnet-4.5' },
        { id: 'gpt-4', name: 'GPT-4 Turbo', status: 'online', model: 'gpt-4-turbo' },
        // ... other static agents
      ]
    }
  }
}

export const githubPagesApi = new GitHubPagesApiClient()
```

## 📁 Directory Structure for GitHub Pages

```
coding-agent-template/
├── apps/
│   └── web/                 # Main Next.js app
│       ├── pages/           # Next.js pages router (for static export)
│       ├── components/      # React components
│       ├── lib/             # Shared utilities
│       ├── public/          # Static assets
│       ├── styles/          # Global styles
│       └── next.config.js   # Next.js configuration
├── .github/
│   └── workflows/
│       └── deploy-pages.yml # GitHub Actions workflow
├── package.json
├── pnpm-lock.yaml
├── README.md
└── docs/
    └── GITHUB_PAGES_GUIDE.md # This documentation
```

## 🧪 Testing GitHub Pages Build Locally

```bash
# Create a build script for GitHub Pages
# package.json scripts
{
  "scripts": {
    // ... other scripts
    "build:github-pages": "NODE_ENV=production pnpm build",
    "export": "next export",
    "preview:github-pages": "serve out"
  }
}
```

## 📊 GitHub Pages Performance Optimizations

1. **Bundle Size Optimization**:
   - Use dynamic imports for non-critical components
   - Optimize images and assets
   - Implement proper code splitting

2. **Caching Strategy**:
   - Leverage browser caching for static assets
   - Use proper cache headers in `_headers` file

3. **CDN Optimization**:
   - GitHub Pages automatically uses CDN
   - Optimize for first-contentful-paint (FCP)

### Example `_headers` file:

```
# Static asset caching
/static/*:
  Cache-Control: "public, max-age=31536000, immutable"

# Page caching
/*
  Cache-Control: "public, max-age=300, must-revalidate"
```

This implementation provides a complete solution for adapting the Coding Agent Template for GitHub Pages while maintaining core functionality through external API services.