#!/usr/bin/env node
/**
 * Validates the leaderboard data for structural integrity.
 * Run with: npm run data:check
 */
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync(new URL('../src/data/leaderboard.json', import.meta.url), 'utf-8'));

let errors = 0;
const warn = (msg) => { console.warn(`⚠️  ${msg}`); };
const fail = (msg) => { console.error(`❌ ${msg}`); errors++; };

// Required top-level fields
for (const f of ['asOf', 'generatedAt', 'sources', 'models']) {
  if (!(f in data)) fail(`Missing top-level field: ${f}`);
}

// Sources
const sourceIds = new Set();
for (const s of data.sources) {
  if (sourceIds.has(s.id)) fail(`Duplicate source id: ${s.id}`);
  sourceIds.add(s.id);
  for (const f of ['id', 'name', 'url', 'focus', 'color', 'metricLabel', 'range']) {
    if (!(f in s)) fail(`Source ${s.id} missing field: ${f}`);
  }
}
console.log(`✓ ${data.sources.length} sources validated`);

// Models
const modelIds = new Set();
for (const m of data.models) {
  if (modelIds.has(m.id)) fail(`Duplicate model id: ${m.id}`);
  modelIds.add(m.id);
  for (const f of ['id', 'name', 'provider', 'release', 'license', 'modalities', 'context', 'pricing', 'speed', 'sources']) {
    if (!(f in m)) fail(`Model ${m.id} missing field: ${f}`);
  }
  if (!['open', 'proprietary'].includes(m.license)) fail(`Model ${m.id} invalid license: ${m.license}`);
  if (typeof m.context !== 'number' || m.context <= 0) warn(`Model ${m.id} has unusual context: ${m.context}`);
  if (m.pricing.input !== null && m.pricing.input < 0) fail(`Model ${m.id} negative input price`);
  if (m.pricing.output !== null && m.pricing.output < 0) fail(`Model ${m.id} negative output price`);
  for (const s of m.sources) {
    if (!sourceIds.has(s.id)) fail(`Model ${m.id} references unknown source: ${s.id}`);
  }
}

console.log(`✓ ${data.models.length} models validated`);
console.log(`  - ${data.models.filter((m) => m.license === 'open').length} open / ${data.models.filter((m) => m.license === 'proprietary').length} proprietary`);
console.log(`  - ${data.models.filter((m) => m.sources.length > 0).length} with source data`);

if (errors) {
  console.error(`\n❌ ${errors} error(s) found.`);
  process.exit(1);
}
console.log('\n✅ All data valid!');
