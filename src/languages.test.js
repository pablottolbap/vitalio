import { describe, it, expect } from 'vitest';
import { languageFlag, languageName, LANGUAGE_FLAGS } from './languages.js';

describe('languageFlag', () => {
  it('returns the Polish flag emoji for PL', () => {
    expect(languageFlag('PL')).toBe(LANGUAGE_FLAGS.PL);
  });

  it('returns the UK flag emoji for EN', () => {
    expect(languageFlag('EN')).toBe(LANGUAGE_FLAGS.EN);
  });

  it('returns a white flag for unknown codes', () => {
    expect(languageFlag('XX')).toBe('🏳️');
    expect(languageFlag('')).toBe('🏳️');
    expect(languageFlag(undefined)).toBe('🏳️');
  });
});

describe('languageName', () => {
  it('returns Polish name of Polish in Polish UI', () => {
    expect(languageName('PL', 'pl')).toBe('Polski');
  });

  it('returns Polish name of Polish in English UI', () => {
    expect(languageName('PL', 'en')).toBe('Polish');
  });

  it('returns English name in Polish UI', () => {
    expect(languageName('EN', 'pl')).toBe('Angielski');
  });

  it('returns English name in English UI', () => {
    expect(languageName('EN', 'en')).toBe('English');
  });

  it('falls back to the code for unknown language', () => {
    expect(languageName('XX', 'pl')).toBe('XX');
    expect(languageName('XX', 'en')).toBe('XX');
  });
});
