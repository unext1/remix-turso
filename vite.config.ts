import { vitePlugin as remix } from '@remix-run/dev';
import { remixDevTools } from 'remix-development-tools';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { installGlobals } from '@remix-run/node';
import { remixRoutes } from 'remix-routes/vite';

import remixConfig from './remix.config.mjs';

installGlobals();

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [remixDevTools(), remix(remixConfig), remixRoutes(), tsconfigPaths()]
});
