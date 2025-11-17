# 🛠️ SKILLS, CAPABILITIES & TOOLS REFERENCE

**Project**: Coding Agent Template - Multi-Agent AI System  
**Date**: November 17, 2025  
**Purpose**: Complete reference for all technologies, tools, and capabilities  
**Audience**: Developers, DevOps, Data Scientists, Product Managers

---

## 📑 TABLE OF CONTENTS

1. [Frontend Skills](#frontend-skills)
2. [Backend Skills](#backend-skills)
3. [Infrastructure Skills](#infrastructure-skills)
4. [AI/ML Skills](#aiml-skills)
5. [DevOps/Operations](#devopsoperations)
6. [Testing & QA](#testing--qa)
7. [Productivity Tools](#productivity-tools)
8. [External APIs & Services](#external-apis--services)
9. [Reference URLs](#reference-urls)
10. [Performance Benchmarks](#performance-benchmarks)

---

## 🎨 FRONTEND SKILLS

### Framework & Runtime

- **Next.js 16.0.0** ⭐⭐⭐⭐⭐
  - App Router (latest)
  - Server Components
  - API Routes
  - ISR (Incremental Static Regeneration)
  - Image Optimization
  - Font Optimization
  - Performance monitoring
- **React 19.1.0** ⭐⭐⭐⭐⭐
  - Hooks API
  - Context API
  - Suspense boundaries
  - Streaming SSR
  - Transitions
  - Use hook

- **TypeScript 5** ⭐⭐⭐⭐⭐
  - Strict mode
  - Generics
  - Decorators
  - Module resolution
  - Type inference

### UI Component Library

- **Radix UI** ⭐⭐⭐⭐⭐
  - 20+ pre-built components
  - Accessibility first
  - Unstyled, framework-agnostic
  - Zero runtime
  - Documentation: https://www.radix-ui.com/

  Components Used:
  - Accordion, Alert Dialog, Avatar
  - Checkbox, Dialog, Dropdown Menu
  - Label, Progress, Radio Group
  - Select, Slot, Switch, Tabs
  - Tooltip, Popover

### Styling & CSS

- **Tailwind CSS 4.1.13** ⭐⭐⭐⭐⭐
  - Utility-first CSS
  - PostCSS 4
  - Custom theme support
  - Dark mode support
  - Performance optimized
  - Installation: `npm install -D tailwindcss postcss autoprefixer`
  - Documentation: https://tailwindcss.com/

  Key Features:
  - PX-to-rem scaling
  - Custom color palette
  - Animation library
  - Responsive design
  - Container queries

### Code Editor Integration

- **Monaco Editor 4.7.0** ⭐⭐⭐⭐
  - 60+ language support
  - IntelliSense
  - Git diff integration
  - Terminal simulation
  - Theme support
  - Installation: `npm install @monaco-editor/react`
  - Documentation: https://microsoft.github.io/monaco-editor/

  Languages Supported:
  - JavaScript, TypeScript, Python
  - Java, C++, C#, Go, Rust
  - HTML, CSS, SQL, YAML, JSON
  - 50+ more

### State Management

- **Jotai 2.15.0** ⭐⭐⭐⭐
  - Primitive atoms
  - Minimal boilerplate
  - 2KB minified
  - DevTools integration
  - Async atoms
  - Installation: `npm install jotai`
  - Documentation: https://jotai.org/

  Features:
  - Write-in-render
  - No provider limit
  - Scope isolation
  - React DevTools support

### Data Fetching

- **TanStack Query (React Query) 5.62.11** ⭐⭐⭐⭐⭐
  - Caching layer
  - Background refetching
  - Optimistic updates
  - Pagination support
  - Infinite queries
  - DevTools included
  - Installation: `npm install @tanstack/react-query`
  - Documentation: https://tanstack.com/query

  Features:
  - Cache invalidation
  - Request deduplication
  - Stale-while-revalidate
  - Error handling
  - Retry logic

### Animation & Effects

- **Tailwind CSS Animate** ⭐⭐⭐⭐
  - CSS-based animations
  - Zero runtime overhead
  - Framer Motion compatible
  - Custom duration support
  - Delay support

- **Sonner (Toast Notifications)** ⭐⭐⭐⭐
  - Toast notifications
  - Promise support
  - Custom components
  - Installation: `npm install sonner`
  - Documentation: https://sonner.emilkowal.ski/

- **Vaul (Drawer)** ⭐⭐⭐⭐
  - Accessible drawer component
  - Smooth animations
  - Installation: `npm install vaul`

### HTTP Client

- **Fetch API** (Built-in) ⭐⭐⭐⭐
  - Native browser API
  - Promise-based
  - Headers, request, response
  - AbortController support

### Development Tools

- **Webpack** (via Next.js)
  - Module bundling
  - Code splitting
  - Hot module replacement (HMR)
  - Tree shaking
  - Analysis: `ANALYZE=true npm run build`

---

## 🔧 BACKEND SKILLS

### Runtime & Language

- **Node.js 20+** ⭐⭐⭐⭐⭐
  - V8 engine
  - Event loop
  - Async/await
  - Worker threads
  - Stream API

- **TypeScript 5** ⭐⭐⭐⭐⭐
  - Type safety
  - Strict mode
  - Type inference
  - Generics
  - Utility types

### Framework & HTTP

- **Next.js 16 API Routes** ⭐⭐⭐⭐⭐
  - Route handlers
  - Middleware
  - Request/response API
  - Cookies support
  - Headers manipulation
  - Documentation: https://nextjs.org/docs/app/building-your-application/routing

### Database & ORM

- **PostgreSQL 15-Alpine** ⭐⭐⭐⭐⭐
  - ACID compliance
  - JSONB support
  - Full-text search
  - UUID type
  - Replication support
  - Connection pooling
  - Documentation: https://www.postgresql.org/docs/15/

  Key Features:
  - Transactions
  - Triggers
  - Functions
  - Constraints
  - Indexes

- **Drizzle ORM 0.36.4** ⭐⭐⭐⭐⭐
  - Type-safe queries
  - SQL-like API
  - Zero-runtime overhead
  - Auto-migrations (drizzle-kit)
  - Query builder
  - Relations support
  - Installation: `npm install drizzle-orm postgres`
  - Documentation: https://orm.drizzle.team/

  Features:
  - Type inference from schema
  - Prepared statements
  - Batch operations
  - Raw SQL support

### Authentication & Security

- **Arctic 3.7.0** ⭐⭐⭐⭐⭐
  - OAuth provider library
  - 20+ providers supported
  - Session management
  - Cookie handling
  - Installation: `npm install arctic`
  - Documentation: https://arctic.js.org/

  Supported Providers:
  - GitHub, Google, Discord
  - Microsoft, Apple, Facebook
  - LinkedIn, Twitch, Reddit
  - 10+ more

- **Jose 6.1.0** ⭐⭐⭐⭐⭐
  - JWT creation/verification
  - JWE encryption
  - JWKS support
  - Key management
  - Installation: `npm install jose`
  - Documentation: https://github.com/panva/jose

  Features:
  - HS256, HS384, HS512
  - RS256, RS384, RS512
  - ES256, ES384, ES512
  - EdDSA

### Input Validation & Parsing

- **Zod 4.1.11** ⭐⭐⭐⭐⭐
  - TypeScript-first validation
  - Runtime type checking
  - Error messages
  - Transformations
  - Installation: `npm install zod`
  - Documentation: https://zod.dev/

  Features:
  - Schema composition
  - Async validation
  - Custom refinements
  - Coercion
  - Defaults

### API Clients

- **Octokit 22.0.0** ⭐⭐⭐⭐⭐
  - GitHub REST API
  - GitHub GraphQL API
  - Rate limiting
  - Pagination
  - Installation: `npm install @octokit/rest`
  - Documentation: https://octokit.github.io/rest.js/

  Capabilities:
  - Repositories
  - Issues, Pull Requests
  - Commits, Branches
  - Users, Organizations
  - Gists, Releases

- **@vercel/sdk 1.13.9** ⭐⭐⭐⭐
  - Vercel API client
  - Deployment management
  - Environment variables
  - Projects, Teams
  - Installation: `npm install @vercel/sdk`
  - Documentation: https://github.com/vercel/sdk

  Capabilities:
  - Project management
  - Deployment querying
  - Environment vars
  - Domains

### External Service Integrations

- **Anthropic SDK** ⭐⭐⭐⭐⭐
  - Claude API integration
  - Streaming support
  - Tool use (function calling)
  - Vision API
  - Installation: `npm install @anthropic-ai/sdk`
  - Documentation: https://docs.anthropic.com/

  Models Supported:
  - Claude 3 Opus
  - Claude 3 Sonnet
  - Claude 3 Haiku

- **OpenAI SDK** ⭐⭐⭐⭐⭐
  - GPT API integration
  - Chat completions
  - Vision API
  - DALL-E integration
  - Installation: `npm install openai`
  - Documentation: https://platform.openai.com/docs/

  Models Supported:
  - GPT-4 Turbo
  - GPT-3.5 Turbo
  - DALL-E 3

### Utility Libraries

- **nanoid 5.1.5** ⭐⭐⭐⭐
  - Unique ID generation
  - URL-friendly strings
  - No dependencies
  - Installation: `npm install nanoid`

- **ms 2.1.3** ⭐⭐⭐⭐
  - Time conversion
  - "1h" → milliseconds
  - Installation: `npm install ms`

- **streamdown 1.4.0** ⭐⭐⭐⭐
  - Stream JSON parsing
  - Incremental parsing
  - Installation: `npm install streamdown`

---

## 🐳 INFRASTRUCTURE SKILLS

### Containerization

- **Docker 20.10+** ⭐⭐⭐⭐⭐
  - Image building
  - Container orchestration
  - Network management
  - Volume management
  - Security options
  - Documentation: https://docs.docker.com/

  Key Concepts:
  - Dockerfile syntax
  - Multi-stage builds
  - Layer caching
  - Image scanning
  - Registry management

- **Docker Compose 3.8** ⭐⭐⭐⭐⭐
  - Service orchestration
  - Environment variables
  - Networks and volumes
  - Health checks
  - Resource limits
  - Documentation: https://docs.docker.com/compose/

  Features:
  - Service dependencies
  - Networking
  - Volume sharing
  - Env file support
  - Override files

### Databases

- **PostgreSQL 15-Alpine** ⭐⭐⭐⭐⭐
  - Relational database
  - ACID compliance
  - Full-text search
  - JSONB support
  - Replication
  - Connection pooling
  - Documentation: https://www.postgresql.org/

  Key Specifications (docker-compose):
  - 8GB memory allocation
  - 4 CPU cores reserved
  - 200 max connections
  - 2GB shared buffers
  - 6GB effective cache size

- **Redis 7-Alpine** ⭐⭐⭐⭐⭐
  - In-memory cache
  - Key-value store
  - Pub/Sub messaging
  - Data structures
  - Persistence options
  - Documentation: https://redis.io/

  Use Cases in Project:
  - Session storage
  - Rate limiting
  - Caching
  - Task queue
  - Real-time features

### Message Queue

- **RabbitMQ** ⭐⭐⭐⭐
  - Message broker
  - Task distribution
  - Message durability
  - Dead-letter exchanges
  - Management UI
  - Documentation: https://www.rabbitmq.com/

  Features:
  - Exchanges and queues
  - Routing rules
  - Consumer groups
  - Message acknowledgments
  - Persistence

### Reverse Proxy & Load Balancing

- **Nginx** ⭐⭐⭐⭐⭐
  - HTTP server
  - Reverse proxy
  - Load balancing
  - SSL/TLS termination
  - Compression
  - Documentation: https://nginx.org/

  Load Balancing:
  - Least connection algorithm
  - Round-robin
  - IP hash
  - Rate limiting
  - Health checks

### Monitoring & Observability

- **Prometheus** ⭐⭐⭐⭐⭐
  - Metrics collection
  - Time-series database
  - Alert rules
  - Data retention
  - Documentation: https://prometheus.io/

  Features:
  - Multi-target scraping
  - Pull-based model
  - Relabeling
  - Service discovery
  - 15s scrape interval (config)

- **Grafana** ⭐⭐⭐⭐⭐
  - Metrics visualization
  - Dashboard creation
  - Alert management
  - Multiple datasources
  - Documentation: https://grafana.com/

  Features:
  - Templating
  - Annotations
  - Alerting rules
  - User management
  - Provisioning

- **Loki (Recommended)** ⭐⭐⭐⭐
  - Log aggregation
  - Prometheus-like interface
  - Label-based querying
  - Installation: Docker image `grafana/loki`
  - Documentation: https://grafana.com/loki/

- **Jaeger (Recommended)** ⭐⭐⭐⭐
  - Distributed tracing
  - APM solution
  - Span visualization
  - Installation: Docker image `jaegertracing/all-in-one`
  - Documentation: https://www.jaegertracing.io/

### AI Runtime

- **Ollama** ⭐⭐⭐⭐
  - Local LLM runtime
  - No API costs
  - GPU acceleration
  - Model management
  - Installation: Docker image `ollama/ollama`
  - Documentation: https://ollama.ai/

  Pre-configured Models:
  - Qwen2.5 Coder (7B, 32B)
  - Gemma2 (9B)
  - Qwen2-VL (Vision model)

  Installation:

  ```bash
  # Pull model
  ollama pull qwen2.5-coder:7b

  # Run server
  ollama serve
  ```

---

## 🤖 AI/ML SKILLS

### Large Language Models (LLMs)

- **Anthropic Claude** ⭐⭐⭐⭐⭐
  - Claude 3 Opus (most capable)
  - Claude 3 Sonnet (balanced)
  - Claude 3 Haiku (fast)
  - Documentation: https://docs.anthropic.com/
  - Pricing: ~$15/MTok (Opus), ~$3/MTok (Sonnet)

  Capabilities:
  - Context window: 200K tokens
  - Vision: Image analysis
  - Tool use: Function calling
  - JSON mode: Structured output
  - Streaming: Real-time output

- **OpenAI GPT-4** ⭐⭐⭐⭐⭐
  - GPT-4 Turbo (128K context)
  - GPT-4 (8K context)
  - GPT-3.5 Turbo (4K context)
  - Documentation: https://platform.openai.com/docs/
  - Pricing: ~$30/MTok (GPT-4 Turbo), ~$0.5/MTok (3.5)

  Capabilities:
  - Function calling
  - Vision: Image analysis
  - DALL-E 3: Image generation
  - Code execution simulation

- **Google Gemini** ⭐⭐⭐⭐
  - Gemini 2.0 Flash (latest)
  - Gemini Pro Vision
  - Documentation: https://ai.google.dev/
  - Pricing: Free tier available

  Capabilities:
  - Native multimodal
  - 1M token context
  - Code execution
  - Thinking mode

- **Groq LLaMA** ⭐⭐⭐⭐
  - LLaMA 2 (70B)
  - Mixtral (8x7B)
  - Very fast inference
  - Documentation: https://console.groq.com/
  - Pricing: Free tier available

- **Ollama Models** ⭐⭐⭐⭐
  - Qwen2.5 Coder: Code generation
  - Gemma2: General purpose
  - Qwen2-VL: Vision capabilities
  - Pricing: FREE (local)

### AI Agent Patterns

- **Tool Use/Function Calling**
  - Multiple tools per agent
  - Tool selection logic
  - Parameter binding
  - Result handling

- **Agentic Loops**
  - Think → Plan → Act → Observe
  - Error recovery
  - Max iteration limits
  - Context management

- **Agent Specialization**
  - Task routing
  - Domain-specific models
  - Load balancing
  - Fallback chains

---

## 🚀 DEVOPS/OPERATIONS

### Build & Deployment

- **Turbo 2.3.3** ⭐⭐⭐⭐⭐
  - Monorepo build orchestration
  - Caching across workspaces
  - Parallel execution
  - 5x faster rebuilds
  - Documentation: https://turbo.build/

  Features:
  - Task graph analysis
  - Remote caching
  - Incremental builds
  - Filtered execution

- **Turbopack** ⭐⭐⭐⭐⭐
  - Next-gen bundler
  - Rust-based
  - 20-40% faster bundling
  - Documentation: https://turbo.build/pack

- **Next.js Build** ⭐⭐⭐⭐⭐
  - Automatic code splitting
  - Image optimization
  - Font optimization
  - Static generation
  - On-demand ISR

### Environment Management

- **dotenv** ⭐⭐⭐⭐⭐
  - Environment variable loading
  - .env file support
  - Variable validation
  - Installation: Built into most tools

### Container Registry

- **Docker Hub** ⭐⭐⭐⭐
  - Public/private repositories
  - Automated builds
  - Webhooks
  - Documentation: https://hub.docker.com/

- **GitHub Container Registry** ⭐⭐⭐⭐
  - Integrated with GitHub
  - Free for public
  - Documentation: https://docs.github.com/en/packages

---

## 🧪 TESTING & QA

### Unit Testing

- **Vitest** ⭐⭐⭐⭐⭐
  - Jest-compatible API
  - ESM support
  - TypeScript support
  - Isolated test environment
  - Coverage reporting
  - Installation: `npm install -D vitest`
  - Documentation: https://vitest.dev/

  Commands:

  ```bash
  vitest run              # Run all tests
  vitest --ui            # UI explorer
  vitest --coverage      # Coverage report
  vitest --watch        # Watch mode
  ```

### E2E Testing

- **Playwright** ⭐⭐⭐⭐⭐
  - Cross-browser testing
  - Chromium, Firefox, WebKit
  - Visual regression
  - Accessibility testing
  - Installation: `npm install -D playwright`
  - Documentation: https://playwright.dev/

  Features:
  - Auto-wait for elements
  - Network interception
  - Device emulation
  - Screenshots & videos
  - Trace viewer

  Commands:

  ```bash
  playwright test         # Run tests
  playwright test --ui    # UI mode
  playwright codegen      # Generate tests
  playwright show-trace   # View traces
  ```

### Code Coverage

- **Coverage Reporter** ⭐⭐⭐⭐
  - Statement coverage
  - Branch coverage
  - Function coverage
  - Line coverage
  - Installation: Built into Vitest

---

## 🎯 PRODUCTIVITY TOOLS

### Code Quality

- **ESLint 9** ⭐⭐⭐⭐⭐
  - JavaScript/TypeScript linting
  - Rule engine
  - Plugin system
  - Auto-fix capabilities
  - Installation: `npm install -D eslint`
  - Documentation: https://eslint.org/

  Active Plugins:
  - eslint-plugin-next
  - eslint-plugin-react-hooks
  - eslint-plugin-unused-imports
  - eslint-plugin-promise

  Commands:

  ```bash
  eslint .                # Lint all files
  eslint . --fix          # Auto-fix
  eslint . --format json  # JSON output
  ```

- **Prettier 3.6.2** ⭐⭐⭐⭐⭐
  - Code formatter
  - Opinionated styling
  - Multi-language support
  - Consistency across team
  - Installation: `npm install -D prettier`
  - Documentation: https://prettier.io/

  Supported Formats:
  - JavaScript/TypeScript
  - JSON, YAML, Markdown
  - CSS, SCSS, Less
  - GraphQL, HTML

  Commands:

  ```bash
  prettier --write "**/*.{ts,tsx,json,md}"
  prettier --check "**/*.{ts,tsx,json,md}"
  ```

### Version Control Hooks

- **Husky 9.1.7** ⭐⭐⭐⭐
  - Git hooks automation
  - Pre-commit hooks
  - Pre-push hooks
  - Commit message validation
  - Installation: `npm install -D husky`
  - Documentation: https://typicode.github.io/husky/

  Hooks Used:
  - Pre-commit: Linting
  - Pre-push: Type checking
  - Commit-msg: Message validation

### Documentation

- **TypeScript Compiler** ⭐⭐⭐⭐
  - Type checking
  - Doc generation
  - Installation: `npm install -D typescript`

  Commands:

  ```bash
  tsc --noEmit          # Type check
  tsc --version         # Show version
  ```

---

## 🔌 EXTERNAL APIS & SERVICES

### GitHub

- **GitHub REST API** ⭐⭐⭐⭐⭐
  - Repository information
  - Issues, Pull Requests
  - Commits, Branches
  - Release management
  - Base URL: https://api.github.com

- **GitHub GraphQL API** ⭐⭐⭐⭐⭐
  - Advanced queries
  - Single request efficiency
  - Mutations support
  - Documentation: https://docs.github.com/en/graphql

### Vercel

- **Vercel Deployments API** ⭐⭐⭐⭐
  - Deployment management
  - Project configuration
  - Environment variables
  - Documentation: https://vercel.com/docs/api

- **Vercel Edge Runtime** ⭐⭐⭐⭐
  - Global function execution
  - Millisecond latency
  - Edge middleware

### AI Provider APIs

- **Anthropic API** ⭐⭐⭐⭐⭐
  - Base URL: https://api.anthropic.com
  - Authentication: API key in headers
  - Models endpoint: /v1/messages

- **OpenAI API** ⭐⭐⭐⭐⭐
  - Base URL: https://api.openai.com/v1
  - Authentication: Bearer token
  - Models endpoint: /models

- **Google AI API** ⭐⭐⭐⭐
  - Base URL: https://generativelanguage.googleapis.com
  - Authentication: API key
  - Models endpoint: /models

- **Groq API** ⭐⭐⭐⭐
  - Base URL: https://api.groq.com
  - Authentication: API key
  - Models endpoint: /models

---

## 🔗 REFERENCE URLS

### Documentation

| Resource     | URL                                 |
| ------------ | ----------------------------------- |
| Next.js      | https://nextjs.org/docs             |
| React        | https://react.dev                   |
| TypeScript   | https://www.typescriptlang.org/docs |
| Tailwind CSS | https://tailwindcss.com/docs        |
| PostgreSQL   | https://www.postgresql.org/docs     |
| Docker       | https://docs.docker.com             |
| Kubernetes   | https://kubernetes.io/docs          |

### API References

| Service        | URL                                |
| -------------- | ---------------------------------- |
| GitHub API     | https://docs.github.com/en/rest    |
| GitHub GraphQL | https://docs.github.com/en/graphql |
| Anthropic      | https://docs.anthropic.com         |
| OpenAI         | https://platform.openai.com/docs   |
| Google AI      | https://ai.google.dev/docs         |
| Groq           | https://console.groq.com/docs      |

### Tools & Platforms

| Tool       | URL                    |
| ---------- | ---------------------- |
| Turbo      | https://turbo.build    |
| Vitest     | https://vitest.dev     |
| Playwright | https://playwright.dev |
| ESLint     | https://eslint.org     |
| Prettier   | https://prettier.io    |
| Docker Hub | https://hub.docker.com |
| GitHub     | https://github.com     |

---

## 📊 PERFORMANCE BENCHMARKS

### Build Performance Targets

| Metric               | Target | Current | Status |
| -------------------- | ------ | ------- | ------ |
| Build Time           | <30s   | ~45s    | ⚠️     |
| Bundle Size          | <2MB   | ~2.5MB  | ⚠️     |
| Turbo Cache Hit Rate | >80%   | ~75%    | ⚠️     |
| Incremental Build    | <10s   | ~15s    | ⚠️     |

### Runtime Performance Targets

| Metric                         | Target | Current | Status |
| ------------------------------ | ------ | ------- | ------ |
| API Response                   | <200ms | ~150ms  | ✅     |
| FCP (First Contentful Paint)   | <1s    | ~1.2s   | ⚠️     |
| LCP (Largest Contentful Paint) | <2.5s  | ~1.8s   | ✅     |
| CLS (Cumulative Layout Shift)  | <0.1   | 0.05    | ✅     |
| Agent Latency                  | <1.5s  | ~2.5s   | ⚠️     |

### Infrastructure Performance

| Component      | Allocation | Utilization | Target |
| -------------- | ---------- | ----------- | ------ |
| PostgreSQL RAM | 8GB        | ~60%        | <70%   |
| PostgreSQL CPU | 4 cores    | ~30%        | <50%   |
| Redis RAM      | 4GB        | ~40%        | <60%   |
| Redis CPU      | -          | <20%        | <30%   |
| Nginx CPU      | -          | <10%        | <25%   |

### Scalability Targets

| Metric                   | Target         | Current | Status |
| ------------------------ | -------------- | ------- | ------ |
| Concurrent Agents        | 32             | 32      | ✅     |
| Concurrent Users         | 100+           | ~50     | ⚠️     |
| Requests/sec             | 1000+          | ~500    | ⚠️     |
| Message Queue Throughput | >1000 msgs/sec | ~800    | ⚠️     |
| Database Connections     | 200 max        | ~50     | ✅     |

---

## 🎓 LEARNING RESOURCES

### Frontend

- Next.js App Router: https://nextjs.org/learn/dashboard-app
- React Hooks: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs/handbook/

### Backend

- PostgreSQL: https://www.postgresql.org/docs/15/
- Drizzle ORM: https://orm.drizzle.team/
- Node.js: https://nodejs.org/docs/

### DevOps

- Docker: https://docs.docker.com/get-started/
- Kubernetes: https://kubernetes.io/docs/tutorials/
- Prometheus: https://prometheus.io/docs/

### AI/ML

- Anthropic: https://docs.anthropic.com/
- OpenAI: https://platform.openai.com/docs/
- LangChain: https://python.langchain.com/docs/

---

## 📱 Quick Commands Reference

### Development

```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

### Docker

```bash
# Start all services
pnpm docker:start

# Stop services
pnpm docker:stop

# View logs
pnpm docker:logs

# Check status
pnpm docker:status
```

### Database

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seeds

# Load fixtures
pnpm db:fixtures
```

### Build & Deploy

```bash
# Build production
pnpm build

# Start production server
pnpm start

# Analyze bundle
pnpm analyze

# Analyze web app
pnpm analyze:web
```

---

## 🎯 Skill Matrix

### Frontend Skills Required

- ⭐⭐⭐⭐⭐ Next.js & React
- ⭐⭐⭐⭐⭐ TypeScript
- ⭐⭐⭐⭐ Tailwind CSS
- ⭐⭐⭐⭐ Radix UI
- ⭐⭐⭐⭐ State Management (Jotai)
- ⭐⭐⭐⭐ Data Fetching (React Query)

### Backend Skills Required

- ⭐⭐⭐⭐⭐ TypeScript & Node.js
- ⭐⭐⭐⭐⭐ PostgreSQL & SQL
- ⭐⭐⭐⭐ Drizzle ORM
- ⭐⭐⭐⭐ REST APIs
- ⭐⭐⭐ OAuth & JWT
- ⭐⭐⭐ Redis & Caching

### DevOps Skills Required

- ⭐⭐⭐⭐⭐ Docker & Docker Compose
- ⭐⭐⭐⭐ Monitoring (Prometheus/Grafana)
- ⭐⭐⭐ Database Administration
- ⭐⭐⭐ CI/CD Pipelines
- ⭐⭐ Kubernetes (future)

### AI/ML Skills Optional

- ⭐⭐⭐ Prompt Engineering
- ⭐⭐⭐ API Integration
- ⭐⭐ Model Selection
- ⭐⭐ Cost Optimization

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Status**: Ready for Team Reference
