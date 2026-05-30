import { describe, it, expect } from 'vitest';
import { validateEntry } from '../scripts/validateEntry.js';

const VALID_ENTRY = {
  id: 'channel-1',
  type: 'video',
  title: 'Test Title',
  url: 'https://www.youtube.com/watch?v=abc123',
  language: 'PL',
  author: {
    name: 'Test Channel',
    channelUrl: 'https://www.youtube.com/@testchannel',
  },
  topics: ['diet'],
};

describe('validateEntry', () => {
  it('returns no errors for a valid video entry', () => {
    expect(validateEntry(VALID_ENTRY, 'test.json')).toHaveLength(0);
  });

  it('accepts podcast and qa as valid types', () => {
    expect(validateEntry({ ...VALID_ENTRY, type: 'podcast' }, 'test.json')).toHaveLength(0);
    expect(validateEntry({ ...VALID_ENTRY, type: 'qa' }, 'test.json')).toHaveLength(0);
  });

  it('reports missing id', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.id;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'id'"))).toBe(true);
  });

  it('reports missing type', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.type;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'type'"))).toBe(true);
  });

  it('reports invalid type value', () => {
    const errors = validateEntry({ ...VALID_ENTRY, type: 'interview' }, 'test.json');
    expect(errors.some(e => e.includes('Invalid type "interview"'))).toBe(true);
  });

  it('reports missing title', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.title;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'title'"))).toBe(true);
  });

  it('reports missing url', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.url;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'url'"))).toBe(true);
  });

  it('reports missing language', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.language;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'language'"))).toBe(true);
  });

  it('reports missing author.name', () => {
    const entry = { ...VALID_ENTRY, author: { channelUrl: 'https://www.youtube.com/@ch' } };
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'author.name'"))).toBe(true);
  });

  it('reports missing author.channelUrl', () => {
    const entry = { ...VALID_ENTRY, author: { name: 'Chan' } };
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'author.channelUrl'"))).toBe(true);
  });

  it('reports missing topics', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.topics;
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'topics'"))).toBe(true);
  });

  it('reports empty topics array', () => {
    const errors = validateEntry({ ...VALID_ENTRY, topics: [] }, 'test.json');
    expect(errors.some(e => e.includes("Missing required field 'topics'"))).toBe(true);
  });

  it('reports invalid video URL format', () => {
    const errors = validateEntry({ ...VALID_ENTRY, url: 'https://youtu.be/abc' }, 'test.json');
    expect(errors.some(e => e.includes('Invalid video URL format'))).toBe(true);
  });

  it('accepts valid YouTube watch URL', () => {
    const errors = validateEntry(VALID_ENTRY, 'test.json');
    expect(errors.some(e => e.includes('Invalid video URL format'))).toBe(false);
  });

  it('reports invalid channel URL format', () => {
    const entry = {
      ...VALID_ENTRY,
      author: { name: 'Chan', channelUrl: 'https://www.youtube.com/c/chan' },
    };
    const errors = validateEntry(entry, 'test.json');
    expect(errors.some(e => e.includes('Invalid channel URL format'))).toBe(true);
  });

  it('includes the file name and entry id in error messages', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.title;
    const errors = validateEntry(entry, 'my_channel.json');
    expect(errors[0]).toContain('my_channel.json');
    expect(errors[0]).toContain(VALID_ENTRY.id);
  });

  it('uses (no id) in prefix when id is missing', () => {
    const entry = { ...VALID_ENTRY };
    delete entry.id;
    const errors = validateEntry(entry, 'test.json');
    expect(errors[0]).toContain('(no id)');
  });
});
