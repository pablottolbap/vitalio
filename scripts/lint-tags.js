#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findTagConflicts, formatConflicts } from '../src/tagLinter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../src/data.json');

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Extract all unique tags
  const allTags = new Set();
  for (const item of data) {
    if (Array.isArray(item.topics)) {
      for (const topic of item.topics) {
        // Normalize: trim whitespace
        const normalized = topic.trim().toLowerCase();
        if (normalized) allTags.add(normalized);
      }
    }
  }

  const tags = Array.from(allTags).sort();
  console.log(`\nAnalyzing ${tags.length} unique tags...\n`);
  console.log('Tags:', tags.join(', '));
  console.log('\n' + '='.repeat(60) + '\n');

  // Find conflicts and pass data to track affected items
  const conflicts = findTagConflicts(tags, data);
  console.log(formatConflicts(conflicts));

  // Exit with error code if conflicts found (for CI)
  if (conflicts.length > 0) {
    process.exit(1);
  }
} catch (err) {
  console.error('Error running tag linter:', err.message);
  process.exit(1);
}
