/**
 * Tag inflection linter — detects plural/gerund variants
 * Finds conflicts like: "fat" + "fats", "train" + "training"
 */

/**
 * Get potential inflection variants of a tag
 * @param {string} tag - The base tag
 * @returns {string[]} Array of potential variants
 */
function getVariants(tag) {
  const variants = new Set();

  // Plural variants (s, es)
  if (tag.endsWith('s')) {
    variants.add(tag.slice(0, -1)); // fats → fat
  } else {
    variants.add(tag + 's'); // fat → fats
    if (tag.endsWith('y')) {
      variants.add(tag.slice(0, -1) + 'ies'); // day → days
    } else if (['s', 'x', 'z', 'ch', 'sh'].some(ending => tag.endsWith(ending))) {
      variants.add(tag + 'es'); // box → boxes, buzz → buzzes
    }
  }

  // Gerund variants (ing)
  if (tag.endsWith('ing')) {
    // Remove 'ing' to get base form
    let base = tag.slice(0, -3);
    // Handle doubled consonants: running → run
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) {
      variants.add(base.slice(0, -1));
    }
    // Base form without -ing: training → train, baking → bake
    variants.add(base);
    // With 'e' added back: baking → bake
    variants.add(base + 'e');
  } else {
    // Add -ing forms
    // Case 1: word ends in 'e' → drop e and add 'ing': bake → baking
    if (tag.endsWith('e') && !tag.endsWith('ee')) {
      variants.add(tag.slice(0, -1) + 'ing');
    }
    // Case 2: short CVC word → double final consonant: run → running
    else if (
      tag.length > 1 &&
      /[aeiou][^aeiou]$/.test(tag) &&
      !['w', 'x', 'y'].includes(tag[tag.length - 1])
    ) {
      variants.add(tag + tag[tag.length - 1] + 'ing');
    }
    // Case 3: default → just add 'ing': train → training
    variants.add(tag + 'ing');
  }

  // Comparative/superlative (er, est) — only for short words
  if (tag.length <= 5 && !tag.endsWith('ed') && !tag.endsWith('ing')) {
    variants.add(tag + 'er');
    variants.add(tag + 'est');
  }

  // Remove self-reference and return as array
  variants.delete(tag);
  return Array.from(variants).filter(v => v.length > 0);
}

/**
 * Find inflection conflicts in tag set
 * @param {string[]} tags - Array of tags to check
 * @param {Object[]} [data] - Full data array with items. If provided, will track affected items.
 * @returns {Object[]} Array of conflict objects with structure:
 *   { tag1, tag2, type: 'plural'|'gerund'|'comparative', affectedItems?: { tag1: [], tag2: [] } }
 */
export function findTagConflicts(tags, data = []) {
  const conflicts = [];
  const reported = new Set(); // Track reported pairs to avoid duplicates

  for (const tag of tags) {
    const variants = getVariants(tag);

    for (const variant of variants) {
      if (!tags.includes(variant)) continue;

      // Create a canonical pair representation (sorted) to avoid duplicate reports
      const pair = [tag, variant].sort().join('|');
      if (reported.has(pair)) continue;
      reported.add(pair);

      // Determine conflict type
      let type = 'inflection';
      if (variant.endsWith('s') || tag.endsWith('s')) {
        type = 'plural';
      } else if (variant.endsWith('ing') || tag.endsWith('ing')) {
        type = 'gerund';
      } else if (variant.endsWith('er') || variant.endsWith('est')) {
        type = 'comparative';
      }

      const conflict = {
        tag1: tag,
        tag2: variant,
        type,
      };

      // If data provided, track which items use each tag
      if (data.length > 0) {
        const items1 = data
          .filter(item => item.topics && item.topics.includes(tag))
          .map(item => ({ id: item.id, title: item.title }));
        const items2 = data
          .filter(item => item.topics && item.topics.includes(variant))
          .map(item => ({ id: item.id, title: item.title }));

        if (items1.length > 0 || items2.length > 0) {
          conflict.affectedItems = { [tag]: items1, [variant]: items2 };
        }
      }

      conflicts.push(conflict);
    }
  }

  return conflicts;
}

/**
 * Report conflicts in human-readable format
 * @param {Object[]} conflicts - Array from findTagConflicts
 * @returns {string} Formatted report
 */
export function formatConflicts(conflicts) {
  if (conflicts.length === 0) {
    return '✓ No inflection conflicts found';
  }

  const byType = {};
  for (const conflict of conflicts) {
    if (!byType[conflict.type]) byType[conflict.type] = [];
    byType[conflict.type].push(conflict);
  }

  let report = `⚠️  Found ${conflicts.length} inflection conflict(s):\n\n`;

  for (const [type, items] of Object.entries(byType)) {
    report += `${type.toUpperCase()}\n`;
    for (const { tag1, tag2, affectedItems } of items) {
      report += `  • "${tag1}" ↔ "${tag2}"\n`;

      // Show affected items if available
      if (affectedItems) {
        if (affectedItems[tag1] && affectedItems[tag1].length > 0) {
          report += `    ${tag1} (${affectedItems[tag1].length}): ${affectedItems[tag1].map(i => `${i.title} (${i.id})`).join(', ')}\n`;
        }
        if (affectedItems[tag2] && affectedItems[tag2].length > 0) {
          report += `    ${tag2} (${affectedItems[tag2].length}): ${affectedItems[tag2].map(i => `${i.title} (${i.id})`).join(', ')}\n`;
        }
      }
    }
    report += '\n';
  }

  return report.trim();
}
