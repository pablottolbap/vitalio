import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vitalio/',
  test: {
    globals: true,
    pool: 'forks',
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}', 'scripts/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        '**/*.test.*',
      ],
      thresholds: {
        lines: 60,
        functions: 40,
        branches: 55,
        statements: 55,
      },
    },
  },
})
