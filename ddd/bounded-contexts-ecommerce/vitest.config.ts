import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@catalog': path.resolve(__dirname, './src/catalog-context'),
      '@sales': path.resolve(__dirname, './src/sales-context'),
      '@shipping': path.resolve(__dirname, './src/shipping-context'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
