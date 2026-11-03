import { defineConfig } from 'vite';
import { whop } from '@whop/cli/vite';

// Static site: Whop hosting serves everything under dist/client.
export default defineConfig({
  plugins: [whop()],
  build: { outDir: 'dist/client', emptyOutDir: true },
});
