#!/usr/bin/env node
/**
 * Generate the SPA HTML shell (index.html) for a static prototype deployment.
 * Also generates a fetch interceptor that redirects /api/* to static .json files.
 *
 * Usage: node scripts/build-spa-shell.mjs <outputDir>
 */

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = process.argv[2];
if (!outputDir) {
  console.error('Usage: node scripts/build-spa-shell.mjs <outputDir>');
  process.exit(1);
}

// Find PodiumJS entrypoint
const podiumDir = join(outputDir, 'podium-js');
const entrypoint = readdirSync(podiumDir).find(f => f.match(/^podium-js\..*\.js$/));

if (!entrypoint) {
  console.error('PodiumJS entrypoint not found in', podiumDir);
  process.exit(1);
}

const html = `<!doctype html>
<html>
  <head>
    <title>Podium Application</title>
    <base href="./" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link type="image/png" rel="icon" sizes="48x48" href="podium-js/favicon.png" />
  </head>
  <body>
    <div id="loading">Loading...</div>
    <script type="module">
      // Intercept fetch calls to /api/* and serve static JSON files instead
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.startsWith('/api/') || url.match(/^\\.?\\/api\\//)) {
          // Normalize to relative path and append .json
          const apiPath = url.replace(/^\\.?\\//, '');
          const jsonUrl = apiPath + '.json';
          return originalFetch(jsonUrl, { ...init, method: 'GET' }).then(resp => {
            if (resp.ok) return resp;
            // If .json not found, return empty ok response for PATCH/POST
            return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
          });
        }
        return originalFetch(input, init);
      };

      const afasAppConfig = {
        applicationName: 'Podium Application',
        podiumJsUrl: 'podium-js/',
        menuServiceUrl: 'pages/_services/menu',
        spotlightServiceUrl: 'pages/_services/spotlight'
      };

      import('podium-js/${entrypoint}').then(module => {
        if (module && typeof module.default === 'function') {
          module.default(window, afasAppConfig).then(() => {
            const el = document.getElementById('loading');
            if (el) el.remove();
          }).catch(err => {
            console.error('Error initializing PodiumJS:', err);
          });
        }
      }).catch(err => {
        console.error('Error importing PodiumJS:', err);
        const el = document.getElementById('loading');
        if (el) el.textContent = 'Error loading application.';
      });
    </script>
  </body>
</html>`;

writeFileSync(join(outputDir, 'index.html'), html);
console.log(`  Generated index.html (entrypoint: ${entrypoint})`);
