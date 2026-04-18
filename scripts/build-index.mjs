#!/usr/bin/env node
/**
 * Generate the root index.html for GitHub Pages with links to all prototypes.
 *
 * Usage: node scripts/build-index.mjs <outputDir>
 */

import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

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
    let lastUpdated = '';
    try {
      lastUpdated = execSync(`git log -1 --format=%cI -- "${d}"`, { cwd: root, encoding: 'utf-8' }).trim();
    } catch { /* no git history */ }
<<<<<<< HEAD
    return { id: d, description: pkg.description || d, lastUpdated };
=======
    const hasOntwerp = existsSync(join(root, d, 'ontwerp.html'));
    const hasPresentatie = existsSync(join(root, d, 'presentatie.html'));
    return { id: d, description: pkg.description || d, lastUpdated, hasOntwerp, hasPresentatie };
>>>>>>> 5495691 (feat: add ontwerp and presentatie action buttons per project)
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
    p.subtitle { color: #666; margin-bottom: 1.5rem; }
    .search-box { margin-bottom: 1.5rem; }
    .search-box input { width: 100%; max-width: 480px; padding: .75rem 1rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; outline: none; }
    .search-box input:focus { border-color: #0366d6; box-shadow: 0 0 0 3px rgba(3,102,214,.15); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .card { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15); }
    .card h2 { font-size: 1.1rem; margin-bottom: .5rem; }
    .card h2 a { color: #0366d6; text-decoration: none; }
    .card h2 a:hover { text-decoration: underline; }
    .card p { color: #666; font-size: .9rem; }
    .card .updated { color: #999; font-size: .8rem; margin-top: .5rem; }
    .card.hidden { display: none; }
    .card .actions { display: flex; gap: .5rem; margin-top: .75rem; flex-wrap: wrap; }
    .card .actions a { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .75rem; font-size: .8rem; font-weight: 500; border-radius: 5px; text-decoration: none; transition: background .15s, color .15s; }
    .card .actions .act-prototype { background: #e8f0fe; color: #0366d6; }
    .card .actions .act-prototype:hover { background: #0366d6; color: #fff; }
    .card .actions .act-ontwerp { background: #e6f9ef; color: #1a7f37; }
    .card .actions .act-ontwerp:hover { background: #1a7f37; color: #fff; }
    .card .actions .act-presentatie { background: #fff3e0; color: #b45309; }
    .card .actions .act-presentatie:hover { background: #b45309; color: #fff; }
  </style>
</head>
<body>
  <h1>Prototype Profit</h1>
  <p class="subtitle">Interactieve Podium JS mockups per project</p>
  <div class="search-box">
    <input type="search" id="search" placeholder="Zoek op projectnummer of omschrijving\u2026" autocomplete="off" />
  </div>
  <div class="grid" id="grid">
<<<<<<< HEAD
${projects.map(p => `    <div class="card" data-search="${p.id.toUpperCase()} ${p.description.toLowerCase()}">
      <h2><a href="${p.id}/menu">${p.id.toUpperCase()}</a></h2>
      <p>${p.description}</p>${p.lastUpdated ? `
      <p class="updated">Laatst bijgewerkt: <time datetime="${p.lastUpdated}">${new Date(p.lastUpdated).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}</time></p>` : ''}
    </div>`).join('\n')}
=======
${projects.map(p => {
    const actions = [
      `<a class="act-prototype" href="${p.id}/menu" target="_blank" rel="noopener">&#9654; Prototype</a>`,
    ];
    if (p.hasOntwerp) {
      actions.push(`<a class="act-ontwerp" href="${p.id}/ontwerp.html" target="_blank" rel="noopener">&#128196; Ontwerp</a>`);
    }
    if (p.hasPresentatie) {
      actions.push(`<a class="act-presentatie" href="${p.id}/presentatie.html" target="_blank" rel="noopener">&#127916; Presentatie</a>`);
    }
    return `    <div class="card" data-search="${p.id.toUpperCase()} ${p.description.toLowerCase()}">
      <h2>${p.id.toUpperCase()}</h2>
      <p>${p.description}</p>${p.lastUpdated ? `
      <p class="updated">Laatst bijgewerkt: <time datetime="${p.lastUpdated}">${new Date(p.lastUpdated).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}</time></p>` : ''}
      <div class="actions">${actions.join('')}</div>
    </div>`;
  }).join('\n')}
>>>>>>> 5495691 (feat: add ontwerp and presentatie action buttons per project)
  </div>
  <script>
    document.getElementById('search').addEventListener('input', function() {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.card').forEach(function(card) {
        card.classList.toggle('hidden', q && card.dataset.search.toLowerCase().indexOf(q) === -1);
      });
    });
  </script>
</body>
</html>`;

writeFileSync(join(outputDir, 'index.html'), html);

// Generate root 404.html for SPA routing across prototypes
const html404 = `<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body>
  <script>
    // SPA redirect for GitHub Pages
    // Determines which prototype the user wants and redirects to its index.html
    var segments = window.location.pathname.split('/').filter(Boolean);
    // segments[0] = 'prototype-profit' (repo name)
    // segments[1] = prototype name (rpt00692, rpt00701, rfi00731)
    // segments[2+] = SPA route
    if (segments.length >= 2) {
      var route = '/' + segments.slice(2).join('/');
      sessionStorage.setItem('spa-redirect', route + window.location.search);
      window.location.replace('/' + segments.slice(0, 2).join('/') + '/');
    }
  </script>
</body>
</html>`;
writeFileSync(join(outputDir, '404.html'), html404);

console.log(`Generated root index.html and 404.html with ${projects.length} prototypes`);
