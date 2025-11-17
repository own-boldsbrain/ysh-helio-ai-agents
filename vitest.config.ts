import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['apps/web/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'apps/web/.next'],
    environment: 'jsdom',
    setupFiles: ['./apps/web/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8', // Use v8 for coverage since it's built-in
      reporter: ['text', 'json', 'html'],
      include: ['apps/web/lib/**/*.{ts,tsx}', 'apps/web/components/**/*.{ts,tsx}', 'apps/web/app/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/tests/**',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/e2e/**',
        '**/types/**',
        '**/index.ts', // Often just exports
        '**/*.d.ts', // Type definition files
        '**/constants.ts', // Just constants
        '**/types.ts', // Just types
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      // Map `@` to the web app package for tests that run in `apps/web`
      '@': path.resolve(__dirname, 'apps/web'),
      // Provide a root alias in case other tests/modules need to import from repo root
      '@root': path.resolve(__dirname),
      // Mock Next.js server-only import for test environment
      'server-only': path.resolve(__dirname, 'apps/web/test/mocks/server-only.ts'),
      'next/server': path.resolve(__dirname, 'apps/web/test/mocks/next-server.ts'),
    },
  },
})
