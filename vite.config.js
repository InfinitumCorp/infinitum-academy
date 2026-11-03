import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { whop } from '@whop/cli/vite';

// Static site on Whop hosting: index.html and public/ build to dist/client,
// and a tiny worker (src/worker.js) in dist/server serves them.
export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), whop()],
  environments: {
    ssr: { build: { outDir: 'dist/server' } },
    client: { build: { outDir: 'dist/client' } },
  },
});
