// Tag autocomplete helpers for the contribution form topics/tags field.
// Used to suggest existing tags as user types and handle tag suggestion application.

/**
 * Extract all suggestions for the current incomplete tag being typed
 * @param {string} inputValue - Current topics input (may contain partial tag at end)
 * @param {string[]} allAvailableTags - All existing tags from data.json
 * @returns {Object} { completedTags: string[], currentInput: string, suggestions: string[] }
 */
export function getTagSuggestions(inputValue, allAvailableTags) {
  // Split by comma to get list of tags
  const parts = inputValue.split(',').map(p => p.trim());
  const completedTags = parts.slice(0, -1); // All completed tags
  const currentInput = parts[parts.length - 1]; // Current incomplete tag

  if (!currentInput) {
    return { completedTags, currentInput, suggestions: [] };
  }

  // Filter available tags that start with current input (case-insensitive)
  const lowerInput = currentInput.toLowerCase();
  const suggestions = allAvailableTags.filter(tag => {
    const lowerTag = tag.toLowerCase();
    // Don't suggest tags already in the list
    const alreadyUsed = completedTags.some(t => t.toLowerCase() === lowerTag);
    return lowerTag.startsWith(lowerInput) && !alreadyUsed;
  });

  return { completedTags, currentInput, suggestions };
}

/**
 * Replace the current incomplete tag with a suggestion
 * @param {string} inputValue - Current topics input
 * @param {string} suggestion - The tag to insert
 * @returns {string} Updated input with suggestion added
 */
export function applyTagSuggestion(inputValue, suggestion) {
  const parts = inputValue.split(',').map(p => p.trim());
  // Replace the last incomplete tag with the suggestion
  parts[parts.length - 1] = suggestion;
  // Append trailing ", " to encourage adding more tags (UX improvement)
  return parts.join(', ') + ', ';
}
