import { describe, it, expect } from 'vitest';
import { getTagSuggestions, applyTagSuggestion } from './tagAutocomplete';

describe('tagAutocomplete', () => {
  const allTags = ['diet', 'nutrition', 'exercise', 'sleep', 'carnivore', 'training', 'fasting'];

  describe('getTagSuggestions', () => {
    it('suggests existing tags matching current incomplete tag', () => {
      const result = getTagSuggestions('tra', allTags);
      expect(result.suggestions).toContain('training');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('allows custom tags not in database', () => {
      const result = getTagSuggestions('mycustomtag', allTags);
      // No suggestions, but user can still type custom tag
      expect(result.suggestions).toEqual([]);
      expect(result.currentInput).toBe('mycustomtag');
    });

    it('handles comma-separated completed tags', () => {
      const result = getTagSuggestions('diet, nut', allTags);
      expect(result.completedTags).toEqual(['diet']);
      expect(result.currentInput).toBe('nut');
      expect(result.suggestions).toContain('nutrition');
    });

    it('excludes already-used tags from suggestions', () => {
      const result = getTagSuggestions('diet, tra', allTags);
      expect(result.suggestions).not.toContain('diet');
      expect(result.suggestions).toContain('training');
    });

    it('returns empty suggestions for unmatched input (but input is still valid)', () => {
      const result = getTagSuggestions('xyz', allTags);
      expect(result.suggestions).toEqual([]);
      expect(result.currentInput).toBe('xyz'); // Custom tag still allowed
    });

    it('case-insensitive matching', () => {
      const result = getTagSuggestions('DIE', allTags);
      expect(result.suggestions).toContain('diet');
    });

    it('returns empty suggestions when input is empty', () => {
      const result = getTagSuggestions('', allTags);
      expect(result.currentInput).toBe('');
      expect(result.suggestions).toEqual([]);
    });

    it('handles trailing comma and space', () => {
      const result = getTagSuggestions('diet, ', allTags);
      expect(result.completedTags).toEqual(['diet']);
      expect(result.currentInput).toBe('');
    });

    it('allows mixing custom and existing tags', () => {
      const result = getTagSuggestions('diet, mycustom, ex', allTags);
      expect(result.completedTags).toEqual(['diet', 'mycustom']);
      expect(result.currentInput).toBe('ex');
      expect(result.suggestions).toContain('exercise');
    });
  });

  describe('applyTagSuggestion', () => {
    it('replaces incomplete tag with suggestion', () => {
      const result = applyTagSuggestion('tra', 'training');
      expect(result).toBe('training, ');
    });

    it('replaces last tag in list', () => {
      const result = applyTagSuggestion('diet, tra', 'training');
      expect(result).toBe('diet, training, ');
    });

    it('adds suggestion when input is empty', () => {
      const result = applyTagSuggestion('', 'diet');
      expect(result).toBe('diet, ');
    });

    it('handles multiple completed tags', () => {
      const result = applyTagSuggestion('diet, exercise, fa', 'fasting');
      expect(result).toBe('diet, exercise, fasting, ');
    });

    it('allows suggestion of custom tag names', () => {
      const result = applyTagSuggestion('diet, ', 'newcustomtag');
      expect(result).toBe('diet, newcustomtag, ');
    });
  });
});
