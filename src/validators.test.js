import { describe, it, expect } from 'vitest';
import { validateVideoUrl, validateChannelUrl, normalizeVideoUrl, normalizeChannelUrl, splitList } from './validators.js';

describe('validateVideoUrl', () => {
  it('returns null for a valid YouTube watch URL', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('accepts an 11-character video ID', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=12345678901')).toBeNull();
  });

  it('accepts a youtu.be shortlink', () => {
    expect(validateVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBeNull();
  });

  it('accepts a youtu.be shortlink with tracking params', () => {
    expect(validateVideoUrl('https://youtu.be/ZWvJkq3XqqA?si=pZv96lCDSMtRRGsh')).toBeNull();
  });

  it('accepts a YouTube watch URL with tracking params', () => {
    expect(validateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=12345')).toBeNull();
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

describe('normalizeVideoUrl', () => {
  it('returns canonical URL for a valid watch link', () => {
    const result = normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('strips tracking params from watch URL', () => {
    const result = normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=12345&t=10');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('converts youtu.be to canonical watch URL', () => {
    const result = normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('strips params from youtu.be URL', () => {
    const result = normalizeVideoUrl('https://youtu.be/ZWvJkq3XqqA?si=pZv96lCDSMtRRGsh');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/watch?v=ZWvJkq3XqqA');
  });

  it('returns error for short video ID', () => {
    const result = normalizeVideoUrl('https://youtu.be/short');
    expect(result.error).not.toBeNull();
    expect(result.normalized).toBeNull();
  });
});

describe('validateChannelUrl', () => {
  it('returns null for a valid YouTube @-handle URL', () => {
    expect(validateChannelUrl('https://www.youtube.com/@MyChannel')).toBeNull();
  });

  it('accepts a channel URL without www', () => {
    expect(validateChannelUrl('https://youtube.com/@MyChannel')).toBeNull();
  });

  it('accepts a channel URL with tracking params', () => {
    expect(validateChannelUrl('https://www.youtube.com/@infouprawa5321?si=-P7YviRue4LI_DOS')).toBeNull();
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

describe('normalizeChannelUrl', () => {
  it('returns canonical URL for a valid channel URL with www', () => {
    const result = normalizeChannelUrl('https://www.youtube.com/@MyChannel');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/@MyChannel');
  });

  it('adds www to canonical URL from non-www variant', () => {
    const result = normalizeChannelUrl('https://youtube.com/@MyChannel');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/@MyChannel');
  });

  it('strips tracking params from channel URL', () => {
    const result = normalizeChannelUrl('https://www.youtube.com/@infouprawa5321?si=-P7YviRue4LI_DOS');
    expect(result.error).toBeNull();
    expect(result.normalized).toBe('https://www.youtube.com/@infouprawa5321');
  });

  it('returns error for missing handle', () => {
    const result = normalizeChannelUrl('https://www.youtube.com/@');
    expect(result.error).not.toBeNull();
    expect(result.normalized).toBeNull();
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
