#!/usr/bin/env node
/**
 * Scrape all API endpoints from a running backend and save as static JSON files.
 *
 * Usage: node scripts/scrape-api.mjs <baseUrl> <outputDir> <prefix>
 */

const [,, baseUrl, outputDir, prefix] = process.argv;

if (!baseUrl || !outputDir || !prefix) {
  console.error('Usage: node scripts/scrape-api.mjs <baseUrl> <outputDir> <prefix>');
  process.exit(1);
}

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Extract API paths from Program.cs
const programCs = readFileSync(join(prefix, 'backend', 'Program.cs'), 'utf-8');
const apiPattern = /app\.Map(?:Get|Post|Put|Patch|Delete)\("(\/api\/[^"]+)"/g;
const endpoints = [];
let match;
while ((match = apiPattern.exec(programCs)) !== null) {
  endpoints.push(match[1]);
}

console.log(`  Scraping ${endpoints.length} API endpoints...`);

for (const endpoint of endpoints) {
  try {
    const resp = await fetch(`${baseUrl}${endpoint}`);
    if (resp.ok) {
      const data = await resp.text();
      // Convert /api/foo/bar to api/foo/bar.json
      const relativePath = endpoint.slice(1); // remove leading /
      const filePath = join(outputDir, '..', relativePath + '.json');
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, data);
      console.log(`    ✓ ${endpoint}`);
    } else {
      console.warn(`    ✗ ${endpoint} (${resp.status})`);
    }
  } catch (err) {
    console.warn(`    ✗ ${endpoint} (${err.message})`);
  }
}
