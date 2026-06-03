import { findTagConflicts } from './tagLinter.js';

/**
 * Check if new tags conflict with existing tags
 * @param {string[]} existingTags - Current tags in data.json (lowercase, trimmed)
 * @param {string} newTagsInput - Comma-separated input from form
 * @returns {Object} { hasConflicts: boolean, conflictingTags: string[], message: string, suggestions: Object }
 */
export function validateNewTags(existingTags, newTagsInput) {
  const normalizedExisting = existingTags.map(t => t.trim().toLowerCase());
  const newTags = newTagsInput
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  if (newTags.length === 0) {
    return { hasConflicts: false, conflictingTags: [], message: '', suggestions: {} };
  }

  // Check for conflicts between new tags themselves
  const internalConflicts = findTagConflicts(newTags);
  if (internalConflicts.length > 0) {
    const suggestions = {};
    for (const conflict of internalConflicts) {
      const wrongTag = conflict.tag1;
      const correctTag = conflict.tag2;
      suggestions[wrongTag] = correctTag;
    }
    const pairs = internalConflicts.map(c => `"${c.tag1}" → use "${c.tag2}" instead`).join('; ');
    return {
      hasConflicts: true,
      conflictingTags: newTags,
      message: `Tags conflict with each other: ${pairs}`,
      suggestions,
    };
  }

  // Check for conflicts with existing tags
  const allTags = [...normalizedExisting, ...newTags];
  const conflicts = findTagConflicts(allTags);

  if (conflicts.length === 0) {
    return { hasConflicts: false, conflictingTags: [], message: '', suggestions: {} };
  }

  // Filter to only conflicts involving new tags
  const newTagsSet = new Set(newTags);
  const relevantConflicts = conflicts.filter(
    c => newTagsSet.has(c.tag1) || newTagsSet.has(c.tag2)
  );

  if (relevantConflicts.length === 0) {
    return { hasConflicts: false, conflictingTags: [], message: '', suggestions: {} };
  }

  // Build suggestions: map wrong new tag to correct existing tag
  const suggestions = {};
  for (const conflict of relevantConflicts) {
    const isNewTag1 = newTagsSet.has(conflict.tag1);
    const wrongTag = isNewTag1 ? conflict.tag1 : conflict.tag2;
    const correctTag = isNewTag1 ? conflict.tag2 : conflict.tag1;

    // Only suggest if the wrong tag is from new input and correct is from existing
    if (newTagsSet.has(wrongTag) && normalizedExisting.includes(correctTag)) {
      suggestions[wrongTag] = correctTag;
    }
  }

  const suggestionList = Object.entries(suggestions)
    .map(([wrong, correct]) => `"${wrong}" → use "${correct}" instead`)
    .join('; ');

  const conflictingTags = [
    ...new Set(relevantConflicts.flatMap(c => [c.tag1, c.tag2]))
  ].filter(t => newTagsSet.has(t));

  return {
    hasConflicts: true,
    conflictingTags,
    message: `Tag conflict${Object.keys(suggestions).length !== 1 ? 's' : ''}: ${suggestionList}`,
    suggestions,
  };
}
