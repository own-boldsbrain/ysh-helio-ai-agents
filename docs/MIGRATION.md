# Migration Guide: Single App to Monorepo

This guide explains the migration from a single Next.js app to a Turborepo monorepo structure.

## Architecture Changes

### Before (Single App)

```tsx
coding-agent-template/
├── app/
├── components/
├── lib/
├── package.json
└── next.config.ts
```

### After (Monorepo)

```tsx
coding-agent-template/
├── apps/
│   ├── web/                    # Next.js app (migrated)
│   ├── playground-vite/        # Vite playground with Monaco + Tremor
│   └── lab-ladle/              # Ladle component stories
├── packages/
│   ├── ui/                     # Shared UI components (future)
│   └── tsconfig/               # Shared TypeScript configs
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace config
└── package.json                # Root package.json
```

## Key Features Added

### 1. Turborepo

- **Parallel builds** across all apps
- **Task caching** for faster subsequent builds
- **Remote caching** support for CI/CD
- **Task pipelines** with proper dependencies

### 2. Vite Playground (`apps/playground-vite`)

- Monaco Editor integration for live coding
- Tremor charts for data visualization
- Hot Module Replacement (HMR)
- Runs on port 3001

### 3. Ladle Stories (`apps/lab-ladle`)

- Component development environment
- Faster than Storybook
- Vite-powered
- Runs on port 3002

### 4. TanStack Query

- Server state management
- Automatic caching and revalidation
- DevTools for debugging
- Optimistic updates support

### 5. Vitest + Testing Library

- Fast unit testing with Vitest
- Component testing with Testing Library
- Coverage reporting
- UI mode for debugging

### 6. ESLint Enhancements

- `eslint-plugin-import` - Import/export linting
- `eslint-plugin-unused-imports` - Remove unused imports
- `eslint-plugin-promise` - Promise best practices

### 7. Bundle Analysis

- Next.js Bundle Analyzer
- Rollup Visualizer for Vite
- Performance monitoring tools

## Migration Steps

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Build All Apps

```bash
pnpm build
```

### Step 3: Run Development Servers

**All apps:**

```bash
pnpm dev
```

**Individual apps:**

```bash
# Next.js app (port 3000)
pnpm --filter @repo/web dev

# Vite playground (port 3001)
pnpm --filter @repo/playground-vite dev

# Ladle stories (port 3002)
pnpm --filter @repo/lab-ladle dev
```

### Step 4: Run Tests

```bash
pnpm test
```

### Step 5: Type Check

```bash
pnpm type-check
```

### Step 6: Lint Code

```bash
pnpm lint
```

## Environment Variables

The Next.js app (`apps/web`) uses the same environment variables as before:

```bash
# Copy from root
cp .env.example apps/web/.env.local
# or symlink
ln -s ../../.env.local apps/web/.env.local
```

## Scripts Reference

### Root Scripts

```bash
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm type-check       # Type check all apps
pnpm format           # Format all code
pnpm analyze          # Analyze all bundles
```

### App-Specific Scripts

```bash
# Next.js Web App
pnpm --filter @repo/web dev
pnpm --filter @repo/web build
pnpm --filter @repo/web test
pnpm --filter @repo/web analyze

# Vite Playground
pnpm --filter @repo/playground-vite dev
pnpm --filter @repo/playground-vite build
pnpm --filter @repo/playground-vite analyze

# Ladle Stories
pnpm --filter @repo/lab-ladle dev
pnpm --filter @repo/lab-ladle build
```

## TanStack Query Integration

### Query Client Setup

Already configured in `apps/web/components/providers/query-provider.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
```

### Usage Example

```typescript
import { useQuery } from '@tanstack/react-query'

function TodoList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      return res.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

## Testing Guide

### Unit Tests (Vitest)

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary')
  })
})
```

### Component Tests (Testing Library)

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Performance Optimization

See [`docs/PERFORMANCE.md`](./PERFORMANCE.md) for detailed performance optimization strategies.

Quick tips:

- Use `next/dynamic` for code splitting
- Lazy load Monaco Editor
- Enable Turbo remote caching
- Run bundle analysis regularly
- Monitor Core Web Vitals

## Troubleshooting

### Port Conflicts

If ports are already in use:

- Next.js (3000): Edit `apps/web/next.config.ts`
- Vite (3001): Edit `apps/playground-vite/vite.config.ts`
- Ladle (3002): Edit `apps/lab-ladle/.ladle/config.mjs`

### Build Failures

```bash
# Clean all build outputs
rm -rf apps/*/dist apps/*/.next apps/*/.turbo

# Clear Turbo cache
pnpm dlx turbo clean

# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
pnpm install
```

### Type Errors

```bash
# Rebuild TypeScript project references
pnpm type-check
```

### Test Failures

```bash
# Run tests in UI mode for debugging
pnpm --filter @repo/web test:ui
```

## Next Steps

### 1. Create Shared UI Package

```bash
mkdir -p packages/ui
# Move shared components to packages/ui
```

### 2. Setup Remote Caching

```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

### 3. Add More Tests

- Increase test coverage to > 80%
- Add E2E tests with Playwright
- Add visual regression tests

### 4. Optimize Bundle Sizes

```bash
pnpm analyze
# Review bundle composition
# Remove unused dependencies
```

### 5. Setup CI/CD

- GitHub Actions with Turbo cache
- Deploy to Vercel
- Run tests on PR

## Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Ladle](https://ladle.dev/)
