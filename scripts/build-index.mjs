#!/usr/bin/env node
/**
 * Generate the root index.html for GitHub Pages with links to all prototypes.
 *
 * Usage: node scripts/build-index.mjs <outputDir>
 */

import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = process.argv[2];
if (!outputDir) {
  console.error('Usage: node scripts/build-index.mjs <outputDir>');
  process.exit(1);
}

// Find all project directories (have package.json)
const root = process.cwd();
const projects = readdirSync(root)
  .filter(d => !d.startsWith('.') && !d.startsWith('_') && d !== 'scripts' && d !== 'node_modules')
  .filter(d => existsSync(join(root, d, 'package.json')))
  .map(d => {
    const pkg = JSON.parse(readFileSync(join(root, d, 'package.json'), 'utf-8'));
    return { id: d, description: pkg.description || d };
  });

const html = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Prototype Profit</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 2rem; }
    h1 { margin-bottom: 0.5rem; }
    p.subtitle { color: #666; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .card { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15); }
    .card h2 { font-size: 1.1rem; margin-bottom: .5rem; }
    .card h2 a { color: #0366d6; text-decoration: none; }
    .card h2 a:hover { text-decoration: underline; }
    .card p { color: #666; font-size: .9rem; }
  </style>
</head>
<body>
  <h1>Prototype Profit</h1>
  <p class="subtitle">Interactieve Podium JS mockups per project</p>
  <div class="grid">
${projects.map(p => `    <div class="card">
      <h2><a href="${p.id}/">${p.id.toUpperCase()}</a></h2>
      <p>${p.description}</p>
    </div>`).join('\n')}
  </div>
</body>
</html>`;

writeFileSync(join(outputDir, 'index.html'), html);
console.log(`Generated root index.html with ${projects.length} prototypes`);
