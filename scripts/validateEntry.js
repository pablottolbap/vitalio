export function validateEntry(entry, file) {
  const errors = [];
  const prefix = `${file}: Entry "${entry.id || '(no id)'}"`;

  if (!entry.id) errors.push(`${prefix}: Missing required field 'id'`);
  if (!entry.type) errors.push(`${prefix}: Missing required field 'type'`);
  if (!['video', 'podcast', 'qa'].includes(entry.type)) {
    errors.push(`${prefix}: Invalid type "${entry.type}" (must be "video", "podcast", or "qa")`);
  }
  if (!entry.title) errors.push(`${prefix}: Missing required field 'title'`);
  if (!entry.url) errors.push(`${prefix}: Missing required field 'url'`);
  if (!entry.language) errors.push(`${prefix}: Missing required field 'language'`);
  if (!entry.author?.name) errors.push(`${prefix}: Missing required field 'author.name'`);
  if (!entry.author?.channelUrl) errors.push(`${prefix}: Missing required field 'author.channelUrl'`);
  if (!Array.isArray(entry.topics) || entry.topics.length === 0) {
    errors.push(`${prefix}: Missing required field 'topics' (must be non-empty array)`);
  }

  if (entry.url && !entry.url.startsWith('https://www.youtube.com/watch?v=')) {
    errors.push(`${prefix}: Invalid video URL format (must start with https://www.youtube.com/watch?v=)`);
  }
  if (entry.author?.channelUrl && !entry.author.channelUrl.startsWith('https://www.youtube.com/@')) {
    errors.push(`${prefix}: Invalid channel URL format (must start with https://www.youtube.com/@)`);
  }

  return errors;
}
