#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../src/locales');

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(/^\s*([a-zA-Z0-9_]+):/gm)];
  return new Set(matches.map((m) => m[1]));
}

const enPath = path.join(localesDir, 'en.ts');
const trPath = path.join(localesDir, 'tr.ts');
const esPath = path.join(localesDir, 'es.ts');

const enKeys = extractKeys(enPath);
const trKeys = extractKeys(trPath);
const esKeys = extractKeys(esPath);

console.log(`[i18n] Extracted keys: EN (${enKeys.size}), TR (${trKeys.size}), ES (${esKeys.size})`);

const missingInTr = [...enKeys].filter((k) => !trKeys.has(k));
const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
const extraInTr = [...trKeys].filter((k) => !enKeys.has(k));
const extraInEs = [...esKeys].filter((k) => !enKeys.has(k));

let hasErrors = false;

if (missingInTr.length > 0) {
  console.error(`❌ [i18n] Missing keys in Turkish (tr.ts):`, missingInTr);
  hasErrors = true;
}
if (missingInEs.length > 0) {
  console.error(`❌ [i18n] Missing keys in Spanish (es.ts):`, missingInEs);
  hasErrors = true;
}
if (extraInTr.length > 0) {
  console.error(`❌ [i18n] Extra keys in Turkish (tr.ts) not in en.ts:`, extraInTr);
  hasErrors = true;
}
if (extraInEs.length > 0) {
  console.error(`❌ [i18n] Extra keys in Spanish (es.ts) not in en.ts:`, extraInEs);
  hasErrors = true;
}

if (hasErrors) {
  console.error(`❌ [i18n] Translation key parity check FAILED.`);
  process.exit(1);
} else {
  console.log(`✅ [i18n] 100% Translation Key Parity verified across all supported languages (en, tr, es)!`);
  process.exit(0);
}
