import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEntry } from './validateEntry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../content');
const dataFile = path.join(__dirname, '../src/data.json');

const errors = [];
const warnings = [];

function lintFile(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(content)) {
      errors.push(`${path.basename(filePath)}: Root must be an array`);
      return [];
    }
    return content;
  } catch (e) {
    errors.push(`${path.basename(filePath)}: Invalid JSON — ${e.message}`);
    return [];
  }
}

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
const allEntries = [];
const idMap = new Map();
const urlMap = new Map();
const seriesMap = new Map();

files.forEach(file => {
  const entries = lintFile(path.join(contentDir, file));

  entries.forEach(entry => {
    errors.push(...validateEntry(entry, file));
    allEntries.push(entry);

    if (idMap.has(entry.id)) {
      errors.push(`Duplicate ID "${entry.id}" found in ${file} and ${idMap.get(entry.id)}`);
    } else {
      idMap.set(entry.id, file);
    }

    if (entry.url) {
      if (urlMap.has(entry.url)) {
        errors.push(`Duplicate URL found in "${file}" (${entry.id}) and "${urlMap.get(entry.url)}" — same video cannot appear twice`);
      } else {
        urlMap.set(entry.url, `${file} (${entry.id})`);
      }
    }

    if (entry.series?.name && entry.series?.order !== undefined) {
      const seriesKey = `${entry.author?.name}---${entry.series.name}`;
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      const existing = seriesMap.get(seriesKey);
      if (existing.some(e => e.order === entry.series.order)) {
        const other = existing.find(e => e.order === entry.series.order);
        errors.push(`Series "${entry.series.name}" by "${entry.author?.name}": Episode ${entry.series.order} appears twice (${entry.id} and ${other.id})`);
      }
      existing.push({ id: entry.id, order: entry.series.order });
    }
  });
});

if (fs.existsSync(dataFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    if (!Array.isArray(data)) {
      errors.push('src/data.json: Root must be an array');
    }
  } catch (e) {
    warnings.push(`src/data.json: Could not validate (will be regenerated) — ${e.message}`);
  }
}

console.log('\n📋 Vitalio Data Linter\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed!\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`❌ ${errors.length} error(s) found:\n`);
  errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  console.log();
}

if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warning(s):\n`);
  warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  console.log();
}

process.exit(errors.length > 0 ? 1 : 0);
