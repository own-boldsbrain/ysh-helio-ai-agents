import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@root': path.resolve(__dirname, '..', '..'),
      'server-only': path.resolve(__dirname, 'test/mocks/server-only.ts'),
      'next/server': path.resolve(__dirname, 'test/mocks/next-server.ts'),
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', '**/*.config.*', '**/*.d.ts', '**/dist/**', '**/.next/**'],
    },
  },
})
