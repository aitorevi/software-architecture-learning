import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@projects': path.resolve(__dirname, './src/features/projects'),
      '@tasks': path.resolve(__dirname, './src/features/tasks'),
      '@tags': path.resolve(__dirname, './src/features/tags'),
    },
  },
});
