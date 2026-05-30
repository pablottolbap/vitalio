import { describe, it, expect } from 'vitest';
import { validateVideoUrl, validateChannelUrl, splitList } from './validators.js';

describe('validateVideoUrl', () => {
  it('returns null for a valid YouTube watch URL', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('accepts an 11-character video ID', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=12345678901')).toBeNull();
  });

  it('returns an error for a youtu.be shortlink', () => {
    expect(validateVideoUrl('https://youtu.be/dQw4w9WgXcQ')).not.toBeNull();
  });

  it('returns an error for a non-YouTube URL', () => {
    expect(validateVideoUrl('https://vimeo.com/123456')).not.toBeNull();
  });

  it('returns an error when the video ID is missing', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=')).not.toBeNull();
  });

  it('returns an error when the video ID is too short', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=short')).not.toBeNull();
  });

  it('returns an error for a bare YouTube channel URL', () => {
    expect(validateVideoUrl('https://www.youtube.com/@channel')).not.toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validateVideoUrl('')).not.toBeNull();
  });
});

describe('validateChannelUrl', () => {
  it('returns null for a valid YouTube @-handle URL', () => {
    expect(validateChannelUrl('https://www.youtube.com/@MyChannel')).toBeNull();
  });

  it('returns an error for a /c/ style URL', () => {
    expect(validateChannelUrl('https://www.youtube.com/c/MyChannel')).not.toBeNull();
  });

  it('returns an error when the channel handle is missing', () => {
    expect(validateChannelUrl('https://www.youtube.com/@')).not.toBeNull();
  });

  it('returns an error for a non-YouTube URL', () => {
    expect(validateChannelUrl('https://example.com/@channel')).not.toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validateChannelUrl('')).not.toBeNull();
  });
});

describe('splitList', () => {
  it('splits a comma-separated string into trimmed values', () => {
    expect(splitList('diet, carnivore, basics')).toEqual(['diet', 'carnivore', 'basics']);
  });

  it('filters out empty segments from extra commas', () => {
    expect(splitList('diet,,carnivore,')).toEqual(['diet', 'carnivore']);
  });

  it('returns an empty array for an empty string', () => {
    expect(splitList('')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only string', () => {
    expect(splitList('   ')).toEqual([]);
  });

  it('trims whitespace around each item', () => {
    expect(splitList('  Jan Kowalski  ,  Anna Nowak  ')).toEqual(['Jan Kowalski', 'Anna Nowak']);
  });

  it('handles a single item without commas', () => {
    expect(splitList('carnivore')).toEqual(['carnivore']);
  });
});
