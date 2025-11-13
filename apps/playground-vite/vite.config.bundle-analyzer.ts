import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          monaco: ['@monaco-editor/react', 'monaco-editor'],
          tremor: ['@tremor/react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
  server: {
    port: 3001,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@monaco-editor/react', '@tremor/react'],
  },
})
