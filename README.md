# Infinitum Academy

The marketing site for Infinitum Academy, served at https://infinitum-academy.whop.site/.

It is a single static page (`index.html`) with its images in `public/`. Vite builds it, and a small Cloudflare-style worker (`src/worker.js`) serves the built files on Whop's hosting.

## Develop

```bash
npm install
npx vite build
```

The build lands in `dist/client` (the page and assets) and `dist/server` (the worker), and the Whop plugin packs both into `dist/whop-build.zip`.

## Deploy

```bash
whop apps deploy --app app_606yNXeZxfqLhv --preview --skip_typecheck --dir .
whop apps builds promote <build id>
```

The first command uploads a preview build and prints its id. The second makes that build the live site.

## Sign-in

The header carries the Cumulus://ID account bar (`https://id.cumuluscloud.app/id/bar.js`, client `academy`): **Sign in** (and **Create a Cumulus://ID** on wide screens), then the account menu and Infinitum product launcher. The page's origin, `https://infinitum-academy.whop.site`, must be registered for `academy` in InfinitumCorp/cumulus-id `src/clients.ts`.
